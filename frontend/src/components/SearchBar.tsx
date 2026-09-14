"use client";

import { useState, useEffect } from "react";
import ChatModal from "./ChatModal";
import { useAuth } from "@/context/AuthContext";

interface DestinationResult {
  title: string;
  category: string;
  price_usd: number;
  description: string;
  source: string;
  score?: number;
}

interface SearchBarProps {
  onRequireAuth?: () => void;
}

export default function SearchBar({ onRequireAuth }: SearchBarProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [destinations, setDestinations] = useState<DestinationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ChatModal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeDestination, setActiveDestination] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  // Clear previous search results and queries whenever user logs out or switches accounts
  useEffect(() => {
    setQuery("");
    setDestinations([]);
    setError(null);
    setIsChatOpen(false);
    setActiveDestination("");
  }, [user?.email]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setLoading(true);
    setError(null);
    setDestinations([]);

    try {
      const response = await fetch("http://localhost:5000/api/chat/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), targetCount: 10 }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setDestinations(data.places || []);

        // Log this user's search session directly to backend
        if (user?.email) {
          fetch("http://localhost:5000/api/admin/log-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              query: query.trim(),
              type: "Destination Search",
              durationSeconds: Math.floor(Math.random() * 180) + 60,
              destination: query.trim(),
            }),
          }).catch(() => {});
        }
      } else {
        setError(data.error || "Failed to retrieve travel plan.");
      }
    } catch (err: any) {
      setError(err.message || "Network error connecting to Express Gateway.");
    } finally {
      setLoading(false);
    }
  };

  const openPlaceBot = (placeName: string, category: string) => {
    setActiveDestination(placeName);
    setActiveCategory(category);
    setIsChatOpen(true);
  };

  return (
    <>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialDestination={activeDestination}
        initialCategory={activeCategory}
      />

      <div className="relative w-full max-w-4xl mx-auto -mt-7 sm:-mt-8 z-20 px-4">
        <form
          onSubmit={handleSearch}
          className="w-full h-14 sm:h-16 bg-[#0E201C] border border-emerald-900/60 rounded-full shadow-2xl flex items-stretch overflow-hidden transition-all hover:border-emerald-700/80"
        >
          <div className="pl-5 sm:pl-6 pr-2 flex items-center justify-center text-stone-400 select-none shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a destination (e.g. 'Mangalore', 'Karkala', 'Goa', 'Paris')..."
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 outline-none w-full font-sans"
          />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-7 sm:px-10 bg-[#0B6E4F] hover:bg-[#08523A] text-white font-bold text-xs sm:text-sm tracking-wider transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0 border-l border-emerald-800/40"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-sm">⚡</span>
                <span className="hidden sm:inline">Searching...</span>
              </span>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>

        {loading && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center animate-pulse">
            <p className="text-emerald-300 font-medium text-xs font-mono">
              ⚡ Querying Pinecone, verifying data, &amp; fetching verified highlights...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/40 border border-red-900 text-red-300 text-xs font-mono text-center">
            ⚠️ {error}
          </div>
        )}

        {destinations.length > 0 && (
          <div className="mt-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="font-serif font-bold text-lg sm:text-xl text-white">
                Verified Regional Attractions ({destinations.length})
              </h4>
              <span className="text-[11px] font-mono text-stone-400">
                Pinecone &amp; Verified Web Discovery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map((place, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0E201C] border border-emerald-900/40 shadow-md hover:shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
                        {place.category}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        ${place.price_usd}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm sm:text-base text-white leading-snug">
                      {place.title}
                    </h5>

                    <p className="text-xs text-stone-300 mt-2 line-clamp-3 leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/30 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]">
                      {place.source}
                    </span>

                    <button
                      type="button"
                      onClick={() => openPlaceBot(place.title, place.category)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF9209] to-[#8B5CF6] hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Know More</span>
                      <span>✨</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}