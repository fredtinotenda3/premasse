"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group relative z-50">
      <img
        src="/images/logos/logo-mark.svg"
        alt="Premasse Business Services"
        className="h-8 w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold text-white tracking-wide">
          Premasse
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-body font-medium">
          Business Services
        </span>
      </span>
    </Link>
  );
}