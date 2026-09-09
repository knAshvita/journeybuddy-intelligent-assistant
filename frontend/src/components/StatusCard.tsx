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
    <div className="p-5 border rounded-2xl shadow-md backdrop-blur-md text-left bg-[#FAF7F0]/85 dark:bg-slate-900/80 border-[#D9CBB0] dark:border-slate-700">
      <span className="text-xs uppercase tracking-wider font-semibold block mb-1 text-[#6F614C] dark:text-emerald-400">
        Client Component: Telemetry
      </span>
      <h3 className="text-lg font-bold text-[#2B2118] dark:text-slate-100">Gateway Status</h3>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            isLive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-amber-500"
          }`}
        />
        <span className="text-sm font-semibold text-[#3D332A] dark:text-slate-200">
          {isLive ? "Client Connected" : "Standing By"}
        </span>
      </div>
      <p className="text-xs text-[#807058] dark:text-slate-400 mt-1">Last signal: {lastPing}</p>
      <button
        type="button"
        onClick={checkStatus}
        className="mt-4 text-xs px-4 py-2 rounded-full font-medium bg-[#4A3F2F] hover:bg-[#382F22] text-[#F5F1E8] dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:text-white"
      >
        Ping Gateway
      </button>
    </div>
  );
}