"use client";

import { useState, useEffect, useRef } from "react";

export interface TravelContext {
  destination?: string;
  members?: number;
  days?: number;
  transport?: string;
  budget?: number;
  selectedLodge?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  bookingLink?: string | null;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDestination?: string;
  initialCategory?: string;
}

// Interactive Item Card inside Assistant Messages
function InteractiveCardItem({
  title,
  desc,
  price,
  destination,
  onSelectLodge,
  onAskDetail,
}: {
  title: string;
  desc: string;
  price: string | null;
  destination: string;
  onSelectLodge: (name: string, price: string | null) => void;
  onAskDetail: (query: string) => void;
}) {
  const isLodge = /lodge|residency|hotel|inn|cottage|guest house|resort/i.test(title);
  const isFinalTotal = /final total|estimated total/i.test(title);

  const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
    `${title} ${destination}`
  )}`;

  return (
    <div
      className={`p-3.5 rounded-2xl transition-all shadow-sm group ${
        isFinalTotal
          ? "bg-gradient-to-r from-[#0B6E4F]/30 to-[#08523A]/50 border-2 border-emerald-500 shadow-emerald-950/40"
          : "bg-[#0F2420] border border-emerald-900/50 hover:border-emerald-600/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-bold text-xs sm:text-sm ${
                isFinalTotal ? "text-white text-sm sm:text-base font-serif" : "text-emerald-300"
              }`}
            >
              {isFinalTotal ? "🏷️ " + title : title}
            </span>
            {isLodge && (
              <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Lodge / Stay
              </span>
            )}
          </div>
          {desc && (
            <p className={`text-xs mt-1 leading-relaxed ${isFinalTotal ? "text-emerald-100 font-medium" : "text-stone-300"}`}>
              {desc}
            </p>
          )}
        </div>

        {price && (
          <span
            className={`shrink-0 text-[11px] font-mono px-2.5 py-1 rounded font-bold self-start ${
              isFinalTotal
                ? "bg-amber-400 text-stone-950 shadow-md text-xs sm:text-sm"
                : "bg-black/40 text-amber-300 border border-amber-900/40"
            }`}
          >
            {price}
          </span>
        )}
      </div>

      {/* Hide search buttons for final total summary cards */}
      {!isFinalTotal && (
        <div className="mt-3 pt-2.5 border-t border-emerald-900/30 flex items-center justify-between gap-2 flex-wrap text-[11px]">
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/60 text-emerald-300 hover:text-white border border-emerald-800/40 transition-all"
          >
            <span>🔍 View Photos on Google</span>
            <span className="text-[10px]">↗</span>
          </a>

          {isLodge ? (
            <button
              type="button"
              onClick={() => onSelectLodge(title, price)}
              className="px-3 py-1 rounded-lg bg-[#0B6E4F] hover:bg-[#08523A] text-white font-semibold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
            >
              <span>💰 Calculate Group Budget</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onAskDetail(`Tell me more details and travel tips about: ${title}`)}
              className="px-2.5 py-1 rounded-lg bg-[#142E2A] hover:bg-[#1a3c37] text-stone-300 hover:text-emerald-300 border border-emerald-800/40 transition-colors cursor-pointer"
            >
              💡 Learn More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Formatter mapping raw markdown to interactive cards
// Formatter mapping raw markdown to interactive cards
function FormattedAssistantMessage({
  content,
  destination,
  onSelectLodge,
  onAskDetail,
}: {
  content: string;
  destination: string;
  onSelectLodge: (name: string, price: string | null) => void;
  onAskDetail: (query: string) => void;
}) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentBullets: string[] = [];

  const flushBullets = (keyPrefix: string) => {
    if (currentBullets.length === 0) return;
    elements.push(
      <div key={`${keyPrefix}-cards`} className="space-y-2.5 my-2.5">
        {currentBullets.map((bText, bIdx) => {
          const priceMatch = bText.match(/\((?:~?[$₹][\d,]+(?:\s*-\s*[$₹]?[\d,]+)?(?:\/[a-zA-Z]+)?)\)/);
          const price = priceMatch ? priceMatch[0].replace(/[()]/g, "") : null;
          const cleanText = price ? bText.replace(priceMatch![0], "").trim() : bText;

          const splitTitle = cleanText.split(/:\s*(.+)/);
          const title = (splitTitle[0] || cleanText).replace(/\*\*/g, "").trim();
          const desc = splitTitle[1]?.trim() || "";

          return (
            <InteractiveCardItem
              key={bIdx}
              title={title}
              desc={desc}
              price={price}
              destination={destination}
              onSelectLodge={onSelectLodge}
              onAskDetail={onAskDetail}
            />
          );
        })}
      </div>
    );
    currentBullets = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushBullets(`gap-${idx}`);
      return;
    }

    // 1. Detect divider lines like '---' or '-------'
    const isDivider = /^[-*_]{3,}$/.test(line.replace(/\s/g, ""));
    if (isDivider) {
      flushBullets(`pre-hr-${idx}`);
      elements.push(
        <hr key={`hr-${idx}`} className="border-t border-emerald-900/40 my-3" />
      );
      return;
    }

    // 2. Strict bullet matching (requires a space after * or -)
    const isBullet = /^[*•]\s+/.test(line) || /^-\s+/.test(line);

    // 3. Section Headers
    const headerMatch = line.match(/^(?:###|\*\*)\s*(.*?)(?:\*\*|:)?$/);

    if (isBullet) {
      currentBullets.push(line.replace(/^[*•-]\s*/, ""));
    } else if (headerMatch && !line.includes(": ")) {
      flushBullets(`pre-hdr-${idx}`);
      elements.push(
        <div key={`hdr-${idx}`} className="mt-4 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-emerald-300 font-mono">
            {headerMatch[1].replace(/\*\*/g, "").trim()}
          </h4>
        </div>
      );
    } else {
      flushBullets(`pre-p-${idx}`);
      elements.push(
        <p key={`p-${idx}`} className="text-xs sm:text-sm text-stone-200 leading-relaxed my-1.5">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }
  });

  flushBullets("end");
  return <div className="space-y-1">{elements}</div>;
}

export default function ChatModal({
  isOpen,
  onClose,
  initialDestination = "",
  initialCategory = "",
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [travelContext, setTravelContext] = useState<TravelContext>({
    destination: initialDestination,
  });

  // Dynamic context-based Quick Ask chips
  const [currentChips, setCurrentChips] = useState<string[]>([
    "⭐ What to do here?",
    "🏨 Affordable Lodges",
    "💰 Budget for 4 (₹10,000)",
    "🚌 Transport & Bus",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const dest = initialDestination.trim();
      setTravelContext({ destination: dest });

      const greeting = dest
        ? `Hello! I am your AI assistant for **${dest}**${
            initialCategory ? ` (${initialCategory})` : ""
          }.\n\nClick any card below to view photos, learn more, or calculate a group budget:`
        : "Hello! I am your JourneyBuddy AI travel assistant. Where would you like to explore?";

      setMessages([{ role: "assistant", content: greeting }]);
      setCurrentChips([
        "⭐ What to do here?",
        "🏨 Affordable Lodges",
        "💰 Budget for 4 (₹10,000)",
        "🚌 Transport & Bus",
      ]);
    }
  }, [isOpen, initialDestination, initialCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  // Dynamic follow-up chips based on topic
  const updateDynamicChips = (text: string) => {
    const q = text.toLowerCase();
    if (q.includes("lodge") || q.includes("stay") || q.includes("hotel") || q.includes("accommodation")) {
      setCurrentChips([
        "👥 2 People",
        "👥 4 People",
        "👥 6 People",
        "🚗 How to reach by Car?",
      ]);
    } else if (q.includes("budget") || q.includes("cost") || q.includes("₹") || q.includes("people")) {
      setCurrentChips([
        "🚌 Book RedBus Tickets",
        "🍽️ Food & Dining Cost",
        "🗓️ 2-Day Itinerary Plan",
        "🏨 View Other Stays",
      ]);
    } else if (q.includes("transport") || q.includes("bus") || q.includes("reach")) {
      setCurrentChips([
        "🚌 Open RedBus Search",
        "🏨 Lodges Near Bus Stand",
        "🚗 Car Fuel & Toll Cost",
        "⭐ Top Things to Do",
      ]);
    } else {
      setCurrentChips([
        "🏨 Affordable Lodges",
        "💰 Budget for 4 (₹10,000)",
        "🚌 Transport & Bus",
        "⭐ 1-Day Quick Tour",
      ]);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);

    const updatedContext = { ...travelContext };
    const numMatch = textToSend.match(/(\d+)\s*(people|members|persons|travelers|pax)?/i);
    if (numMatch && !textToSend.includes("₹")) {
      updatedContext.members = parseInt(numMatch[1], 10);
    }

    const daysMatch = textToSend.match(/(\d+)\s*(day|days|night|nights)/i);
    if (daysMatch) updatedContext.days = parseInt(daysMatch[1], 10);

    if (/car|drive|road/i.test(textToSend)) updatedContext.transport = "Car";
    if (/bus|coach/i.test(textToSend)) updatedContext.transport = "Bus";
    if (/train|rail/i.test(textToSend)) updatedContext.transport = "Train";

    const budgetMatch = textToSend.match(/(?:rs\.?|₹|inr|\$)\s*([\d,]+)/i);
    if (budgetMatch) {
      updatedContext.budget = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
    }
    setTravelContext(updatedContext);

    updateDynamicChips(textToSend);

    // If a lodge was previously selected and user inputs group size, form a specific query
    let queryPayload = textToSend;
    if (updatedContext.selectedLodge && numMatch && !textToSend.includes("stay at")) {
      queryPayload = `We are ${updatedContext.members || numMatch[1]} people staying at ${updatedContext.selectedLodge} for 2 days. Provide an itemized estimated budget breakdown (Stay, Food, Local Transport, Activities) and total in INR (₹).`;
    }

    try {
      const res = await fetch("http://localhost:5000/api/chat/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryPayload,
          destination: updatedContext.destination || "",
          history: updatedHistory.slice(-6),
          travelContext: updatedContext,
          targetCount: 10,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.answer,
            bookingLink: data.bookingLink,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${data.error || "Could not process request."}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Connection error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // When user clicks "Calculate Group Budget" on a lodge card:
  // The AI asks how many people are traveling and offers number selection chips
  const handleSelectLodge = (lodgeName: string, priceEstimate: string | null) => {
    setTravelContext((prev) => ({ ...prev, selectedLodge: lodgeName }));

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Great choice! For **${lodgeName}** ${
          priceEstimate ? `(${priceEstimate})` : ""
        }:\n\n**How many people are planning to travel?**\nClick a number below or type your group size:`,
      },
    ]);

    // Provide number selection chips
    setCurrentChips([
      "👥 2 People",
      "👥 4 People",
      "👥 6 People",
      "👥 8 People",
      "🚗 Traveling by Car",
      "🚌 Traveling by Bus",
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[88vh] max-h-[760px] bg-[#0A1815] border border-emerald-900/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-200 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F2420] border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#08523A] border border-emerald-600/40 flex items-center justify-center text-xl shadow-inner">
              ✨
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                {travelContext.destination
                  ? `Guide: ${travelContext.destination}`
                  : "JourneyBuddy AI Assistant"}
              </h3>
              <p className="text-xs font-mono text-emerald-400">
                Interactive Cards • Photo Search • Dynamic RAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-red-950/60 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[92%] p-4 rounded-2xl shadow-md ${
                  m.role === "user"
                    ? "bg-[#0B6E4F] text-white rounded-br-none text-xs sm:text-sm leading-relaxed"
                    : "bg-[#142E2A] text-stone-200 border border-emerald-900/40 rounded-bl-none"
                }`}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <FormattedAssistantMessage
                    content={m.content}
                    destination={travelContext.destination || "Destination"}
                    onSelectLodge={handleSelectLodge}
                    onAskDetail={(q) => sendMessage(q)}
                  />
                )}

                {/* Optional RedBus Booking Redirect */}
                {m.bookingLink && (
                  <div className="mt-4 pt-3 border-t border-emerald-800/40">
                    <p className="text-[11px] text-emerald-300 mb-2 font-mono">
                      🚍 Continue journey planning with bus ticketing:
                    </p>
                    <a
                      href={m.bookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D84E55] hover:bg-[#b83d43] text-white font-bold text-xs tracking-wide transition-all shadow-md active:scale-95"
                    >
                      <span>🚌 Book on RedBus (Official)</span>
                      <span>↗</span>
                    </a>
                    <p className="text-[10px] text-stone-400 mt-1 italic">
                      *Redirects to official RedBus portal. JourneyBuddy does not process transactions directly.
                    </p>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-500 font-mono mt-1 px-1">
                {m.role === "user" ? "You" : "JourneyBuddy AI"}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#142E2A] border border-emerald-900/30 text-emerald-400 text-xs font-mono animate-pulse w-fit">
              <span className="animate-spin">⚡</span>
              <span>Formulating travel guidance &amp; cost calculations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Context-Aware Quick Ask Chips */}
        <div className="px-5 py-2.5 bg-[#0F2420]/80 border-t border-emerald-900/30 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
          <span className="text-stone-400 shrink-0">Quick Options:</span>
          
          {currentChips.map((chip, cIdx) => (
            <button
              key={cIdx}
              onClick={() => sendMessage(chip)}
              className="px-3 py-1 rounded-full bg-[#142E2A] hover:bg-[#1f4741] text-emerald-300 border border-emerald-800/60 shrink-0 transition-all cursor-pointer hover:border-emerald-500/60 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-4 bg-[#0F2420] border-t border-emerald-900/40 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              travelContext.selectedLodge
                ? `Enter number of people for ${travelContext.selectedLodge} (e.g., '4 people')...`
                : travelContext.destination
                ? `Ask about ${travelContext.destination}...`
                : "Ask about any place, budget, or transport..."
            }
            className="flex-1 bg-black/40 border border-emerald-900/50 rounded-2xl px-5 py-3 text-xs sm:text-sm text-white placeholder-stone-500 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-2xl bg-[#0B6E4F] hover:bg-[#08523A] text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}