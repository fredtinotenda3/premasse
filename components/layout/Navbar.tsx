"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menu with ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Client Portal", href: "/portal/login" },
  ];

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-500
        ${
          isScrolled || isMenuOpen
            ? "bg-[#062b22]/80 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
            : "bg-transparent"
        }
      `}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-120px] right-[-100px] w-[260px] h-[260px] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <nav className="relative mx-auto max-w-7xl px-6 lg:px-12 h-24 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="relative z-50 flex items-center group"
        >
          <div className="relative transition-all duration-300 group-hover:scale-[1.02]">
            
            <div
              className="
                rounded-2xl
                bg-white/5
                backdrop-blur-md
                border
                border-white/10
                px-3
                py-2
                shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                transition-all
                duration-300
                group-hover:bg-white/10
                group-hover:border-gold/20
              "
            >
              <Image
                src="/images/logos/logo-mark.svg"
                alt="Premasse Business Services"
                width={210}
                height={58}
                priority
                className="
                  h-auto
                  w-auto
                  max-h-[58px]
                  object-contain
                "
              />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="
                group
                relative
                text-sm
                font-body
                text-white/75
                hover:text-white
                transition-all
                duration-300
                tracking-wide
              "
            >
              {label}

              {/* Animated underline */}
              <span
                className="
                  absolute
                  left-0
                  -bottom-2
                  h-[1px]
                  w-0
                  bg-gold
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </Link>
          ))}

          {/* CTA */}
          <Link
            href="/request"
            className="
              group
              relative
              overflow-hidden
              bg-gold
              text-[#062b22]
              text-sm
              font-body
              font-semibold
              px-6
              py-3
              rounded-xl
              tracking-[0.12em]
              uppercase
              transition-all
              duration-500
              hover:-translate-y-1
              hover:shadow-[0_15px_45px_rgba(201,168,76,0.35)]
            "
          >
            <span className="relative z-10">
              Request Service
            </span>

            <div
              className="
                absolute
                inset-0
                bg-white/20
                translate-y-full
                group-hover:translate-y-0
                transition-transform
                duration-500
              "
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="
            md:hidden
            relative
            z-50
            flex
            items-center
            justify-center
            w-12
            h-12
            rounded-xl
            border
            border-white/10
            bg-white/5
            backdrop-blur-md
            text-white
            transition-all
            duration-300
            hover:bg-white/10
          "
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="relative w-5 h-5">
            <span
              className={`
                absolute
                left-0
                top-1
                h-[1.5px]
                w-5
                bg-white
                rounded-full
                transition-all
                duration-300
                ${
                  isMenuOpen
                    ? "rotate-45 top-2.5"
                    : ""
                }
              `}
            />

            <span
              className={`
                absolute
                left-0
                top-2.5
                h-[1.5px]
                w-5
                bg-white
                rounded-full
                transition-all
                duration-300
                ${
                  isMenuOpen
                    ? "opacity-0"
                    : "opacity-100"
                }
              `}
            />

            <span
              className={`
                absolute
                left-0
                top-4
                h-[1.5px]
                w-5
                bg-white
                rounded-full
                transition-all
                duration-300
                ${
                  isMenuOpen
                    ? "-rotate-45 top-2.5"
                    : ""
                }
              `}
            />
          </div>
        </button>

        {/* Mobile Overlay */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={`
            fixed
            inset-0
            bg-black/50
            backdrop-blur-sm
            transition-all
            duration-500
            md:hidden
            ${
              isMenuOpen
                ? "opacity-100 visible"
                : "opacity-0 invisible"
            }
          `}
        />

        {/* Mobile Menu */}
        <div
          className={`
            fixed
            top-0
            right-0
            h-screen
            w-[88%]
            max-w-sm
            bg-[#062b22]/95
            backdrop-blur-2xl
            border-l
            border-white/10
            shadow-2xl
            transition-all
            duration-500
            md:hidden
            ${
              isMenuOpen
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* Ambient lighting */}
          <div className="absolute top-[-120px] right-[-60px] w-[240px] h-[240px] rounded-full bg-gold/10 blur-3xl" />

          <div className="relative flex flex-col h-full px-8 pt-32 pb-10">
            
            {/* Mobile links */}
            <div className="flex flex-col gap-1">
              {navLinks.map(({ label, href }, index) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="
                    group
                    relative
                    text-white/80
                    hover:text-white
                    text-lg
                    font-body
                    py-4
                    border-b
                    border-white/10
                    transition-all
                    duration-300
                  "
                  style={{
                    transitionDelay: `${index * 70}ms`,
                  }}
                >
                  <span className="relative">
                    {label}

                    <span
                      className="
                        absolute
                        left-0
                        -bottom-1
                        h-[1px]
                        w-0
                        bg-gold
                        transition-all
                        duration-300
                        group-hover:w-full
                      "
                    />
                  </span>
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <Link
              href="/request"
              onClick={() => setIsMenuOpen(false)}
              className="
                group
                relative
                overflow-hidden
                bg-gold
                text-[#062b22]
                text-center
                font-body
                font-semibold
                px-6
                py-4
                rounded-2xl
                tracking-[0.14em]
                uppercase
                transition-all
                duration-500
                hover:shadow-[0_20px_60px_rgba(201,168,76,0.35)]
              "
            >
              <span className="relative z-10">
                Request Service
              </span>

              <div
                className="
                  absolute
                  inset-0
                  bg-white/20
                  translate-y-full
                  group-hover:translate-y-0
                  transition-transform
                  duration-500
                "
              />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}