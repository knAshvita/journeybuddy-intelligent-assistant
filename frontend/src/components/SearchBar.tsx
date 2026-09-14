"use client";

import { useState } from "react";

interface DestinationItem {
  number: string;
  name: string;
  category: string;
  overview: string;
  provenance: string;
}

interface BackendPlace {
  title: string;
  category: string;
  price_usd: number;
  description: string;
  source: string;
  score?: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiIntro, setAiIntro] = useState<string | null>(null);
  const [parsedDestinations, setParsedDestinations] = useState<DestinationItem[]>([]);
  const [rawPlaces, setRawPlaces] = useState<BackendPlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper parser: converts Markdown text output from Gemini into structured objects
  const parseGeminiResponse = (text: string) => {
    const lines = text.split("\n");
    let introText = "";
    const items: DestinationItem[] = [];
    let currentItem: Partial<DestinationItem> | null = null;

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("---")) continue;

      // Matches numbered points: "1. **Panambur Beach**" or "### 1. Panambur Beach"
      const numberMatch = line.match(/^(?:###\s*)?(\d+)\.\s*\*{0,2}(.*?)\*{0,2}$/);

      if (numberMatch) {
        if (currentItem && currentItem.name) {
          items.push(currentItem as DestinationItem);
        }
        currentItem = {
          number: numberMatch[1],
          name: numberMatch[2].replace(/\*\*/g, "").trim(),
          category: "Attraction",
          overview: "",
          provenance: "Verified Knowledge Base",
        };
      } else if (currentItem) {
        if (line.includes("Category") || line.includes("Theme")) {
          currentItem.category = line.split(":")[1]?.replace(/\*\*/g, "").trim() || "Attraction";
        } else if (line.includes("Overview") || line.includes("Highlights")) {
          currentItem.overview = line.split(":")[1]?.replace(/\*\*/g, "").trim() || "";
        } else if (line.includes("Source") || line.includes("Provenance")) {
          currentItem.provenance = line.split(":")[1]?.replace(/\*\*/g, "").trim() || "Internal";
        } else if (!currentItem.overview) {
          currentItem.overview = line.replace(/^-\s*/, "").replace(/\*\*/g, "").trim();
        }
      } else {
        introText += line + " ";
      }
    }

    if (currentItem && currentItem.name) {
      items.push(currentItem as DestinationItem);
    }

    return { intro: introText.trim(), items };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAiIntro(null);
    setParsedDestinations([]);
    setRawPlaces([]);

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

      if (data.success && data.answer) {
        const { intro, items } = parseGeminiResponse(data.answer);
        setAiIntro(intro);
        setParsedDestinations(items);
        setRawPlaces(data.places || []);
      } else {
        setError(data.error || "Failed to retrieve travel itinerary.");
      }
    } catch (err: any) {
      setError(err.message || "Network error connecting to Express Gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center shadow-2xl rounded-full overflow-hidden border border-emerald-900/40 bg-[#0F2420]"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask for any destination (e.g. 'places to visit in Mangalore' or 'Goa')..."
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
        <div className="mt-8 p-6 rounded-2xl bg-[#0F2420] border border-emerald-800/60 text-center animate-pulse shadow-lg">
          <p className="text-emerald-400 font-medium text-sm font-mono">
            🤖 LangChain Hybrid RAG active: Querying Pinecone, synthesizing verified web context, and formatting results...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* AI Structured Guide Container */}
      {(aiIntro || parsedDestinations.length > 0) && (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-[#0F2420] border border-emerald-900/40 shadow-xl space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-900/40">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">✨</span>
              <h3 className="font-serif font-bold text-xl text-white tracking-wide">
                JourneyBuddy AI Itinerary &amp; Guide
              </h3>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-mono px-3 py-1 rounded-full bg-[#08523A] text-emerald-300 border border-emerald-700/60 font-semibold">
              LangChain RAG • Gemini 3.6 Flash
            </span>
          </div>

          {/* AI Intro Summary */}
          {aiIntro && (
            <p className="text-sm text-stone-300 leading-relaxed italic bg-black/20 p-4 rounded-2xl border border-emerald-950">
              &ldquo;{aiIntro}&rdquo;
            </p>
          )}

          {/* Structured Cards List */}
          <div className="space-y-4">
            {parsedDestinations.map((place, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#142E2A] border border-emerald-900/40 hover:border-emerald-600/60 transition-all duration-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#08523A] text-emerald-300 font-mono font-black flex items-center justify-center text-sm shrink-0 border border-emerald-700/50">
                    {place.number || idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                        {place.name}
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0B6E4F]/40 text-emerald-300 border border-emerald-600/30">
                        {place.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      {place.overview || "Curated destination highlights and regional travel experience."}
                    </p>
                  </div>
                </div>

                {/* Provenance Tag */}
                <div className="sm:text-right shrink-0 pl-13 sm:pl-0">
                  <span className="inline-block text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/30 text-stone-400 border border-emerald-950">
                    {place.provenance.includes("Pinecone") || place.provenance.includes("Internal")
                      ? "🌲 Pinecone / Mongo"
                      : "🌐 Verified Web"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}