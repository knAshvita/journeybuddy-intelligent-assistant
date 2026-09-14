"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";
import LandingHero from "./LandingHero";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import AuthModal from "./AuthModal";
import FeedbackSection from "./FeedbackSection";
import AdminPortal from "./AdminPortal";
import ChatModal from "./ChatModal";
import { useAuth } from "@/context/AuthContext";

interface TravelPortalProps {
  buildTimestamp: string;
}

const INITIAL_DESTINATIONS = [
  { name: "Bali", location: "Bali, Indonesia", price: "$19.00", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80" },
  { name: "Santorini", location: "Santorini, Greece", price: "$19.00", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80" },
  { name: "Maldives", location: "Maldives Atoll", price: "$19.00", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80" },
  { name: "Switzerland", location: "Zermatt, Alps", price: "$19.00", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80" },
  { name: "Japan", location: "Kyoto / Fuji", price: "$19.00", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80" },
  { name: "Peru", location: "Machu Picchu", price: "$70.00", img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80" },
];

const MORE_DESTINATIONS = [
  { name: "Paris", location: "Paris, France", price: "$45.00", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80" },
  { name: "Amalfi Coast", location: "Positano, Italy", price: "$55.00", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80" },
  { name: "Iceland", location: "Reykjavik, Iceland", price: "$65.00", img: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=600&q=80" },
  { name: "Dubai", location: "Dubai, UAE", price: "$40.00", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80" },
  { name: "Banff", location: "Alberta, Canada", price: "$35.00", img: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80" },
  { name: "Rome", location: "Rome, Italy", price: "$30.00", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80" },
];

const BENEFITS = [
  { icon: "🛡️", title: "Best Price Guarantee", desc: "Guaranteed competitive rates for all curated itineraries." },
  { icon: "🏨", title: "Luxury Hotels", desc: "Hand-picked boutique stays and verified regional lodges." },
  { icon: "✈️", title: "Intelligent Travel Guides", desc: "Autonomous AI itineraries curated down to the hour." },
  { icon: "🕒", title: "24/7 Travel Assistance", desc: "Instant AI budget calculations and live routing advice." },
  { icon: "🔒", title: "Secure Ticketing", desc: "Direct integrations with verified bus and travel gateways." },
];

export default function TravelPortal({ buildTimestamp }: TravelPortalProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNavChatOpen, setIsNavChatOpen] = useState(false);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [viewAdminDashboard, setViewAdminDashboard] = useState(false);
  const { user, role, logout } = useAuth();

  useEffect(() => {
    fetch("http://localhost:5000/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Gateway connected automatically:", data.service);
      })
      .catch(() => {
        console.warn("⚠️ Gateway ping offline");
      });
  }, []);

  const visibleDestinations = showAllDestinations
    ? [...INITIAL_DESTINATIONS, ...MORE_DESTINATIONS]
    : INITIAL_DESTINATIONS;

  if (role === "admin" && viewAdminDashboard) {
    return <AdminPortal onExit={() => setViewAdminDashboard(false)} />;
  }

  if (!hasEntered) {
    return <LandingHero onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Direct AI Assistant Chat Modal from Navbar */}
      <ChatModal
        isOpen={isNavChatOpen}
        onClose={() => setIsNavChatOpen(false)}
        initialDestination=""
        initialCategory=""
      />

      {/* Top Navbar */}
      <header className="w-full bg-[#FDFBF7]/90 dark:bg-stone-950/90 backdrop-blur sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            {role === "admin" && (
              <button
                type="button"
                onClick={() => setViewAdminDashboard(true)}
                className="text-[10px] uppercase tracking-wider font-mono font-bold px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>🛡️ Admin Dashboard</span>
                <span>→</span>
              </button>
            )}
          </div>

          {/* Nav Links including Direct Chatbot Option */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-stone-600 dark:text-stone-300 font-medium">
            <a href="#destinations" className="hover:text-stone-950 dark:hover:text-white transition">
              Destinations
            </a>
            <a href="#feedback" className="hover:text-stone-950 dark:hover:text-white transition">
              Feedback
            </a>
            <a href="#benefits" className="hover:text-stone-950 dark:hover:text-white transition">
              Benefits
            </a>
            <a href="#contact" className="hover:text-stone-950 dark:hover:text-white transition">
              Contact Us
            </a>

            {/* Direct Chatbot Nav Link */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setIsAuthOpen(true);
                } else {
                  setIsNavChatOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition active:scale-95 cursor-pointer font-semibold"
            >
              <span>✨</span>
              <span>AI Assistant</span>
            </button>
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
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
            alt="Tropical Beach"
            fill
            priority
            className="object-cover object-center brightness-95 animate-ocean-waves pointer-events-none origin-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-emerald-900/30 mix-blend-overlay animate-water-glimmer pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-stone-950/25 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center text-left">
          <div className="max-w-xl space-y-4">
            <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.25em] text-amber-300 font-bold bg-black/40 px-3.5 py-1 rounded-full border border-amber-300/30 backdrop-blur-xs">
              YOUR JOURNEY, YOUR WAY
            </span>
            <h1 className="text-5xl sm:text-6xl font-serif font-medium tracking-tight text-white leading-[1.1] drop-shadow-md">
              Dream It. Plan It. <br /> Live It.
            </h1>
            <p className="text-sm sm:text-base text-stone-100 font-light leading-relaxed max-w-md drop-shadow">
              JourneyBuddy brings destinations, experiences, and intelligent travel planning together in one seamless journey.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="#destinations"
                className="px-6 py-3 rounded-full text-xs font-bold bg-white text-stone-900 hover:bg-stone-100 shadow-md transition"
              >
                Explore Destinations →
              </a>
              <a
                href="https://www.youtube.com/results?search_query=world+travel+cinematic+4k"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-xs font-bold bg-[#1B3B36]/80 backdrop-blur-sm text-white hover:bg-[#1B3B36] shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>▶</span> Watch Video
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Pill Search Bar */}
      <SearchBar onRequireAuth={() => setIsAuthOpen(true)} />

      {/* Top Destinations */}
      <section id="destinations" className="max-w-7xl mx-auto px-6 pt-20 pb-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
              Top Destinations
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Hand-picked escapes with verified guides and seamless transit routes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllDestinations(!showAllDestinations)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 bg-white/70 dark:bg-stone-900 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white hover:border-transparent transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {showAllDestinations ? "Show Less ↑" : "See All (12) →"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in duration-300">
          {visibleDestinations.map((dest) => (
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

      {/* Traveler Feedback */}
      <FeedbackSection />

      {/* Benefits */}
      <section id="benefits" className="bg-[#F8F5EE] dark:bg-slate-900/60 py-16 border-y border-stone-200 dark:border-slate-800">
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

      {/* Plan Your Perfect Escape */}
      <section id="escape" className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"
              alt="Traveler"
              fill
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-xs font-semibold px-4 py-1.5 rounded-full shadow text-stone-900">
              Personalized Routing
            </span>
          </div>

          <div className="space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
              Plan Your Perfect Escape
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Experience vacation discovery with personalized agent recommendations, verified transit routing, and vector-backed knowledge integration designed to adapt to your travel style.
            </p>
            <a
              href="#destinations"
              className="inline-block px-6 py-3 rounded-full text-xs font-bold bg-[#1B3B36] hover:bg-[#152e2a] text-white shadow transition active:scale-95 cursor-pointer"
            >
              Explore Destinations
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#122622] text-stone-300 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-xs">
          <div>
            <BrandLogo className="mb-4" />
            <p className="text-stone-400 leading-relaxed mt-2">
              Autonomous AI travel orchestration engine backed by multi-vector memory and real-time routing telemetry[cite: 1, 2].
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">Itinerary Engine</li>
              <li className="hover:text-white cursor-pointer">Live Transit Pings</li>
              <li className="hover:text-white cursor-pointer">Multi-modal Routing</li>
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
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider">Connect &amp; Contact</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer">support@journeybuddy.com</li>
              <li className="hover:text-white cursor-pointer">Twitter / X</li>
              <li className="hover:text-white cursor-pointer">GitHub</li>
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