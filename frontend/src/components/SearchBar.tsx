"use client";

import { useState, useRef } from "react";

export default function SearchBar() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2 Guests");
  const [currency, setCurrency] = useState("USD");
  const [responseMsg, setResponseMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger the native browser calendar popup reliably anywhere the box is clicked
  const openDatePicker = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleDispatch = async () => {
    const tripTarget = destination.trim() || "Unspecified destination";
    const travelDate = date || "flexible dates";
    const query = `Trip to ${tripTarget} on ${travelDate} for ${guests} (Currency: ${currency})`;

    setLoading(true);
    setResponseMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponseMsg(`Gateway Received: "${data.stagedQuery}" at ${new Date(data.receivedAt).toLocaleTimeString()}`);
      } else {
        setResponseMsg(`Error: ${data.error || "Request failed"}`);
      }
    } catch {
      setResponseMsg("Express Gateway (port 5000) offline. Query staged locally.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto -mt-10 z-30 px-4">
      <div className="bg-[#183630]/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl border border-[#2B4D46] text-white flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
        
        {/* 1. Destination Field */}
        <div className="flex-[1.5] px-4 py-2.5 flex items-center gap-2.5 border-b sm:border-b-0 sm:border-r border-[#2B4D46]">
          <span className="text-base select-none">📍</span>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDispatch()}
            placeholder="Destination (e.g. Bali, Maldives)"
            className="w-full bg-transparent text-xs sm:text-sm font-medium placeholder-stone-400 text-white focus:outline-none"
          />
        </div>

        {/* 2. Interactive Date Picker Field */}
        <div
          onClick={openDatePicker}
          className="flex-1 px-4 py-2.5 flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-[#2B4D46] cursor-pointer hover:bg-white/5 transition rounded-xl sm:rounded-none"
        >
          <span className="text-base select-none">📅</span>
          <input
            ref={dateInputRef}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* 3. Guests Selector */}
        <div className="px-4 py-2.5 flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-[#2B4D46]">
          <span className="text-base select-none">👥</span>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none cursor-pointer pr-1"
          >
            <option value="1 Guest" className="bg-[#183630] text-white">1 Guest</option>
            <option value="2 Guests" className="bg-[#183630] text-white">2 Guests</option>
            <option value="3 Guests" className="bg-[#183630] text-white">3 Guests</option>
            <option value="4+ Guests" className="bg-[#183630] text-white">4+ Guests</option>
          </select>
        </div>

        {/* 4. Currency Selector */}
        <div className="px-3 py-2.5 flex items-center gap-1">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-white focus:outline-none cursor-pointer"
          >
            <option value="USD" className="bg-[#183630] text-white">USD</option>
            <option value="EUR" className="bg-[#183630] text-white">EUR</option>
            <option value="INR" className="bg-[#183630] text-white">INR</option>
            <option value="GBP" className="bg-[#183630] text-white">GBP</option>
          </select>
        </div>

        {/* 5. Search Button */}
        <button
          type="button"
          onClick={handleDispatch}
          disabled={loading}
          className="px-6 py-3 rounded-full bg-[#245247] hover:bg-[#2e6357] border border-emerald-500/30 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50 select-none"
        >
          <span>🔍</span>
          <span>{loading ? "Searching..." : "Search"}</span>
        </button>
      </div>

      {/* Response Feedback Capsule */}
      {responseMsg && (
        <div className="mt-3 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-mono bg-white/90 dark:bg-slate-900/90 border border-stone-200 dark:border-slate-800 text-[#183630] dark:text-emerald-300 shadow">
            {responseMsg}
          </span>
        </div>
      )}
    </div>
  );
}