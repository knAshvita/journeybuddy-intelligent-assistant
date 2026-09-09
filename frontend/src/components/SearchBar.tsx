"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full max-w-xl mx-auto my-4 p-4 bg-white/5 border border-slate-700 rounded-lg shadow-sm">
      <label htmlFor="search-input" className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
        Client Component: Dynamic Query Input
      </label>
      <div className="flex gap-2">
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask JourneyBuddy or search knowledge base..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => alert(`Query staged for backend dispatch: "${query}"`)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Dispatch
        </button>
      </div>
      {query && (
        <p className="mt-2 text-xs text-slate-400">
          Current state: <span className="text-blue-400 font-mono">{query}</span>
        </p>
      )}
    </div>
  );
}