"use client";

import { CATEGORIES } from "@/lib/validators";

type Props = {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
};

export default function FilterBar({ selectedCategory, onCategoryChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-600">Filter:</span>
      <button
        onClick={() => onCategoryChange("")}
        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          selectedCategory === ""
            ? "bg-indigo-600 text-white shadow-sm"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === cat
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
