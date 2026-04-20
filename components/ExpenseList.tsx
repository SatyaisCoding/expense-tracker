"use client";

import { fromCents } from "@/lib/money";
import type { Expense } from "@/lib/types";

type Props = {
  expenses: Expense[];
  isLoading: boolean;
};

const CATEGORY_STYLES: Record<string, string> = {
  Food: "bg-orange-50 text-orange-700 border-orange-100",
  Transport: "bg-blue-50 text-blue-700 border-blue-100",
  Housing: "bg-purple-50 text-purple-700 border-purple-100",
  Entertainment: "bg-pink-50 text-pink-700 border-pink-100",
  Healthcare: "bg-green-50 text-green-700 border-green-100",
  Shopping: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Education: "bg-cyan-50 text-cyan-700 border-cyan-100",
  Other: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function ExpenseList({ expenses, isLoading }: Props) {
  const total = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  if (isLoading) return <LoadingState />;

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400">No expenses found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(e.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${CATEGORY_STYLES[e.category] || CATEGORY_STYLES.Other}`}>
                    {e.category.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                  {fromCents(e.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pr-2">
        <div className="flex items-center gap-4 px-5 py-3 bg-slate-900 text-white rounded-xl shadow-lg">
          <span className="text-xs text-slate-400 font-medium">TOTAL ({expenses.length})</span>
          <span className="text-xl font-black">{fromCents(total)}</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl" />
      ))}
    </div>
  );
}
