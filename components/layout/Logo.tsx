"use client";

import Link from "next/link";

type LogoProps = {
  /** Where the logo links to. Defaults to the public homepage. */
  href?: string;
  /** Text under "Premasse" — lets pages like the admin dashboard show
   *  their own context (e.g. "Admin dashboard") instead of the default. */
  subtitle?: string;
  /** "sm" (default) is the compact inline lockup used in navbars/footers.
   *  "lg" is a larger, centered lockup for auth/hero-style pages. */
  size?: "sm" | "lg";
  className?: string;
  onClick?: () => void;
};

export default function Logo({
  href = "/",
  subtitle = "Business Services",
  size = "sm",
  className = "",
  onClick,
}: LogoProps) {
  const isLarge = size === "lg";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative z-50 flex items-center ${
        isLarge ? "flex-col gap-4" : "gap-2.5"
      } ${className}`}
    >
      <img
        src="/images/logos/logo-mark.svg"
        alt="Premasse Business Services"
        className={`${
          isLarge ? "h-16" : "h-8"
        } w-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.03]`}
      />
      <span className={`flex flex-col leading-none ${isLarge ? "items-center" : ""}`}>
        <span
          className={`font-display font-bold text-white tracking-wide ${
            isLarge ? "text-4xl" : "text-xl"
          }`}
        >
          Premasse
        </span>
        <span
          className={`text-gold font-body font-medium uppercase tracking-[0.2em] ${
            isLarge ? "mt-2 text-xs" : "text-[10px]"
          }`}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
