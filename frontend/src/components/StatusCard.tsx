"use client";

import { useEffect, useState } from "react";

export default function StatusCard() {
  const [status, setStatus] = useState("Client Connected");
  const [latency, setLatency] = useState<number | null>(null);
  const [lastSignal, setLastSignal] = useState<string>("--:--:--");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLastSignal(new Date().toLocaleTimeString());
  }, []);

  const pingGateway = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("http://localhost:5000/api/telemetry");
      const data = await res.json();
      const end = performance.now();

      setLatency(Math.round(end - start));
      setStatus(`${data.service} (Uptime: ${Math.round(data.uptime)}s)`);
      setLastSignal(new Date().toLocaleTimeString());
    } catch {
      setStatus("Gateway Offline / Connection Refused");
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border rounded-2xl shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <span className="text-xs uppercase tracking-wider font-semibold block mb-1 text-slate-500 dark:text-emerald-400">
        Client Component: Telemetry
      </span>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gateway Status</h3>

      <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <span
          className={`w-3 h-3 rounded-full ${
            status.includes("Offline") ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
        <span>{status}</span>
      </div>

      <p
        suppressHydrationWarning
        className="text-xs text-slate-500 dark:text-slate-400 mt-1"
      >
        Last signal: {lastSignal} {latency !== null && `• Latency: ${latency}ms`}
      </p>

      <button
        type="button"
        onClick={pingGateway}
        disabled={loading}
        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 active:scale-95 cursor-pointer"
      >
        {loading ? "Pinging..." : "Ping Gateway"}
      </button>
    </div>
  );
}