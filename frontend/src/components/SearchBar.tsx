"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleDispatch = () => {
    if (!query.trim()) return;
    alert(`Query staged for backend dispatch: "${query}"`);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto -mt-12 z-20 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4">
        <label
          htmlFor="search-input"
          className="block text-xs uppercase tracking-wider font-semibold mb-2 text-[#D84E55] dark:text-emerald-400"
        >
          Client Component: Dynamic Query Input
        </label>
        <div className="flex gap-2 relative">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDispatch()}
            placeholder="Ask JourneyBuddy or search knowledge base..."
            className="flex-1 rounded-xl px-5 py-3 text-sm border shadow-inner focus:outline-none focus:ring-2 bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 border-slate-200 dark:border-slate-700 focus:ring-[#D84E55]"
          />
          <button
            type="button"
            onClick={handleDispatch}
            title="Dispatch Query"
            className="px-6 py-3 rounded-xl bg-[#D84E55] hover:bg-[#C03E45] text-white font-bold text-sm shadow-md active:scale-95"
          >
            Search
          </button>
        </div>
        {query && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Current state:{" "}
            <span className="font-mono font-medium text-[#D84E55] dark:text-emerald-300">
              {query}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}