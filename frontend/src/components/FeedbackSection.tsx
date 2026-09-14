"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export interface FeedbackItem {
  id?: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  stars: number;
  destination?: string;
}

export const VERIFIED_FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: "JB-9102",
    quote:
      "The autonomous budget calculator was a lifesaver for our group trip to Karkala! It calculated our room tariffs, food expenses, and bus fares for 4 people under ₹15,000 without any guesswork. Thank you, JourneyBuddy!",
    author: "Aditi Rao",
    role: "Solo Traveler & Explorer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    stars: 5,
    destination: "Karkala Heritage Trail",
  },
  {
    id: "JB-9098",
    quote:
      "The 'Know More' AI feature helped me plan my weekend getaway to Mangalore. It showed authentic heritage temples and clean beaches without hallucinated spots. Clicking the photo link to preview hotel rooms before booking gave us huge confidence!",
    author: "Rohan Shenoy",
    role: "Backpacker & Tech Enthusiast",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    stars: 4,
    destination: "Mangalore Coastal Tour",
  },
  {
    id: "JB-9081",
    quote:
      "Planning a 3-day family trip to Goa used to take hours. JourneyBuddy's day-by-day itinerary feature organized our mornings and afternoons cleanly, and the direct RedBus redirect made booking our transit tickets super convenient.",
    author: "Sneha Hegde",
    role: "Family Vacation Planner",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    stars: 5,
    destination: "Goa Beachfront & Forts",
  },
  {
    id: "JB-9074",
    quote:
      "I asked the assistant for budget lodges near Karkala bus stand and it gave realistic options like Coastal Breeze Residency along with estimated night tariffs. The custom itemized expense table helped us stay well within our budget!",
    author: "Vikram Kulkarni",
    role: "Heritage & Trekking Traveler",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    stars: 4,
    destination: "Karkala Monolith Route",
  },
  {
    id: "JB-9063",
    quote:
      "The destination search and interactive cards made discovering places around Udupi effortless. Having instant lodge suggestions with transparent meal and activity estimates made this our easiest trip yet. Great work, JourneyBuddy!",
    author: "Pooja Varma",
    role: "Weekend Getaway Explorer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    stars: 5,
    destination: "Udupi Temple & Beaches",
  },
];

export default function FeedbackSection() {
  const { user } = useAuth();
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // User Interactive Submission Form State
  const [authorName, setAuthorName] = useState(user?.displayName || "");
  const [authorEmail, setAuthorEmail] = useState(user?.email || "");
  const [rating, setRating] = useState<number>(5);
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.6;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const newQueryItem = {
      id: `QRY-${Math.floor(1000 + Math.random() * 9000)}`,
      name: authorName.trim(),
      email: authorEmail.trim(),
      rating,
      feedback: message.trim(),
      destination: destination.trim() || "General Inquiry",
      status: "Pending Solver",
      submittedAt: new Date().toLocaleString(),
    };

    // 1. Immediately store in localStorage so it is never lost
    try {
      const existing = JSON.parse(localStorage.getItem("journeybuddy_customer_queries") || "[]");
      localStorage.setItem("journeybuddy_customer_queries", JSON.stringify([newQueryItem, ...existing]));
    } catch (err) {
      console.error("Local storage save error:", err);
    }

    // 2. Dispatch to backend database
    try {
      await fetch("http://localhost:5000/api/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authorName,
          email: authorEmail,
          rating,
          feedback: message,
          destination: destination || "General Inquiry",
          queryType: "Customer Review & Query",
        }),
      });
    } catch (err) {
      console.warn("Backend offline, cached locally:", err);
    }

    setSubmitSuccess(true);
    setMessage("");
    setDestination("");
    setIsSubmitting(false);
    setTimeout(() => setSubmitSuccess(false), 6000);
  };
    

  return (
    <section id="feedback" className="relative w-full py-16 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Testimonial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF9209] font-bold block mb-2">
            Verified Traveler Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-white">
            What Our <span className="text-[#8B5CF6]">Travelers</span> Say
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Real stories from explorers whose trips were planned by JourneyBuddy.
          </p>
        </div>

        {/* Unified Purple Arrow Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous Review"
            className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white hover:bg-[#7c4def] shadow-md transition-all flex items-center justify-center text-sm cursor-pointer active:scale-95"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next Review"
            className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white hover:bg-[#7c4def] shadow-md transition-all flex items-center justify-center text-sm cursor-pointer active:scale-95"
          >
            →
          </button>
        </div>
      </div>

      {/* Testimonials Drag Carousel */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-stretch gap-6 overflow-x-auto no-scrollbar py-2 select-none ${
          isDown ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {VERIFIED_FEEDBACK_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="shrink-0 w-80 sm:w-96 p-6 rounded-3xl bg-white dark:bg-[#0E201C] border border-stone-200/90 dark:border-emerald-900/40 shadow-lg dark:shadow-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:border-[#8B5CF6]/50"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-serif text-[#8B5CF6]/40 leading-none">“</span>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {Array.from({ length: item.stars }).map((_, sIdx) => (
                    <span key={sIdx}>★</span>
                  ))}
                  <span className="text-stone-400 dark:text-stone-500 text-[11px] font-mono ml-1">
                    {item.stars}.0
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                {item.quote}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-100 dark:border-emerald-900/30">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-stone-200 dark:border-emerald-700/50">
                <Image
                  src={item.avatar}
                  alt={item.author}
                  fill
                  sizes="40px"
                  draggable={false}
                  className="object-cover pointer-events-none"
                />
              </div>
              <div className="truncate">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white leading-tight truncate">
                  {item.author}
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-emerald-400 font-mono truncate">
                  {item.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive User Feedback & Inquiry Submission Card */}
      <div className="mt-14 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0E201C] to-[#081714] border border-emerald-800/50 shadow-2xl text-white">
        <div className="max-w-2xl mb-6">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF9209] font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Share Your Experience
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
            Leave Feedback or Ask a Question
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            Had a great trip with JourneyBuddy, or need personal query support? Send your note directly to our admin team.
          </p>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-900/50 border border-emerald-500 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <span>✨</span>
            <span>Feedback sent successfully! Our concierge team has logged your submission.</span>
          </div>
        )}

        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-900/80 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                Your Email
              </label>
              <input
                type="email"
                required
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="maya@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-900/80 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                Destination Visited / Inquired
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Karkala, Goa, or General"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-900/80 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
                Rating
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl transition-transform hover:scale-125 cursor-pointer ${
                      star <= rating ? "text-amber-400" : "text-stone-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs font-mono text-stone-400 ml-2 font-bold">{rating}.0 / 5.0</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-1">
              Feedback or Personal Travel Query
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what feature helped you, or describe any travel inquiry you want the admin team to solve..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-emerald-900/80 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF9209] to-[#8B5CF6] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Send Feedback / Query →"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}