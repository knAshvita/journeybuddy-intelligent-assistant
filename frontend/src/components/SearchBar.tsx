"use client";

import { useState } from "react";

export interface DestinationResult {
  title: string;
  category: string;
  price_usd: number;
  description: string;
  score?: number;
  source?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DestinationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sourceNote, setSourceNote] = useState("");

  const handleDispatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResults([]);
    setSourceNote("");

    try {
      const res = await fetch("http://localhost:5000/api/destinations/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.results) {
        setResults(data.results);
        if (data.source) {
          setSourceNote(
            data.source === "pinecone_internal_knowledge"
              ? "🌲 Pinecone Vector DB (Internal Knowledge)"
              : "🌐 Dynamic Live Retrieval (Saved to Pinecone & MongoDB)"
          );
        }
      } else {
        setErrorMsg(data?.error || `Search failed with status ${res.status}`);
      }
    } catch (err: any) {
      console.error("Search fetch error:", err);
      setErrorMsg("Backend gateway is offline. Ensure port 5000 is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto -mt-12 z-30 px-4">
      <form
        onSubmit={handleDispatch}
        className="bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur-md p-4 rounded-3xl border border-stone-700/60 shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            Dynamic AI Vector Search (Pinecone + Live Fallback)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any destination (e.g. Places to visit in Gujrat, Karkala, Alps...)"
            className="flex-1 bg-stone-800/80 border border-stone-700 text-stone-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition placeholder:text-stone-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-lg transition active:scale-95 cursor-pointer"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {sourceNote && (
          <div className="text-[11px] font-mono tracking-wider text-stone-400 px-2 pt-1">
            RETRIEVED FROM: <span className="text-emerald-300 font-semibold">{sourceNote}</span>
          </div>
        )}

        {errorMsg && (
          <p className="mt-2 text-xs font-mono text-rose-400 px-2">{errorMsg}</p>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 hover:border-emerald-500/50 transition duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    Match: {Math.round((item.score || 1) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-stone-300 line-clamp-2 mb-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span className="capitalize bg-stone-700/50 px-2 py-0.5 rounded text-stone-300">
                    {item.category}
                  </span>
                  <span className="font-semibold text-stone-200">
                    ${item.price_usd}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}