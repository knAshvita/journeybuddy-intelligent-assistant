"use client";

import { useState } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

interface AdminPortalProps {
  onExit: () => void;
}

const TIMEFRAMES = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

// 1. Operations Data
const OPERATIONS_DATA: Record<Timeframe, { 
  users: string; 
  revenue: string; 
  bookings: string; 
  latency: string; 
  bars: number[];
  fleet: { label: string; pct: number; color: string; hex: string; desc: string }[];
}> = {
  Daily: { 
    users: "1,248", 
    revenue: "$18,420", 
    bookings: "312", 
    latency: "142ms", 
    bars: [40, 65, 30, 85, 92, 58, 76],
    fleet: [
      { label: "Premium Flights", pct: 60, color: "bg-emerald-500", hex: "#10B981", desc: "Long-haul regional connectors" },
      { label: "Scenic Express Trains", pct: 28, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Inter-city scenic rail" },
      { label: "Private Island Ferries", pct: 12, color: "bg-sky-500", hex: "#0EA5E9", desc: "Archipelago transit shuttles" },
    ]
  },
  Weekly: { 
    users: "8,920", 
    revenue: "$124,500", 
    bookings: "2,140", 
    latency: "138ms", 
    bars: [50, 72, 60, 95, 80, 88, 94],
    fleet: [
      { label: "Premium Flights", pct: 64, color: "bg-emerald-500", hex: "#10B981", desc: "Long-haul regional connectors" },
      { label: "Scenic Express Trains", pct: 26, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Inter-city scenic rail" },
      { label: "Private Island Ferries", pct: 10, color: "bg-sky-500", hex: "#0EA5E9", desc: "Archipelago transit shuttles" },
    ]
  },
  Monthly: { 
    users: "41,850", 
    revenue: "$482,000", 
    bookings: "9,620", 
    latency: "146ms", 
    bars: [35, 45, 68, 75, 84, 91, 98],
    fleet: [
      { label: "Premium Flights", pct: 68, color: "bg-emerald-500", hex: "#10B981", desc: "Long-haul regional connectors" },
      { label: "Scenic Express Trains", pct: 24, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Inter-city scenic rail" },
      { label: "Private Island Ferries", pct: 8, color: "bg-sky-500", hex: "#0EA5E9", desc: "Archipelago transit shuttles" },
    ]
  },
  Yearly: { 
    users: "394,000", 
    revenue: "$5.12M", 
    bookings: "88,400", 
    latency: "140ms", 
    bars: [20, 38, 52, 66, 80, 89, 97],
    fleet: [
      { label: "Premium Flights", pct: 72, color: "bg-emerald-500", hex: "#10B981", desc: "Long-haul regional connectors" },
      { label: "Scenic Express Trains", pct: 20, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Inter-city scenic rail" },
      { label: "Private Island Ferries", pct: 8, color: "bg-sky-500", hex: "#0EA5E9", desc: "Archipelago transit shuttles" },
    ]
  },
};

// 2. Regional Analysis Data
const REGIONAL_METRICS: Record<Timeframe, { topRegion: string; share: string; growth: string; regions: { name: string; share: number; color: string; bookings: string }[] }> = {
  Daily: {
    topRegion: "Bali Tropical Escapes",
    share: "48%",
    growth: "+6.2% today",
    regions: [
      { name: "Bali & Indonesia", share: 48, color: "bg-emerald-500", bookings: "150 trips" },
      { name: "Swiss Alps & Europe", share: 26, color: "bg-amber-500", bookings: "81 trips" },
      { name: "Kyoto & Japan", share: 16, color: "bg-purple-500", bookings: "50 trips" },
      { name: "Maldives Atolls", share: 10, color: "bg-sky-500", bookings: "31 trips" },
    ],
  },
  Weekly: {
    topRegion: "Swiss Alps Express",
    share: "42%",
    growth: "+14.8% this week",
    regions: [
      { name: "Swiss Alps & Europe", share: 42, color: "bg-amber-500", bookings: "898 trips" },
      { name: "Bali & Indonesia", share: 34, color: "bg-emerald-500", bookings: "727 trips" },
      { name: "Kyoto & Japan", share: 14, color: "bg-purple-500", bookings: "300 trips" },
      { name: "Maldives Atolls", share: 10, color: "bg-sky-500", bookings: "215 trips" },
    ],
  },
  Monthly: {
    topRegion: "Bali Tropical Escapes",
    share: "51%",
    growth: "+28.4% this month",
    regions: [
      { name: "Bali & Indonesia", share: 51, color: "bg-emerald-500", bookings: "4,906 trips" },
      { name: "Swiss Alps & Europe", share: 28, color: "bg-amber-500", bookings: "2,693 trips" },
      { name: "Kyoto & Japan", share: 13, color: "bg-purple-500", bookings: "1,250 trips" },
      { name: "Maldives Atolls", share: 8, color: "bg-sky-500", bookings: "771 trips" },
    ],
  },
  Yearly: {
    topRegion: "Mediterranean & Alps",
    share: "45%",
    growth: "+52.1% YoY",
    regions: [
      { name: "Swiss Alps & Europe", share: 45, color: "bg-amber-500", bookings: "39,780 trips" },
      { name: "Bali & Indonesia", share: 38, color: "bg-emerald-500", bookings: "33,592 trips" },
      { name: "Kyoto & Japan", share: 11, color: "bg-purple-500", bookings: "9,724 trips" },
      { name: "Maldives Atolls", share: 6, color: "bg-sky-500", bookings: "5,304 trips" },
    ],
  },
};

// 3. Customer Reviews Data
const CUSTOMER_REVIEWS = [
  { id: "JB-9102", name: "Ananya Sharma", email: "ananya.s@example.com", destination: "Bali Luxury Retreat", rating: 5, status: "Verified Trip", comment: "Autonomous agent recommendations saved us 6 hours of itinerary planning!" },
  { id: "JB-9098", name: "Marcus Vance", email: "marcus.v@example.com", destination: "Swiss Alps Express", rating: 5, status: "Verified Trip", comment: "The train scheduling telemetry was dead accurate. Phenomenal experience." },
  { id: "JB-9081", name: "Elena Rostova", email: "elena.rostova@example.com", destination: "Kyoto Heritage Tour", rating: 4, status: "Completed", comment: "Great transit advice. Would appreciate even faster hotel auto-sync." },
  { id: "JB-9074", name: "David Kim", email: "david.k@example.com", destination: "Maldives Lagoon Villa", rating: 5, status: "Verified Trip", comment: "Hands down the smoothest booking platform. Loved the luxury UI." },
  { id: "JB-9063", name: "Sarah Jenkins", email: "sarah.j@example.com", destination: "Machu Picchu Explorer", rating: 5, status: "Active Explorer", comment: "AI tour guide gave spot-on packing tips for high-altitude trekking." },
];

export default function AdminPortal({ onExit }: AdminPortalProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "regional" | "feedback">("dashboard");
  const [timeframe, setTimeframe] = useState<Timeframe>("Monthly");
  const [activeFleetIndex, setActiveFleetIndex] = useState<number | null>(null);

  const ops = OPERATIONS_DATA[timeframe];
  const reg = REGIONAL_METRICS[timeframe];

  // Circumference for 2*pi*r where r=42 is ~263.89
  const circumference = 2 * Math.PI * 42;
  let accumulatedPercent = 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#1B3B36] text-white p-6 flex flex-col justify-between hidden md:flex shrink-0 shadow-2xl relative z-20">
        <div className="space-y-8">
          <div className="flex items-center">
            <BrandLogo />
          </div>

          <div className="p-4 rounded-2xl bg-[#142E2A] border border-emerald-900/40 flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full ring-2 ring-[#FF9209] overflow-hidden relative shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Admin Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{user?.displayName || "Ashvita Kini"}</h4>
              <p className="text-[11px] text-emerald-300/80 truncate font-mono">{user?.email || "admin@journeybuddy"}</p>
              <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FF9209] text-stone-950">
                Super Admin
              </span>
            </div>
          </div>

          <nav className="space-y-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg scale-102"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("regional")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "regional"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg scale-102"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">🌐</span>
              <span>Regional Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg scale-102"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">💬</span>
              <span>Customer Reviews</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-emerald-900/50 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-stone-300">Theme</span>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={onExit}
            className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-stone-200 transition active:scale-95 cursor-pointer"
          >
            ← Back to Traveler View
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-[#FF9209] hover:bg-[#e07f06] text-stone-950 transition active:scale-95 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF9209]">
              Administration Command Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              {activeTab === "dashboard" && "Operational Performance"}
              {activeTab === "regional" && "Global Regional Intelligence"}
              {activeTab === "feedback" && "Customer Logs & Verified Feedback"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-200/70 dark:bg-stone-900 border border-stone-300 dark:border-stone-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-[#1B3B36] dark:bg-emerald-600 text-white shadow-sm"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OPERATIONAL DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Active Explorers</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-[#1B3B36] dark:text-emerald-400">{ops.users}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Active Live
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Gross Booking Value</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-stone-900 dark:text-white">{ops.revenue}</span>
                  <span className="text-xs font-bold text-[#FF9209] bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                    +18.4%
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Confirmed Itineraries</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-stone-900 dark:text-white">{ops.bookings}</span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {timeframe}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Gateway Latency</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{ops.latency}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            </div>

            {/* Visual Charts: Bar Graph & Interactive Fleet Allocation Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bar Graph */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Booking Ingestion Volume ({timeframe})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Autonomous itinerary synthesis and dispatch requests.</p>
                </div>

                <div className="pt-8 pb-3 flex items-end justify-between gap-3 h-48 px-2">
                  {ops.bars.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <span className="text-[10px] font-mono font-bold text-[#1B3B36] dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                        {val * 10}
                      </span>
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full max-w-[36px] rounded-t-xl bg-[#1B3B36] group-hover:bg-[#FF9209] dark:bg-emerald-600 dark:group-hover:bg-[#FF9209] transition-all duration-200 shadow group-hover:scale-y-105 origin-bottom"
                      />
                      <span className="text-[10px] font-mono text-stone-400 font-semibold">T{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Donut Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Fleet Mode Allocation
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#FF9209] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                      {timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Hover over segments to inspect telemetry.</p>
                </div>

                {/* Interactive SVG Donut */}
                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="11"
                      className="text-stone-100 dark:text-stone-800"
                    />

                    {/* Dynamic Donut Arcs */}
                    {ops.fleet.map((item, index) => {
                      const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                      accumulatedPercent += item.pct;
                      const isHovered = activeFleetIndex === index;

                      return (
                        <circle
                          key={item.label}
                          cx="50"
                          cy="50"
                          r="42"
                          fill="transparent"
                          stroke={item.hex}
                          strokeWidth={isHovered ? 14 : 11}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setActiveFleetIndex(index)}
                          onMouseLeave={() => setActiveFleetIndex(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Centered Readout responding to active hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    {activeFleetIndex !== null ? (
                      <>
                        <span className="text-2xl font-black text-stone-900 dark:text-white transition-all">
                          {ops.fleet[activeFleetIndex].pct}%
                        </span>
                        <span className="text-[9px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider truncate max-w-[85px]">
                          {ops.fleet[activeFleetIndex].label.split(" ")[1] || ops.fleet[activeFleetIndex].label}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl font-black text-stone-900 dark:text-white transition-all">
                          {ops.fleet[0].pct}%
                        </span>
                        <span className="text-[9px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                          FLIGHTS
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend with Dynamic Interactivity */}
                <div className="space-y-2 text-xs font-semibold">
                  {ops.fleet.map((item, index) => {
                    const isHovered = activeFleetIndex === index;
                    return (
                      <div
                        key={item.label}
                        onMouseEnter={() => setActiveFleetIndex(index)}
                        onMouseLeave={() => setActiveFleetIndex(null)}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? "bg-stone-100 dark:bg-stone-800 scale-102 shadow-xs"
                            : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
                        }`}
                      >
                        <span className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                          <span
                            className={`w-3 h-3 rounded-full transition-transform ${item.color} ${
                              isHovered ? "scale-125 ring-2 ring-stone-400/40" : ""
                            }`}
                          />
                          {item.label}
                        </span>
                        <span className="font-mono text-stone-900 dark:text-white font-bold">{item.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGIONAL ANALYSIS */}
        {activeTab === "regional" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:-translate-y-0.5 transition">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Top Market</span>
                <h3 className="text-2xl font-bold text-[#1B3B36] dark:text-emerald-400 mt-2">{reg.topRegion}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Leading destination by agent queries.</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:-translate-y-0.5 transition">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Market Share</span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-2">{reg.share}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Concentrated demand in target hub.</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:-translate-y-0.5 transition">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Growth Velocity</span>
                <h3 className="text-2xl font-bold text-[#FF9209] mt-2">{reg.growth}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Compared to previous window.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">Regional Traveler Distribution ({timeframe})</h3>
              <div className="space-y-4">
                {reg.regions.map((region) => (
                  <div key={region.name} className="space-y-1.5 group cursor-pointer">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-800 dark:text-stone-200 group-hover:text-[#FF9209] transition">
                        {region.name}
                      </span>
                      <span className="font-mono text-stone-500 dark:text-stone-400">{region.bookings} ({region.share}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div style={{ width: `${region.share}%` }} className={`h-full ${region.color} transition-all duration-500 group-hover:brightness-110`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER FEEDBACK DIRECTORY */}
        {activeTab === "feedback" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">Customer Reviews & Experience Audit</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Direct feedback from verified travelers utilizing JourneyBuddy AI agents.</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                5 Recent Submissions
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 font-mono text-stone-500 dark:text-stone-400 uppercase">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Traveler</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {CUSTOMER_REVIEWS.map((rev) => (
                    <tr key={rev.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF9209]">{rev.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 dark:text-white block">{rev.name}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{rev.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700 dark:text-stone-300">{rev.destination}</td>
                      <td className="py-3.5 px-4 text-[#FF9209] font-bold">{"★".repeat(rev.rating)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {rev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 italic text-stone-600 dark:text-stone-300 max-w-sm">
                        &ldquo;{rev.comment}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}