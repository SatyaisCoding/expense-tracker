"use client";

import { useCallback, useEffect, useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import FilterBar from "@/components/FilterBar";
import type { Expense } from "@/lib/types";

export default function ExpenseApp() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async (category: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({ sort: "date_desc" });
      if (category) params.set("category", category);
      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error("Failed to load expenses");
      const data: Expense[] = await res.json();
      setExpenses(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(selectedCategory);
  }, [selectedCategory, fetchExpenses]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  const handleExpenseAdded = (newExpense: Expense) => {
    // Optimistic prepend — keep the list sorted newest first
    if (!selectedCategory || newExpense.category === selectedCategory) {
      setExpenses((prev) => {
        // Prevent duplicates (idempotent retry may return an existing expense)
        if (prev.some((e) => e.id === newExpense.id)) return prev;
        return [newExpense, ...prev];
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Expense Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <span className="text-indigo-500">+</span> Add New Expense
        </h2>
        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
      </div>

      {/* Expense List Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Your Expenses
          </h2>
        </div>

        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {fetchError ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ⚠ {fetchError} —{" "}
            <button
              onClick={() => fetchExpenses(selectedCategory)}
              className="underline font-medium hover:text-red-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <ExpenseList expenses={expenses} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
