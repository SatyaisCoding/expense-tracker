import type { Metadata } from "next";
import ExpenseApp from "@/components/ExpenseApp";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your personal expenses with idempotent submissions and category filtering.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            💰 Expense Tracker
          </h1>
          <p className="text-sm text-slate-500">
            Track your spending — submissions are idempotent, amounts are exact.
          </p>
        </div>

        <ExpenseApp />
      </div>
    </main>
  );
}
