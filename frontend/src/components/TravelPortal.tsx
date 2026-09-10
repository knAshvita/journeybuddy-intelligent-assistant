"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import LandingHero from "./LandingHero";
import SearchBar from "./SearchBar";
import StatusCard from "./StatusCard";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";
import AdminPortal from "./AdminPortal";
import { useAuth } from "@/context/AuthContext";

interface TravelPortalProps {
  buildTimestamp: string;
}

const DESTINATIONS = [
  { name: "Bali", location: "Bali, Indonesia", price: "$19.00", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80" },
  { name: "Santorini", location: "Santorini, Greece", price: "$19.00", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80" },
  { name: "Maldives", location: "Maldives Atoll", price: "$19.00", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80" },
  { name: "Switzerland", location: "Zermatt, Alps", price: "$19.00", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80" },
  { name: "Japan", location: "Kyoto / Fuji", price: "$19.00", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80" },
  { name: "Peru", location: "Machu Picchu", price: "$70.00", img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80" },
];

const BENEFITS = [
  { icon: "🛡️", title: "Best Price Guarantee", desc: "Guaranteed competitive rates for all curated itineraries." },
  { icon: "🏨", title: "Luxury Hotels", desc: "Hand-picked 5-star villas and boutique resorts worldwide." },
  { icon: "✈️", title: "Expert Travel Guides", desc: "Agentic AI itineraries curated by regional specialists." },
  { icon: "🕒", title: "24/7 Live Support", desc: "Real-time itinerary telemetry and instant agent resolution." },
  { icon: "🔒", title: "Secure Booking", desc: "Encrypted transactions and verified identity protection." },
];

export default function TravelPortal({ buildTimestamp }: TravelPortalProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [viewAdminDashboard, setViewAdminDashboard] = useState(false);
  const { user, role, logout } = useAuth();

  // AUTOMATIC REDIRECT: Once logged in as admin, go straight to Admin Portal
  useEffect(() => {
    if (role === "admin" && user) {
      setViewAdminDashboard(true);
    } else {
      setViewAdminDashboard(false);
    }
  }, [role, user]);

  // 1. Direct Render to Admin Portal when logged in as admin
  if (role === "admin" && viewAdminDashboard) {
    return <AdminPortal onExit={() => setViewAdminDashboard(false)} />;
  }

  // 2. Landing page check
  if (!hasEntered) {
    return <LandingHero onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Top Navbar */}
      <header className="w-full bg-[#FDFBF7]/90 dark:bg-stone-950/90 backdrop-blur sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600 dark:text-stone-300 font-medium">
            <a href="#destinations" className="hover:text-stone-950 dark:hover:text-white transition">Premium</a>
            <a href="#destinations" className="hover:text-stone-950 dark:hover:text-white transition">Destinations</a>
            <a href="#escape" className="hover:text-stone-950 dark:hover:text-white transition">Discovery</a>
            <a href="#escape" className="hover:text-stone-950 dark:hover:text-white transition">Vacation</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-600 dark:text-stone-300 font-medium hidden sm:inline">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition text-stone-700 dark:text-stone-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-2 py-1 cursor-pointer"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#1B3B36] hover:bg-[#152e2a] text-white shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full h-[520px] sm:h-[580px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
          alt="Tropical Lagoon Overwater Villas"
          fill
          priority
          className="object-cover object-center brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/40 via-stone-900/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center text-left">
          <div className="max-w-xl space-y-4">
            <h1 className="text-5xl sm:text-6xl font-serif font-medium tracking-tight text-white leading-[1.1] drop-shadow-md">
              Your Journey <br /> Begins Here
            </h1>
            <p className="text-sm sm:text-base text-stone-100 font-light leading-relaxed max-w-md drop-shadow">
              Curated itineraries, autonomous agent assistance, and seamless bookings to the world&apos;s most breathtaking escapes.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="#destinations"
                className="px-6 py-3 rounded-full text-xs font-bold bg-white text-stone-900 hover:bg-stone-100 shadow-md transition"
              >
                Explore Destinations
              </a>
              <button
                type="button"
                onClick={() => alert("Previewing video reel...")}
                className="px-6 py-3 rounded-full text-xs font-bold bg-[#1B3B36]/80 backdrop-blur-sm text-white hover:bg-[#1B3B36] shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>▶</span> Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Pill Search Bar */}
      <SearchBar />

      {/* Top Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 pt-20 pb-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
            Top Destinations
          </h2>
          <button type="button" className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:underline cursor-pointer">
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              className="group relative rounded-2xl overflow-hidden shadow-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 transition hover:-translate-y-1 hover:shadow-xl cursor-pointer"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={dest.img}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-white/80 backdrop-blur text-[10px] font-bold text-stone-900 px-2.5 py-0.5 rounded-full">
                  {dest.name}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest block">
                    Luxury Vacation
                  </span>
                  <h3 className="font-bold text-sm leading-tight">{dest.name}</h3>
                  <p className="text-[11px] text-stone-300 mt-0.5">Starting {dest.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Benefits */}
      <section className="bg-[#F8F5EE] dark:bg-slate-900/60 py-16 border-y border-stone-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-stone-900 dark:text-white mb-12">
            Premium Benefits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="p-4 space-y-2">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">{benefit.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemetry Architecture Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusCard />

          <div className="p-6 border rounded-3xl shadow-sm bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800">
            <span className="text-xs uppercase tracking-wider font-semibold block mb-2 text-[#1B3B36] dark:text-emerald-400">
              Server Component: Pipeline Blueprint
            </span>
            <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100">
              Integration Pipeline
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs font-mono text-stone-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><span>🧭</span> Next.js Luxury UI Layer</li>
              <li className="flex items-center gap-2"><span>⚡</span> Express Port 5000 Ingestion Gateway</li>
              <li className="flex items-center gap-2"><span>🔒</span> Firebase Authentication Context</li>
              <li className="flex items-center gap-2"><span>🍃</span> Vector Similarity Knowledge Base</li>
              <li className="flex items-center gap-2"><span>🧠</span> LangChain Agent Reasoning</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs font-mono text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>⚙️ Telemetry Interceptor Gateway</span>
          <span>Static Pre-render: {buildTimestamp}</span>
        </div>
      </section>

      {/* Dark Footer */}
      <footer className="bg-[#122622] text-stone-300 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs">
          <div>
            <BrandLogo className="mb-4" />
            <p className="text-stone-400 leading-relaxed mt-2">
              Autonomous AI travel orchestration engine backed by multi-vector memory and real-time routing telemetry.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Itinerary Engine</li>
              <li className="hover:text-white cursor-pointer">Live Gateway Pings</li>
              <li className="hover:text-white cursor-pointer">Multi-modal Transit</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Destinations</li>
              <li className="hover:text-white cursor-pointer">Architecture Spec</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Twitter / X</li>
              <li className="hover:text-white cursor-pointer">GitHub</li>
              <li className="hover:text-white cursor-pointer">Discord</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-stone-800 text-[11px] text-stone-500 flex items-center justify-between">
          <p>© 2026 Journey buddy. All rights reserved.</p>
          <button
            type="button"
            onClick={() => setHasEntered(false)}
            className="hover:underline text-stone-400 cursor-pointer"
          >
            Back to Intro Landing
          </button>
        </div>
      </footer>
    </div>
  );
}