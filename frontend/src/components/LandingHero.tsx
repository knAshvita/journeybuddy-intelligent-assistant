"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import BrandLogo from "./BrandLogo";

interface LandingHeroProps {
  onEnter: () => void;
}

const FEATURED_EXPEDITIONS = [
  {
    title: "Campfire Stories",
    subtitle: "Serengeti Night Camp",
    img: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Wildlife Reserve",
    subtitle: "Maasai Mara Crossing",
    img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Safari Transport",
    subtitle: "Savannah 4x4 Trail",
    img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Scenic Boating",
    subtitle: "Okavango Delta",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Guided Exploration",
    subtitle: "Rainforest Canopy",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Jungle Trekking",
    subtitle: "Bwindi Mist Trail",
    img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Safari Adventure",
    subtitle: "Elephant Sanctuary",
    img: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80",
  },
];

export default function LandingHero({ onEnter }: LandingHeroProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse Drag-To-Slide Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0A1210] text-white select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Main Agency Header & CTA Area */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-10 sm:pt-14 max-w-4xl mx-auto space-y-6">
        
        {/* Adjusted Logo Capsule */}
        <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-transform hover:scale-105">
          <BrandLogo />
        </div>

        {/* Agency Tagline */}
        <div className="space-y-3.5 max-w-2xl">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.25em] text-amber-400 font-bold bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
            Bespoke Wilderness &amp; Luxury Escapes
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-100 tracking-tight leading-[1.15]">
            Adventure Awaits in <br /> Nature&apos;s Wonders
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Explore the wild with our guided safaris and immersive tours. Experience breathtaking landscapes, encounter wildlife, and create unforgettable memories.
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onEnter}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF9209] to-[#8B5CF6] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 mx-auto"
          >
            <span>Explore Destinations</span>
            <span className="text-base">→</span>
          </button>
        </div>
      </div>

      {/* Smooth Mouse-Slide Carousel Showcase */}
      <div className="relative w-full z-10 pt-4 pb-8 overflow-hidden">
        
        {/* Drag-To-Scroll Interactive Track */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex items-center gap-4 px-8 overflow-x-auto no-scrollbar py-4 select-none ${
            isDown ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {FEATURED_EXPEDITIONS.map((exp, idx) => (
            <div
              key={idx}
              onClick={onEnter}
              className="relative shrink-0 w-48 sm:w-56 h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-stone-900 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-400/60 group cursor-pointer"
            >
              <Image
                src={exp.img}
                alt={exp.title}
                fill
                sizes="250px"
                draggable={false}
                className="object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                  {exp.subtitle}
                </span>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {exp.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle Agency Subtitle with drag helper hint */}
        <div className="text-center pt-2 text-[11px] text-stone-400 font-mono tracking-wider flex items-center justify-center gap-2">
          <span>‹ Drag sideways to explore destinations ›</span>
        </div>
      </div>
    </div>
  );
}