import SearchBar from "@/components/SearchBar";
import StatusCard from "@/components/StatusCard";

export default function Home() {
  const buildTimestamp = new Date().toUTCString();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center">
      <header className="max-w-4xl w-full text-center py-6 border-b border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          JourneyBuddy Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Architecture Prototype — Hybrid Client/Server Boundary
        </p>
      </header>

      {/* Static Server-Rendered Section */}
      <section className="max-w-4xl w-full my-6 p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
          Server Component (Static Shell)
        </span>
        <p>
          Rendered statically at build time. Pre-renders navigation, structural scaffolding, and SEO metadata without sending unnecessary JavaScript to the browser.
        </p>
        <p className="mt-1 font-mono text-slate-500">
          Shell Pre-render Timestamp: {buildTimestamp}
        </p>
      </section>

      {/* Interactive Client Boundary */}
      <section className="max-w-4xl w-full">
        <SearchBar />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <StatusCard />
          <div className="p-4 border border-slate-800 bg-slate-900/40 rounded-lg">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Server Component: Pipeline Blueprint
            </span>
            <h3 className="text-base font-bold text-slate-200">Integration Pipeline</h3>
            <ul className="text-xs text-slate-400 space-y-1.5 mt-2 font-mono">
              <li>1. Next.js Client Interface</li>
              <li>2. Node/FastAPI Gateway</li>
              <li>3. Firebase Auth & Redis</li>
              <li>4. MongoDB & Pinecone Vector Search</li>
              <li>5. LangChain Agent Reasoning</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}