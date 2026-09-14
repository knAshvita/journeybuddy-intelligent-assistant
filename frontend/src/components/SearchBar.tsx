"use client";

import { useState } from "react";
import ChatModal from "./ChatModal";

interface PlaceItem {
  title: string;
  category: string;
  price_usd: number;
  description: string;
  source: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleOpenPlaceChat = (placeName: string, category: string = "") => {
    setSelectedPlace(placeName);
    setSelectedCategory(category);
    setChatOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setPlaces([]);

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
        // Only use the structured places list directly from verified MongoDB/Pinecone/Web
        setPlaces(data.places || []);
      } else {
        setError(data.error || "Failed to retrieve travel results.");
      }
    } catch (err: any) {
      setError(err.message || "Cannot connect to Express Gateway (port 5000).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Top AI Travel Assistant Entry Banner */}
      <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-[#0F2420] border border-emerald-900/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h2 className="font-serif font-bold text-lg text-white">
              JourneyBuddy AI Travel Assistant
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#08523A] text-emerald-300 border border-emerald-700/50">
              Interactive
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300">
            Ask any question about your travel journey — budget estimates, affordable lodges, transport routes, or customized itineraries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenPlaceChat("")}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0B6E4F] to-[#08523A] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>💬 Open Assistant</span>
          <span>→</span>
        </button>
      </div>

      {/* Main Destination Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center shadow-2xl rounded-full overflow-hidden border border-emerald-900/40 bg-[#0F2420]"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a destination (e.g. 'Mangalore', 'Karkala', 'Goa', 'Paris')..."
          className="w-full px-6 py-4 text-sm sm:text-base outline-none bg-transparent text-white placeholder-stone-400 font-sans"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-[#0B6E4F] hover:bg-[#08523A] text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin">⚡</span>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-6 p-5 rounded-2xl bg-[#0F2420] border border-emerald-800/60 text-center animate-pulse shadow-lg">
          <p className="text-emerald-400 font-medium text-xs sm:text-sm font-mono">
            ⚡ Consulting Pinecone &amp; MongoDB Atlas • Retrieving verified landmarks...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs sm:text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Clean Grid of Individual Destination Boxes */}
      {places.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white flex items-center gap-2">
              <span>📍</span>
              <span>Places to Visit ({places.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">
              Click &quot;Know More&quot; on any card to ask AI questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#142E2A] border border-emerald-900/50 hover:border-emerald-500/60 transition-all duration-200 shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#08523A] text-emerald-300 font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-700/50">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors leading-snug">
                        {place.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0B6E4F]/40 text-emerald-300 border border-emerald-600/30 shrink-0">
                      {place.category}
                    </span>
                  </div>

                  {/* Concise 1-2 sentence description */}
                  <p className="text-xs text-stone-300 leading-relaxed pl-9 mb-4">
                    {place.description}
                  </p>
                </div>

                {/* Bottom Row inside Box: Know More Button & Source Badge */}
                <div className="flex items-center justify-between pt-3 border-t border-emerald-900/30 pl-9">
                  <span className="text-[10px] font-mono text-stone-400">
                    {place.source?.includes("internal") || place.source?.includes("Pinecone")
                      ? "🌲 Verified DB"
                      : "🌐 Verified Web"}
                  </span>

                  {/* Know More action opens conversational chatbot specifically for this place */}
                  <button
                    type="button"
                    onClick={() => handleOpenPlaceChat(place.title, place.category)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#0B6E4F] to-[#08523A] hover:brightness-110 text-white border border-emerald-500/50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
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

      {/* Floating Bottom AI Assistant Button */}
      <button
        onClick={() => handleOpenPlaceChat("")}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#0B6E4F] hover:bg-[#08523A] text-white shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Open Travel Assistant"
      >
        <span className="text-xl">✨</span>
        <span className="text-xs font-bold font-sans tracking-wide pr-1 hidden sm:inline">
          Ask Travel AI
        </span>
      </button>

      {/* Chat Modal with Place-Specific Prompts */}
      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialDestination={selectedPlace}
        initialCategory={selectedCategory}
      />
    </div>
  );
}