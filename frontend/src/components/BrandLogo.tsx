"use client";

import Link from "next/link";

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 sm:gap-3 whitespace-nowrap select-none ${className}`}
    >
      {/* Abstract Dual-Tone 'J' Mark */}
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="15"
          width="9.5"
          height="14"
          rx="4.75"
          fill="#8B5CF6"
        />
        <path
          d="M16 8C16 5.79086 17.7909 4 20 4H23.5C25.7091 4 27.5 5.79086 27.5 8V23.5C27.5 27.0899 24.5899 30 21 30H19C17.3431 30 16 28.6569 16 27V8Z"
          fill="#FF9209"
        />
      </svg>

      {/* Brand Name */}
      <span className="font-semibold text-xl sm:text-2xl tracking-tight text-[#FF9209] font-sans leading-none">
        Journey buddy
      </span>
    </Link>
  );
}