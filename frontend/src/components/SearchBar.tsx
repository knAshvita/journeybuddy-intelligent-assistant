"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-5 rounded-2xl border shadow-lg backdrop-blur-md bg-[#FAF7F0]/85 dark:bg-slate-900/80 border-[#D9CBB0] dark:border-slate-700">
      <label
        htmlFor="search-input"
        className="block text-xs uppercase tracking-wider font-semibold mb-2 text-[#6F614C] dark:text-emerald-400"
      >
        Client Component: Dynamic Query Input
      </label>
      <div className="flex gap-2 relative">
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask JourneyBuddy or search knowledge base..."
          className="flex-1 rounded-full px-5 py-3 text-sm border shadow-inner focus:outline-none focus:ring-2 bg-white/90 dark:bg-slate-800/90 text-[#3D332A] dark:text-slate-100 placeholder-[#9C8F7E] dark:placeholder-slate-400 border-[#D0C0A5] dark:border-slate-600 focus:ring-[#8C7A60] dark:focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => alert(`Query staged for backend dispatch: "${query}"`)}
          title="Dispatch Query"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl hover:scale-125 transition-transform"
        >
          🧭
        </button>
      </div>
      {query && (
        <p className="mt-2 text-xs text-[#807058] dark:text-slate-400">
          Current state: <span className="font-mono font-medium text-[#B87A28] dark:text-emerald-300">{query}</span>
        </p>
      )}
    </div>
  );
}