"use client";

import { useEffect, useState, useCallback } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import FilterBar from "@/components/FilterBar";
import type { Expense } from "@/lib/types";

export default function ExpenseApp() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = cat ? `/api/expenses?category=${cat}` : "/api/expenses";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load data");
      setExpenses(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(category);
  }, [category, loadData]);

  const onAdd = (newExp: Expense) => {
    // Only prepend if the new item matches the current filter
    if (!category || newExp.category === category) {
      setExpenses(prev => {
        // Double-check for duplicate IDs (though idempotency key handles this on backend)
        if (prev.find(e => e.id === newExp.id)) return prev;
        return [newExp, ...prev];
      });
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <header className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Add Transaction</h2>
          <p className="text-xs text-slate-500">Record your spending — no more floating point errors.</p>
        </header>
        <ExpenseForm onExpenseAdded={onAdd} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
          <FilterBar 
            selectedCategory={category} 
            onCategoryChange={setCategory} 
          />
        </div>

        {error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => loadData(category)} className="font-bold underline">Retry</button>
          </div>
        ) : (
          <ExpenseList expenses={expenses} isLoading={loading} />
        )}
      </section>
    </div>
  );
}
