"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle Theme"
      className="p-2 rounded-full border shadow-sm bg-[#F5F1E8]/80 dark:bg-slate-900/80 border-[#C8BBA4] dark:border-slate-700 hover:scale-110"
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}