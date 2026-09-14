"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { VERIFIED_FEEDBACK_ITEMS } from "./FeedbackSection";

interface AdminPortalProps {
  onExit: () => void;
}

const TIMEFRAMES = ["Daily", "Weekly", "Monthly", "Yearly"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

interface UserActivity {
  _id?: string;
  email: string;
  query: string;
  type: string;
  durationSeconds: number;
  destination: string;
  timestamp: string;
  chatSnippet?: { role: string; content: string }[];
}

interface StoredPlace {
  title: string;
  category: string;
  price_usd: number;
  source?: string;
}

interface CustomerQuery {
  id: string;
  name: string;
  email: string;
  rating: number;
  feedback: string;
  destination: string;
  status: string;
  submittedAt: string;
}

const OPERATIONS_DATA: Record<
  Timeframe,
  {
    users: string;
    revenue: string;
    bookings: string;
    latency: string;
    bars: number[];
    fleet: { label: string; pct: number; color: string; hex: string; desc: string }[];
  }
> = {
  Daily: {
    users: "1,248",
    revenue: "₹18,420",
    bookings: "312",
    latency: "142ms",
    bars: [40, 65, 30, 85, 92, 58, 76],
    fleet: [
      { label: "Regional Buses", pct: 60, color: "bg-emerald-500", hex: "#10B981", desc: "RedBus / KSRTC routes" },
      { label: "Express Trains", pct: 28, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Konkan / Coastal Railway" },
      { label: "Private Auto / Taxis", pct: 12, color: "bg-sky-500", hex: "#0EA5E9", desc: "Local transit" },
    ],
  },
  Weekly: {
    users: "8,920",
    revenue: "₹1,24,500",
    bookings: "2,140",
    latency: "138ms",
    bars: [50, 72, 60, 95, 80, 88, 94],
    fleet: [
      { label: "Regional Buses", pct: 64, color: "bg-emerald-500", hex: "#10B981", desc: "RedBus / KSRTC routes" },
      { label: "Express Trains", pct: 26, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Konkan / Coastal Railway" },
      { label: "Private Auto / Taxis", pct: 10, color: "bg-sky-500", hex: "#0EA5E9", desc: "Local transit" },
    ],
  },
  Monthly: {
    users: "41,850",
    revenue: "₹4,82,000",
    bookings: "9,620",
    latency: "146ms",
    bars: [35, 45, 68, 75, 84, 91, 98],
    fleet: [
      { label: "Regional Buses", pct: 68, color: "bg-emerald-500", hex: "#10B981", desc: "RedBus / KSRTC routes" },
      { label: "Express Trains", pct: 24, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Konkan / Coastal Railway" },
      { label: "Private Auto / Taxis", pct: 8, color: "bg-sky-500", hex: "#0EA5E9", desc: "Local transit" },
    ],
  },
  Yearly: {
    users: "3,94,000",
    revenue: "₹51.2L",
    bookings: "88,400",
    latency: "140ms",
    bars: [20, 38, 52, 66, 80, 89, 97],
    fleet: [
      { label: "Regional Buses", pct: 72, color: "bg-emerald-500", hex: "#10B981", desc: "RedBus / KSRTC routes" },
      { label: "Express Trains", pct: 20, color: "bg-[#FF9209]", hex: "#FF9209", desc: "Konkan / Coastal Railway" },
      { label: "Private Auto / Taxis", pct: 8, color: "bg-sky-500", hex: "#0EA5E9", desc: "Local transit" },
    ],
  },
};

const REAL_REGIONAL_METRICS: Record<
  Timeframe,
  {
    topRegion: string;
    share: string;
    growth: string;
    regions: { name: string; share: number; color: string; bookings: string }[];
  }
> = {
  Daily: {
    topRegion: "Karkala & Coastal Karnataka",
    share: "48%",
    growth: "+16.2% today",
    regions: [
      { name: "Karkala (Gommateshwara / Basadis)", share: 48, color: "bg-emerald-500", bookings: "150 trips" },
      { name: "Mangalore (Panambur / Kudroli)", share: 26, color: "bg-[#FF9209]", bookings: "81 trips" },
      { name: "Goa (Beaches / Forts)", share: 16, color: "bg-purple-500", bookings: "50 trips" },
      { name: "Udupi (Malpe / Krishna Mutt)", share: 10, color: "bg-sky-500", bookings: "31 trips" },
    ],
  },
  Weekly: {
    topRegion: "Mangalore Coastal Circuit",
    share: "44%",
    growth: "+24.5% this week",
    regions: [
      { name: "Mangalore (Panambur / Kudroli)", share: 44, color: "bg-emerald-500", bookings: "940 trips" },
      { name: "Karkala (Heritage Monoliths)", share: 32, color: "bg-[#FF9209]", bookings: "684 trips" },
      { name: "Goa (North & South Escapes)", share: 14, color: "bg-purple-500", bookings: "300 trips" },
      { name: "Kashmir & Alpine Tours", share: 10, color: "bg-sky-500", bookings: "216 trips" },
    ],
  },
  Monthly: {
    topRegion: "Karkala Heritage & Udupi",
    share: "52%",
    growth: "+38.4% this month",
    regions: [
      { name: "Karkala (Monoliths & Lake Basadis)", share: 52, color: "bg-emerald-500", bookings: "5,002 trips" },
      { name: "Mangalore & Coastal Shrines", share: 27, color: "bg-[#FF9209]", bookings: "2,597 trips" },
      { name: "Goa Beachfront & Stays", share: 13, color: "bg-purple-500", bookings: "1,250 trips" },
      { name: "Udupi & Western Ghats", share: 8, color: "bg-sky-500", bookings: "771 trips" },
    ],
  },
  Yearly: {
    topRegion: "Karnataka Coastal & Heritage",
    share: "49%",
    growth: "+62.1% YoY",
    regions: [
      { name: "Karkala & Udupi Heritage", share: 49, color: "bg-emerald-500", bookings: "43,316 trips" },
      { name: "Mangalore Coastal Circuit", share: 34, color: "bg-[#FF9209]", bookings: "30,056 trips" },
      { name: "Goa Weekend Escapes", share: 11, color: "bg-purple-500", bookings: "9,724 trips" },
      { name: "Kashmir & North Circuit", share: 6, color: "bg-sky-500", bookings: "5,304 trips" },
    ],
  },
};

export default function AdminPortal({ onExit }: AdminPortalProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "regional" | "userLogs" | "feedback" | "connect">("dashboard");
  const [timeframe, setTimeframe] = useState<Timeframe>("Monthly");
  const [activeFleetIndex, setActiveFleetIndex] = useState<number | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Live Activities & Stored Knowledge State
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [storedDestinations, setStoredDestinations] = useState<StoredPlace[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserActivity | null>(null);

  // Connect to Customer Queries State
  const [customerQueries, setCustomerQueries] = useState<CustomerQuery[]>([
    {
      id: "QRY-8102",
      name: "Aditi Rao",
      email: "aditi.rao@example.com",
      rating: 5,
      feedback: "Can you add local auto-rickshaw fare standards from Karkala bus stand to Varanga Lake Basadi?",
      destination: "Karkala",
      status: "Resolved",
      submittedAt: new Date(Date.now() - 3600000).toLocaleString(),
    },
    {
      id: "QRY-7940",
      name: "Sneha Hegde",
      email: "sneha.h@example.com",
      rating: 5,
      feedback: "How do I download the 3-day Goa PDF itinerary directly to my phone for offline travel?",
      destination: "Goa",
      status: "Pending Solver",
      submittedAt: new Date(Date.now() - 7200000).toLocaleString(),
    },
    {
      id: "QRY-7612",
      name: "Maya Patel",
      email: "maya.patel@example.com",
      rating: 4,
      feedback: "Interested in hiring a private driver from Mangalore to Kudlu Theertha Falls for 6 passengers.",
      destination: "Mangalore / Hebri",
      status: "Pending Solver",
      submittedAt: new Date(Date.now() - 14400000).toLocaleString(),
    },
  ]);

  // Load telemetry logs and saved search queries
  useEffect(() => {
    const fetchActivities = async () => {
      let localLogs: UserActivity[] = [];
      try {
        localLogs = JSON.parse(localStorage.getItem("journeybuddy_user_activities") || "[]");
      } catch {}

      let serverLogs: UserActivity[] = [];
      let dbPlaces: StoredPlace[] = [];

      try {
        const res = await fetch("http://localhost:5000/api/admin/activities");
        const data = await res.json();
        if (data.success) {
          serverLogs = Array.isArray(data.logs) ? data.logs : [];
          dbPlaces = Array.isArray(data.storedPlaces) ? data.storedPlaces : [];
        }
      } catch (err) {
        console.warn("Backend activities API offline, falling back to local records:", err);
      }

      const currentEmail = user?.email || localStorage.getItem("journeybuddy_last_email") || "kiniashvitha@gmail.com";
      const baselineActivities: UserActivity[] = [
        {
          email: currentEmail,
          query: "places to visit in Karkala",
          type: "Pinecone Vector RAG",
          durationSeconds: 240,
          destination: "Karkala",
          timestamp: new Date().toISOString(),
          chatSnippet: [
            { role: "user", content: "Plan a 2-day trip to Karkala for 4 people with ₹15,000 budget." },
            { role: "assistant", content: "Suggested Coastal Breeze Residency (₹1,400/night) & Gommateshwara Bahubali Monolith." },
          ],
        },
        {
          email: "rohan.shenoy@example.com",
          query: "places to visit in Mangalore",
          type: "Dynamic Web Ingestion",
          durationSeconds: 185,
          destination: "Mangalore",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          chatSnippet: [
            { role: "user", content: "What stays are near Panambur Beach?" },
            { role: "assistant", content: "Red Rock Residency and beach guest houses (₹1,200–₹2,500/night)." },
          ],
        },
        {
          email: "sneha.h@example.com",
          query: "places to visit in Goa",
          type: "Agentic Itinerary",
          durationSeconds: 310,
          destination: "Goa",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          chatSnippet: [
            { role: "user", content: "Best transit route to Goa by bus?" },
            { role: "assistant", content: "Direct KSRTC / RedBus booking from Mangalore/Udupi linked." },
          ],
        },
      ];

      const merged = [...localLogs, ...serverLogs, ...baselineActivities];
      const uniqueActivities = Array.from(
        new Map(merged.map((item) => [item.email + item.query + item.timestamp, item])).values()
      );

      setUserActivities(uniqueActivities);

      const baselinePlaces: StoredPlace[] = [
        { title: "Gommateshwara Bahubali Monolith", category: "heritage", price_usd: 10, source: "Pinecone / MongoDB" },
        { title: "Chaturmukha Basadi (Karkala)", category: "heritage", price_usd: 10, source: "Pinecone / MongoDB" },
        { title: "Varanga Kere Basadi", category: "heritage", price_usd: 8, source: "Pinecone / MongoDB" },
        { title: "St. Lawrence Shrine Basilica", category: "culture", price_usd: 5, source: "MongoDB Atlas" },
        { title: "Panambur Beach (Mangalore)", category: "beach", price_usd: 5, source: "Pinecone / MongoDB" },
        { title: "Kudroli Gokarnath Temple", category: "heritage", price_usd: 10, source: "Pinecone / MongoDB" },
        { title: "Tannirbhavi Beach", category: "nature", price_usd: 5, source: "MongoDB Atlas" },
        { title: "Malpe Beach & St. Mary's Island", category: "beach", price_usd: 15, source: "Pinecone Vector" },
      ];

      setStoredDestinations(dbPlaces.length > 0 ? dbPlaces : baselinePlaces);
    };

    fetchActivities();
  }, [activeTab, user?.email]);

  // Load customer queries from localStorage and backend
  useEffect(() => {
    const fetchCustomerQueries = async () => {
      let localQueries: CustomerQuery[] = [];
      try {
        localQueries = JSON.parse(localStorage.getItem("journeybuddy_customer_queries") || "[]");
      } catch {}

      let serverQueries: CustomerQuery[] = [];
      try {
        const res = await fetch("http://localhost:5000/api/feedback/all");
        const data = await res.json();
        if (data.success && Array.isArray(data.queries)) {
          serverQueries = data.queries;
        }
      } catch {}

      const combined = [...localQueries, ...serverQueries];
      const uniqueMap = new Map<string, CustomerQuery>();
      combined.forEach((item) => {
        const key = item.id || item.feedback;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      if (uniqueMap.size > 0) {
        setCustomerQueries(Array.from(uniqueMap.values()));
      }
    };

    if (activeTab === "connect") {
      fetchCustomerQueries();
    }
  }, [activeTab]);

  const toggleQueryStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Resolved" ? "Pending Solver" : "Resolved";
    setCustomerQueries((prev) => prev.map((q) => (q.id === id ? { ...q, status: nextStatus } : q)));

    try {
      const localQueries: CustomerQuery[] = JSON.parse(
        localStorage.getItem("journeybuddy_customer_queries") || "[]"
      );
      const updatedLocal = localQueries.map((q) => (q.id === id ? { ...q, status: nextStatus } : q));
      localStorage.setItem("journeybuddy_customer_queries", JSON.stringify(updatedLocal));
    } catch {}

    fetch(`http://localhost:5000/api/feedback/resolve/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
  };

  const ops = OPERATIONS_DATA[timeframe];
  const reg = REAL_REGIONAL_METRICS[timeframe];
  const circumference = 2 * Math.PI * 42;
  let accumulatedPercent = 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#071311] text-stone-800 dark:text-stone-100 flex font-sans transition-colors duration-200">
      
      {/* Administrator Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0A1815] border border-stone-200 dark:border-emerald-900/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 font-sans">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-emerald-900/40 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B6E4F] text-white flex items-center justify-center text-lg font-bold shadow-sm">
                  🛡️
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg">Administrator Profile</h3>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">Active Security Credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-black/40 hover:bg-stone-200 text-stone-500 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 mb-5">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#FF9209] shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Admin Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-base font-bold text-stone-900 dark:text-white truncate">
                  {user?.displayName || "Ashvita Kini"}
                </h4>
                <p className="text-xs text-stone-500 dark:text-emerald-300 font-mono truncate">
                  {user?.email || "kiniashvitha@gmail.com"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FF9209] text-stone-950">
                    SUPER ADMIN
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● Active
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-black/30 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400 font-semibold">Full Name</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{user?.displayName || "Ashvita Kini"}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-black/30 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400 font-semibold">Primary Email</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{user?.email || "kiniashvitha@gmail.com"}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-black/30 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-stone-500 dark:text-stone-400 font-semibold block">Password</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200">
                    {showPassword ? "•••••••••• (Verified)" : "••••••••••••"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-emerald-900/40 text-[11px] font-semibold text-stone-700 dark:text-emerald-300 hover:bg-stone-300 transition cursor-pointer"
                >
                  {showPassword ? "Hide" : "Reveal"}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-black/30 border border-stone-200 dark:border-emerald-900/40 flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400 font-semibold">Security Passcode</span>
                <span className="font-mono font-bold text-[#FF9209]">ADMIN_SECRET_2026</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-emerald-900/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Snippet Viewer Modal */}
      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0A1815] border border-stone-200 dark:border-emerald-900/60 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-stone-100 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-emerald-900/40 mb-4">
              <div>
                <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  Conversation Telemetry: {selectedChat.email}
                </h4>
                <p className="text-xs text-stone-500">Destination: {selectedChat.destination}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChat(null)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-black/40 text-stone-500 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[#0E201C] border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-[#FF9209] block mb-1">User Query:</span>
                <p className="text-stone-800 dark:text-stone-200">{selectedChat.query}</p>
              </div>

              {selectedChat.chatSnippet && selectedChat.chatSnippet.length > 0 ? (
                selectedChat.chatSnippet.map((turn, tIdx) => (
                  <div
                    key={tIdx}
                    className={`p-3 rounded-xl ${
                      turn.role === "user"
                        ? "bg-stone-100 dark:bg-black/40 text-right ml-6"
                        : "bg-emerald-950/40 border border-emerald-900/40 mr-6"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-stone-400 block mb-0.5">
                      {turn.role === "user" ? "Traveler" : "JourneyBuddy AI"}
                    </span>
                    <p className="text-stone-800 dark:text-stone-200">{turn.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-black/20 text-center text-stone-400 italic">
                  Autonomous session executed with Pinecone vector retrieval.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-emerald-900/40 text-right">
              <button
                type="button"
                onClick={() => setSelectedChat(null)}
                className="px-4 py-1.5 rounded-xl bg-[#0B6E4F] hover:bg-[#08523A] text-white text-xs font-bold transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#1B3B36] text-white p-6 flex flex-col justify-between hidden md:flex shrink-0 shadow-2xl relative z-20">
        <div className="space-y-6">
          <div className="flex items-center">
            <BrandLogo />
          </div>

          <div
            onClick={() => setIsProfileOpen(true)}
            title="Click to view Administrator Details"
            className="p-3.5 rounded-2xl bg-[#142E2A] border border-emerald-900/50 hover:border-[#FF9209] flex items-center gap-3 shadow-sm hover:bg-[#163631] transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full ring-2 ring-[#FF9209] overflow-hidden relative shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Admin Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#FF9209] transition-colors">
                  {user?.displayName || "Ashvita Kini"}
                </h4>
                <span className="text-[10px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">↗</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 truncate font-mono">
                {user?.email || "kiniashvitha@gmail.com"}
              </p>
              <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FF9209] text-stone-950">
                SUPER ADMIN
              </span>
            </div>
          </div>

          <nav className="space-y-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg"
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
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">🌐</span>
              <span>Regional Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("userLogs")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "userLogs"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">👤</span>
              <span>Traveler Logs &amp; Sessions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">💬</span>
              <span>Customer Reviews</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("connect")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === "connect"
                  ? "bg-white text-[#1B3B36] font-bold shadow-lg"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">🤝</span>
              <span>Connect to Customer</span>
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

      {/* Main Content Canvas */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-emerald-900/40 pb-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF9209]">
              Administration Command Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              {activeTab === "dashboard" && "Operational Performance"}
              {activeTab === "regional" && "Global Regional Intelligence"}
              {activeTab === "userLogs" && "Traveler Interaction Telemetry & Search Logs"}
              {activeTab === "feedback" && "Customer Logs & Verified Feedback"}
              {activeTab === "connect" && "Connect to Customer — Personal Query Solver"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-200/70 dark:bg-[#0E201C] border border-stone-300 dark:border-emerald-900/40">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Active Explorers</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-[#1B3B36] dark:text-emerald-400">{ops.users}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Active Live
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Gross Booking Value</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-stone-900 dark:text-white">{ops.revenue}</span>
                  <span className="text-xs font-bold text-[#FF9209] bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                    +18.4%
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Confirmed Itineraries</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-stone-900 dark:text-white">{ops.bookings}</span>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {timeframe}
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Gateway Latency</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{ops.latency}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Booking Ingestion Volume ({timeframe})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Autonomous itinerary and transit synthesis requests.</p>
                </div>

                <div className="pt-8 pb-3 flex items-end justify-between gap-3 h-48 px-2">
                  {ops.bars.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <span className="text-[10px] font-mono font-bold text-[#1B3B36] dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition">
                        {val * 10}
                      </span>
                      <div
                        style={{ height: `${val}%` }}
                        className="w-full max-w-[36px] rounded-t-xl bg-[#1B3B36] group-hover:bg-[#FF9209] dark:bg-emerald-600 dark:group-hover:bg-[#FF9209] transition-all shadow group-hover:scale-y-105 origin-bottom"
                      />
                      <span className="text-[10px] font-mono text-stone-400 font-semibold">T{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Transit Allocation
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#FF9209] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                      {timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Hover over modes to inspect volume.</p>
                </div>

                <div className="relative flex items-center justify-center my-2">
                  <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="11" className="text-stone-100 dark:text-stone-800" />
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

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black text-stone-900 dark:text-white">
                      {activeFleetIndex !== null ? ops.fleet[activeFleetIndex].pct : ops.fleet[0].pct}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">
                      {activeFleetIndex !== null ? ops.fleet[activeFleetIndex].label.split(" ")[0] : "BUSES"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {ops.fleet.map((item, index) => (
                    <div
                      key={item.label}
                      onMouseEnter={() => setActiveFleetIndex(index)}
                      onMouseLeave={() => setActiveFleetIndex(null)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 dark:hover:bg-[#142E2A]/50 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                        <span className={`w-3 h-3 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="font-mono text-stone-900 dark:text-white font-bold">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGIONAL ANALYSIS */}
        {activeTab === "regional" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Top Market</span>
                <h3 className="text-2xl font-bold text-[#1B3B36] dark:text-emerald-400 mt-2">{reg.topRegion}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Leading destination by live query telemetry.</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Market Share</span>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-2">{reg.share}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Concentrated demand in regional database.</p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Growth Velocity</span>
                <h3 className="text-2xl font-bold text-[#FF9209] mt-2">{reg.growth}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Compared to previous window.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Stored Regional Destination Distribution ({timeframe})
              </h3>
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

        {/* TAB 3: TRAVELER LOGS & SESSIONS */}
        {activeTab === "userLogs" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Dwell Time Engagement Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    ⏱️ Traveler Session Engagement &amp; Dwell Time
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Active browsing, search queries, and itinerary formulation time per user session.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#FF9209]">
                  Live Dwell Telemetry
                </span>
              </div>

              <div className="pt-6 pb-2 flex items-end justify-between gap-4 h-40 px-3">
                {userActivities.slice(0, 7).map((act, aIdx) => {
                  const minutes = Math.max(1, Math.round(act.durationSeconds / 60));
                  const barHeight = Math.min(100, minutes * 20);
                  return (
                    <div key={aIdx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <span className="text-[10px] font-mono text-[#FF9209] opacity-0 group-hover:opacity-100 transition font-bold">
                        {minutes} min
                      </span>
                      <div
                        style={{ height: `${barHeight}%` }}
                        className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-[#1B3B36] to-emerald-500 group-hover:to-[#FF9209] transition-all shadow-sm"
                      />
                      <span className="text-[10px] font-mono text-stone-400 truncate max-w-[65px]">
                        {act.email.split("@")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Traveler Searches & Conversation Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    🔍 Traveler Searches &amp; Chatbot Queries
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Direct record of searches, travel context, and AI chatbot interactions logged from the frontend.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {userActivities.length} Activity Records
                </span>
              </div>

              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-emerald-900/40 font-mono text-stone-500 dark:text-stone-400 uppercase">
                      <th className="py-3 px-4">User Email</th>
                      <th className="py-3 px-4">Search / Prompt</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Time Spent</th>
                      <th className="py-3 px-4">Interaction</th>
                      <th className="py-3 px-4">Inspect Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/40">
                    {userActivities.map((act, idx) => (
                      <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-[#142E2A]/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-stone-900 dark:text-white">
                          {act.email}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-stone-700 dark:text-stone-300 max-w-xs truncate">
                          &ldquo;{act.query}&rdquo;
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                            {act.destination}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {Math.round(act.durationSeconds / 60)}m {act.durationSeconds % 60}s
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 dark:text-stone-400">
                          {act.type}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedChat(act)}
                            className="px-3 py-1 rounded-lg bg-[#1B3B36] hover:bg-[#142E2A] text-white font-semibold transition cursor-pointer shadow-xs"
                          >
                            View Chat 💬
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MongoDB Atlas & Pinecone Stored Places Grid */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    🍃 Stored Destinations in MongoDB &amp; Pinecone
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Landmarks and vector embeddings previously searched and stored permanently into our database.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#FF9209]">
                  {storedDestinations.length} Stored Landmarks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {storedDestinations.map((place, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-black/30 border border-stone-200 dark:border-emerald-900/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          {place.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-500">
                          ${place.price_usd}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 dark:text-white text-sm">
                        {place.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 mt-3 pt-2 border-t border-stone-200 dark:border-emerald-900/30">
                      Provenance: {place.source || "Pinecone / MongoDB"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: CUSTOMER REVIEWS */}
        {activeTab === "feedback" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">Customer Reviews &amp; Experience Audit</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Direct feedback synchronized with the verified testimonials displayed on the traveler portal.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {VERIFIED_FEEDBACK_ITEMS.length} Verified Reviews
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-emerald-900/40 font-mono text-stone-500 dark:text-stone-400 uppercase">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Traveler</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Feedback Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/40">
                  {VERIFIED_FEEDBACK_ITEMS.map((rev, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-[#142E2A]/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF9209]">{rev.id || `JB-${9100 - idx}`}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 dark:text-white block">{rev.author}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{rev.role}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700 dark:text-stone-300">
                        {rev.destination || "Regional Heritage"}
                      </td>
                      <td className="py-3.5 px-4 text-[#FF9209] font-bold">{"★".repeat(rev.stars)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          Verified Traveler
                        </span>
                      </td>
                      <td className="py-3.5 px-4 italic text-stone-600 dark:text-stone-300 max-w-sm">
                        &ldquo;{rev.quote}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CONNECT TO CUSTOMER (Personal Query Solver Desk) */}
        {activeTab === "connect" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200 dark:border-emerald-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  🤝 Connect to Customer &amp; Personal Query Solver
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Inquiries, custom travel requests, and feedback submitted directly through the traveler portal feedback card.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#FF9209]">
                {customerQueries.filter((q) => q.status !== "Resolved").length} Pending Inquiries
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-emerald-900/40 font-mono text-stone-500 dark:text-stone-400 uppercase">
                    <th className="py-3 px-4">Query ID</th>
                    <th className="py-3 px-4">Traveler</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">User Inquiry / Feedback</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-emerald-950/40">
                  {customerQueries.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-[#142E2A]/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#FF9209]">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-900 dark:text-white block">{item.name}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{item.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700 dark:text-stone-300">
                        {item.destination}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300 max-w-sm leading-relaxed">
                        &ldquo;{item.feedback}&rdquo;
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">
                        {"★".repeat(item.rating || 5)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === "Resolved"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-800/40"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-800/40 animate-pulse"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleQueryStatus(item.id, item.status)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1B3B36] hover:bg-[#152e2a] text-white transition active:scale-95 cursor-pointer shadow-xs"
                        >
                          {item.status === "Resolved" ? "Mark Pending ↺" : "Mark Resolved ✓"}
                        </button>
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