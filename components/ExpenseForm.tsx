"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ExpenseFormSchema, CATEGORIES } from "@/lib/validators";
import { toCents } from "@/lib/money";
import type { Expense } from "@/lib/types";

type Props = {
  onExpenseAdded: (expense: Expense) => void;
};

export default function ExpenseForm({ onExpenseAdded }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // We keep the idempotency key in state to survive re-renders,
  // but we ONLY cycle it after a successful submission.
  const [idempotencyKey, setIdempotencyKey] = useState(() => uuidv4());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const result = ExpenseFormSchema.safeParse({ title, amount, category, date });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setErrors({});
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong saving your expense");

      onExpenseAdded(data);

      // Clean up for next entry
      setTitle("");
      setAmount("");
      setIdempotencyKey(uuidv4()); 
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (key: string) => `
    w-full rounded-lg border px-3 py-2.5 text-sm transition-all outline-none
    ${errors[key] 
      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" 
      : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"}
  `;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {serverError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
          <strong>Error:</strong> {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What was this for?"
            className={inputClasses("title")}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputClasses("amount")}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses("date")}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClasses("category")}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
      >
        {isSubmitting ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}
