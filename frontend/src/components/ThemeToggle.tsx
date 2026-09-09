"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme toggle loading"
        className="p-2 rounded-full border border-slate-200 dark:border-slate-700 opacity-60 text-lg"
      >
        ☀️
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle Theme"
      className="p-2 rounded-full border shadow-sm bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:scale-110 cursor-pointer"
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}