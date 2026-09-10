"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function StatusCard() {
  const { user } = useAuth();
  const [status, setStatus] = useState("Client Connected");
  const [latency, setLatency] = useState<number | null>(null);
  const [lastSignal, setLastSignal] = useState(new Date().toLocaleTimeString());
  const [loading, setLoading] = useState(false);
  const [authResponse, setAuthResponse] = useState<string | null>(null);

  // Ping Gateway Health Check
  const pingGateway = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("http://localhost:5000/api/telemetry");
      const data = await res.json();
      const end = performance.now();

      setLatency(Math.round(end - start));
      setStatus(`${data.service || "Gateway Active"} (${Math.round(data.uptime || 0)}s uptime)`);
      setLastSignal(new Date().toLocaleTimeString());
    } catch {
      setStatus("Gateway Offline");
      setLatency(null);
    } finally {
      setLoading(false);
    }
  };

  // Test Protected Backend Route with Firebase Bearer Token
  const testProtectedEndpoint = async () => {
    if (!user) {
      setAuthResponse("⚠️ You must log in first to test protected endpoints.");
      return;
    }

    try {
      setAuthResponse("Fetching ID token from Firebase...");
      // Extract Firebase JWT token
      const token = await user.getIdToken();

      // Send to Express Backend with Bearer header
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setAuthResponse(`✅ Verified! UID: ${data.user.uid.slice(0, 8)}... (${data.user.email})`);
      } else {
        setAuthResponse(`❌ ${data.error || "Token verification failed"}`);
      }
    } catch (err: any) {
      setAuthResponse(`❌ Network error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 border rounded-3xl shadow-sm bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 flex flex-col justify-between">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold block mb-2 text-[#183630] dark:text-emerald-400">
          Client Component: Telemetry & Security
        </span>
        <h3 className="text-lg font-bold text-stone-900 dark:text-slate-100">Gateway & Auth Guard</h3>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status.includes("Offline") ? "bg-red-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="font-semibold text-stone-800 dark:text-slate-200">{status}</span>
          </div>
          <p className="text-stone-500 dark:text-slate-400">
            Last signal: {lastSignal} {latency !== null && `• Latency: ${latency}ms`}
          </p>
        </div>

        {authResponse && (
          <div className="mt-3 p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-mono text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-slate-700">
            {authResponse}
          </div>
        )}
      </div>

      <div className="pt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={pingGateway}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#183630] hover:bg-[#224e43] text-white border border-emerald-900 transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Pinging..." : "Ping Gateway"}
        </button>

        <button
          type="button"
          onClick={testProtectedEndpoint}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition active:scale-95 cursor-pointer"
        >
          Verify Bearer Token
        </button>
      </div>
    </div>
  );
}