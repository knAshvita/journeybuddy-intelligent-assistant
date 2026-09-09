"use client";

import { useState } from "react";
import Image from "next/image";
import SplashScreen from "./SplashScreen";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import StatusCard from "./StatusCard";

export default function TravelPortal({ buildTimestamp }: { buildTimestamp: string }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className="min-h-screen bg-[#F7F7F7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
          <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight text-[#D84E55] font-serif">
              JourneyBuddy
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero Section with Banner Image */}
        <section className="relative w-full h-80 overflow-hidden">
          <Image
            src="/hero-banner.jpg"
            alt="JourneyBuddy Map Landscape"
            fill
            priority
            className="object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6">
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-white drop-shadow-md">
              JourneyBuddy Assistant
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-slate-200 mt-2">
              Your Guide to Seamless Exploration.
            </p>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 block mt-2">
              Core Architecture Blueprint — Integrated Intelligence Pipeline
            </span>
          </div>
        </section>

        {/* Floating AI Query Search Console */}
        <SearchBar />

        {/* Main Content Modules */}
        <div className="max-w-4xl w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <StatusCard />

            <div className="p-5 border rounded-2xl shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="text-xs uppercase tracking-wider font-semibold block mb-1 text-[#D84E55] dark:text-emerald-400">
                Server Component: Pipeline Blueprint
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Integration Pipeline
              </h3>
              <ul className="text-xs space-y-2 mt-3 font-mono text-slate-600 dark:text-slate-300">
                <li>🧭 Next.js Client Interface</li>
                <li>⚡ Node/FastAPI Gateway</li>
                <li>🔒 Firebase Auth &amp; Redis</li>
                <li>🍃 MongoDB &amp; Pinecone Vector Search</li>
                <li>🧠 LangChain Agent Reasoning</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <span className="text-xl">⚙️</span>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Telemetry Interceptor Middleware
              </p>
              <p suppressHydrationWarning>Static Pre-render Timestamp: {buildTimestamp}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}