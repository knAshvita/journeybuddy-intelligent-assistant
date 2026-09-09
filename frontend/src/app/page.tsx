import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import StatusCard from "@/components/StatusCard";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const buildTimestamp = new Date().toUTCString();

  return (
    <main className="min-h-screen bg-[#E8E2D5] dark:bg-slate-950 text-[#3D332A] dark:text-slate-100 flex flex-col items-center">
      {/* Top Hero Banner */}
      <header className="relative w-full h-80 border-b-2 border-[#C8BBA4]/50 dark:border-slate-800 overflow-hidden shadow-lg">
        <Image
          src="/hero-banner.jpg"
          alt="JourneyBuddy Map Landscape"
          fill
          priority
          className="object-cover object-center filter brightness-105 contrast-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#F5F1E8]/25 dark:bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6">
          <div className="absolute top-5 right-6">
            <ThemeToggle />
          </div>

          <div className="p-4 rounded-xl backdrop-blur-md bg-white/40 dark:bg-slate-900/60 border border-white/50 dark:border-slate-700/50 shadow-md">
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#241A12] dark:text-white drop-shadow-sm">
              JourneyBuddy Assistant
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-[#4A3A2A] dark:text-slate-300 mt-1">
              Your Guide to Seamless Exploration.
            </p>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#5C4835] dark:text-emerald-400 block mt-1">
              Core Architecture Blueprint — Integrated Intelligence Pipeline
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full px-6 py-8">
        <SearchBar />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <StatusCard />

          <div className="p-5 border rounded-2xl shadow-md backdrop-blur-md bg-[#FAF7F0]/85 dark:bg-slate-900/80 border-[#D9CBB0] dark:border-slate-700">
            <span className="text-xs uppercase tracking-wider font-semibold block mb-1 text-[#6F614C] dark:text-emerald-400">
              Server Component: Pipeline Blueprint
            </span>
            <h3 className="text-lg font-bold text-[#2B2118] dark:text-slate-100">Integration Pipeline</h3>
            <ul className="text-xs space-y-2 mt-3 font-mono text-[#5C4D3C] dark:text-slate-300">
              <li>🧭 Next.js Client Interface</li>
              <li>⚡ Node/FastAPI Gateway</li>
              <li>🔒 Firebase Auth & Redis</li>
              <li>🍃 MongoDB & Pinecone Vector Search</li>
              <li>🧠 LangChain Agent Reasoning</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border flex items-center gap-3 text-xs font-mono backdrop-blur-md bg-[#F5EFE4]/80 dark:bg-slate-900/60 border-[#D5C7B0] dark:border-slate-800 text-[#5C4D3C] dark:text-slate-400">
          <span className="text-xl">⚙️</span>
          <div>
            <p className="font-bold text-[#2B2118] dark:text-slate-200">Telemetry Interceptor Middleware</p>
            <p>Static Pre-render Timestamp: {buildTimestamp}</p>
          </div>
        </div>
      </div>
    </main>
  );
}