"use client";

import { fromCents } from "@/lib/money";
import type { Expense } from "@/lib/types";

type Props = {
  expenses: Expense[];
  isLoading: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "bg-orange-100 text-orange-700",
  Transport: "bg-blue-100 text-blue-700",
  Housing: "bg-purple-100 text-purple-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Healthcare: "bg-green-100 text-green-700",
  Shopping: "bg-yellow-100 text-yellow-700",
  Education: "bg-cyan-100 text-cyan-700",
  Other: "bg-slate-100 text-slate-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function ExpenseList({ expenses, isLoading }: Props) {
  // Running total computed on the frontend from the filtered list (integer addition — no float issues)
  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <TableHead />
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400 bg-white rounded-xl border border-slate-200 shadow-sm">
        <span className="text-5xl">💸</span>
        <p className="text-sm font-medium">No expenses yet</p>
        <p className="text-xs">Add one using the form above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <TableHead />
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  {expense.title}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {formatDate(expense.date)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      CATEGORY_COLORS[expense.category] ?? CATEGORY_COLORS.Other
                    }`}
                  >
                    {expense.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                  {fromCents(expense.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Running Total */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-3 rounded-xl bg-indigo-50 border border-indigo-100 px-5 py-3 shadow-sm">
          <span className="text-sm font-medium text-indigo-600">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} — Running Total
          </span>
          <span className="text-xl font-bold text-indigo-700 tabular-nums">
            {fromCents(totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TableHead() {
  return (
    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
      <th className="px-4 py-3">Title</th>
      <th className="px-4 py-3">Date</th>
      <th className="px-4 py-3">Category</th>
      <th className="px-4 py-3 text-right">Amount</th>
    </tr>
  );
}
