"use client";

import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDispatch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setResults([]);

    try {
      const res = await fetch("http://localhost:5000/api/destinations/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (res.ok && data.results) {
        setResults(data.results);
      } else {
        setErrorMsg(data.error || "Failed to retrieve results");
      }
    } catch {
      setErrorMsg("Backend gateway is offline. Make sure port 5000 is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto -mt-12 z-20 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-4">
        <label
          htmlFor="search-input"
          className="block text-xs uppercase tracking-wider font-semibold mb-2 text-[#1B3B36] dark:text-emerald-400"
        >
          Dynamic AI Vector Search (MongoDB Atlas)
        </label>
        <div className="flex gap-2">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDispatch()}
            placeholder="Try searching 'snowy mountain chalet' or 'tropical beach'..."
            className="flex-1 rounded-xl px-5 py-3 text-sm border focus:outline-none focus:ring-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-[#1B3B36]"
          />
          <button
            type="button"
            onClick={handleDispatch}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#1B3B36] hover:bg-[#152e2a] text-white font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {errorMsg && (
          <p className="mt-3 text-xs font-mono text-red-500">{errorMsg}</p>
        )}

        {results.length > 0 && (
          <div className="mt-4 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
              Retrieved from MongoDB Atlas ($vectorSearch):
            </span>
            {results.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    Match: {Math.round(item.score * 100)}%
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    ${item.price_usd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}