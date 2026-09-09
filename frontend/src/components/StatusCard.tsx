"use client";

import { useState } from "react";

export default function StatusCard() {
  const [lastPing, setLastPing] = useState<string>("Not checked yet");
  const [isLive, setIsLive] = useState(false);

  const checkStatus = () => {
    setIsLive(true);
    setLastPing(new Date().toLocaleTimeString());
  };

  return (
    <div className="p-4 border border-slate-700 bg-white/5 rounded-lg text-left">
      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
        Client Component: Telemetry
      </span>
      <h3 className="text-base font-bold text-slate-100">Gateway Status</h3>
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
        <span className="text-sm font-medium text-slate-200">
          {isLive ? "Client Connected" : "Standing By"}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-1">Last signal: {lastPing}</p>
      <button
        type="button"
        onClick={checkStatus}
        className="mt-3 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 px-3 py-1.5 rounded transition-colors"
      >
        Ping Gateway
      </button>
    </div>
  );
}