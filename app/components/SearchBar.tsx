"use client";

import { useEffect, useRef, useState } from "react";
import type { Category } from "@/app/types/product";

interface SearchBarProps {
  query: string;
  debouncedQuery: string;
  categories: Category[];
  selectedCategory: Category | null;
  searching: boolean;
  onQueryChange: (value: string) => void;
  onSelectCategory: (cat: Category) => void;
  onClear: () => void;
}

export default function SearchBar({
  query,
  debouncedQuery,
  categories,
  selectedCategory,
  searching,
  onQueryChange,
  onSelectCategory,
  onClear,
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const matchingCategories = query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const handleInputChange = (value: string) => {
    onQueryChange(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleSelectCategory = (cat: Category) => {
    onSelectCategory(cat);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onClear();
    setShowSuggestions(false);
  };

  const isDebouncing = !selectedCategory && query !== debouncedQuery;

  return (
    <div ref={wrapperRef} className="relative max-w-md mx-auto">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => { if (query.trim() && !selectedCategory) setShowSuggestions(true); }}
        placeholder="Search products or categories…"
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
      />

      {/* Spinner */}
      {isDebouncing || searching ? (
        <span className="absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 animate-spin text-sky-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </span>
      ) : query ? (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}

      {/* Category typeahead dropdown */}
      {showSuggestions && matchingCategories.length > 0 && !selectedCategory && (
        <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <li className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
            Categories
          </li>
          {matchingCategories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => handleSelectCategory(cat)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition hover:bg-sky-50 hover:text-sky-600"
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
