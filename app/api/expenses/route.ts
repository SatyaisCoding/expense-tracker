import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  CreateExpenseSchema,
  GetExpensesQuerySchema,
} from "@/lib/validators";
import { Prisma } from "@prisma/client";

// POST /api/expenses — idempotent expense creation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { idempotencyKey, title, amountCents, category, date } = parsed.data;

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
    } catch (err) {
      // P2002 = Unique constraint violation — idempotent retry
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const existing = await prisma.expense.findUnique({
          where: { idempotencyKey },
        });
        return NextResponse.json(existing, { status: 200 });
      }
      throw err;
    }
  } catch (err) {
    console.error("[POST /api/expenses]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/expenses?category=Food&sort=date_desc
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const rawQuery = {
      category: searchParams.get("category") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    };

    const parsed = GetExpensesQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query params", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { category, sort } = parsed.data;

    const expenses = await prisma.expense.findMany({
      where: category ? { category } : undefined,
      orderBy: { date: sort === "date_asc" ? "asc" : "desc" },
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (err) {
    console.error("[GET /api/expenses]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
