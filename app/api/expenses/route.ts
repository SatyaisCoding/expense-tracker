import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateExpenseSchema, GetExpensesQuerySchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { idempotencyKey, title, amountCents, category, date } = result.data;

    try {
      const expense = await prisma.expense.create({
        data: {
          idempotencyKey,
          title,
          amountCents,
          category,
          date: new Date(date),
        },
      });

      return NextResponse.json(expense, { status: 201 });
    } catch (err: any) {
      // Check for unique constraint violation (idempotent retry)
      if (err?.code === "P2002") {
        const existing = await prisma.expense.findUnique({ where: { idempotencyKey } });
        return NextResponse.json(existing, { status: 200 });
      }
      throw err;
    }
  } catch (err) {
    console.error("[EXPENSES_POST_ERROR]", err);
    return NextResponse.json({ error: "Could not save expense" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = {
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    const result = GetExpensesQuerySchema.safeParse(query);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { category, sort } = result.data;

    const expenses = await prisma.expense.findMany({
      where: category ? { category } : undefined,
      orderBy: { date: sort === "date_asc" ? "asc" : "desc" },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    console.error("[EXPENSES_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}
