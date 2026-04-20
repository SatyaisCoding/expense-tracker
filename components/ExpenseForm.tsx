"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ExpenseFormSchema, CATEGORIES } from "@/lib/validators";
import { toCents } from "@/lib/money";
import type { Expense } from "@/lib/types";

type Props = {
  onExpenseAdded: (expense: Expense) => void;
};

type FieldErrors = Partial<Record<"title" | "amount" | "category" | "date", string>>;

export default function ExpenseForm({ onExpenseAdded }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());

  const validate = useCallback(() => {
    const result = ExpenseFormSchema.safeParse({ title, amount, category, date });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setFieldErrors({
        title: flat.title?.[0],
        amount: flat.amount?.[0],
        category: flat.category?.[0],
        date: flat.date?.[0],
      });
      return false;
    }
    setFieldErrors({});
    return true;
  }, [title, amount, category, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          title: title.trim(),
          amountCents: toCents(amount),
          category,
          date: new Date(date).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save expense");
      }

      const newExpense: Expense = await res.json();
      onExpenseAdded(newExpense);

      // Reset form and generate a new idempotency key only on success
      setTitle("");
      setAmount("");
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().split("T")[0]);
      setIdempotencyKey(uuidv4());
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span className="text-red-500">⚠</span> {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lunch at Café"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
              fieldErrors.title
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-slate-300 focus:ring-indigo-300 bg-white"
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
              fieldErrors.amount
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-slate-300 focus:ring-indigo-300 bg-white"
            }`}
          />
          {fieldErrors.amount && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition ${
              fieldErrors.date
                ? "border-red-400 focus:ring-red-300 bg-red-50"
                : "border-slate-300 focus:ring-indigo-300 bg-white"
            }`}
          />
          {fieldErrors.date && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
          )}
        </div>

        {/* Category */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-4 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving…
          </>
        ) : (
          "Add Expense"
        )}
      </button>
    </form>
  );
}
