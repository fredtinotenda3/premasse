"use client";

// components/dashboard/DashboardNav.tsx
// Premium cinematic admin navigation.

import Link from "next/link";
import {
  useState,
  useEffect,
} from "react";
import Logo from "@/components/layout/Logo";

import { signOut } from "next-auth/react";

import { usePathname } from "next/navigation";

import {
  BarChart3,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard",
    exact: true,
    icon: LayoutDashboard,
  },

  {
    label: "Requests",
    href: "/dashboard/requests",
    exact: false,
    icon: BriefcaseBusiness,
  },

  {
    label: "Analytics",
    href: "/dashboard/analytics",
    exact: false,
    icon: BarChart3,
  },

  {
    label: "Services",
    href: "/dashboard/services",
    exact: false,
    icon: Sparkles,
  },
];

export default function DashboardNav({
  session,
}: {
  session: any;
}) {
  const pathname =
    usePathname();

  const [
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  ] = useState(false);

  // ESC key
  useEffect(() => {
    const handleEsc = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(
          false
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEsc
      );
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen
        ? "hidden"
        : "unset";

    return () => {
      document.body.style.overflow =
        "unset";
    };
  }, [isMobileMenuOpen]);

  const isActive = (
    href: string,
    exact: boolean
  ) => {
    return exact
      ? pathname === href
      : pathname.startsWith(
          href
        );
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() =>
          setIsMobileMenuOpen(
            !isMobileMenuOpen
          )
        }
        className="
          lg:hidden
          fixed
          top-4
          left-4
          z-[60]
          w-11
          h-11
          rounded-2xl
          border
          border-white/10
          bg-[#041f19]/80
          backdrop-blur-xl
          text-white
          flex
          items-center
          justify-center
          shadow-[0_10px_40px_rgba(0,0,0,0.25)]
        "
        aria-label={
          isMobileMenuOpen
            ? "Close menu"
            : "Open menu"
        }
      >

        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* MOBILE OVERLAY */}
      <div
        className={`
          fixed
          inset-0
          z-40
          bg-black/70
          backdrop-blur-md
          transition-all
          duration-300
          lg:hidden
          ${
            isMobileMenuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }
        `}
        onClick={() =>
          setIsMobileMenuOpen(
            false
          )
        }
      />

      {/* MOBILE PANEL */}
      <div
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-[300px]
          border-r
          border-white/10
          bg-[#041f19]
          backdrop-blur-2xl
          transition-transform
          duration-500
          lg:hidden
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="px-6 py-8 border-b border-white/10">
            <Logo
              href="/dashboard"
              subtitle="Admin dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>

          {/* Nav */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

            {NAV_ITEMS.map(
              ({
                label,
                href,
                exact,
                icon: Icon,
              }) => {
                const active =
                  isActive(
                    href,
                    exact
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() =>
                      setIsMobileMenuOpen(
                        false
                      )
                    }
                    className={`
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-4
                      py-3.5
                      transition-all
                      duration-300
                      ${
                        active
                          ? "bg-white/[0.06] text-white border border-white/10"
                          : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                      }
                    `}
                  >

                    <Icon
                      className={`w-5 h-5 ${
                        active
                          ? "text-[#C9A84C]"
                          : ""
                      }`}
                    />

                    <span className="text-sm font-medium">
                      {label}
                    </span>
                  </Link>
                );
              }
            )}
          </div>

          {/* User */}
          <div className="p-4 border-t border-white/10">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

              <p className="text-white text-sm font-medium truncate mb-1">
                {session?.user
                  ?.name ??
                  "Admin"}
              </p>

              <p className="text-white/35 text-xs truncate mb-5">
                {
                  session?.user
                    ?.email
                }
              </p>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl:
                      "/login",
                  })
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  py-3
                  text-white/60
                  hover:text-white
                  hover:border-[#C9A84C]/20
                  transition-all
                  duration-300
                "
              >

                <LogOut className="w-4 h-4" />

                <span className="text-sm">
                  Sign out
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden
          lg:flex
          lg:flex-col
          lg:h-screen
          w-[290px]
          border-r
          border-white/10
          bg-[#041f19]/70
          backdrop-blur-2xl
          sticky
          top-0
        "
      >

        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="px-7 py-8 border-b border-white/10">
            <Logo href="/dashboard" subtitle="Admin dashboard" />
          </div>

          {/* Nav */}
          <div className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">

            {NAV_ITEMS.map(
              ({
                label,
                href,
                exact,
                icon: Icon,
              }) => {
                const active =
                  isActive(
                    href,
                    exact
                  );

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      group
                      relative
                      overflow-hidden
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      px-4
                      py-3.5
                      transition-all
                      duration-300
                      ${
                        active
                          ? "bg-white/[0.06] border border-white/10 text-white"
                          : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                      }
                    `}
                  >

                    {active && (
                      <div className="absolute inset-y-0 left-0 w-1 bg-[#C9A84C]" />
                    )}

                    <Icon
                      className={`w-5 h-5 ${
                        active
                          ? "text-[#C9A84C]"
                          : ""
                      }`}
                    />

                    <span className="text-sm font-medium">
                      {label}
                    </span>
                  </Link>
                );
              }
            )}
          </div>

          {/* User */}
          <div className="p-5 border-t border-white/10">

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5">

              <p className="text-white text-sm font-medium truncate mb-1">
                {session?.user
                  ?.name ??
                  "Admin"}
              </p>

              <p className="text-white/35 text-xs truncate mb-5">
                {
                  session?.user
                    ?.email
                }
              </p>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl:
                      "/login",
                  })
                }
                className="
                  w-full
                  group
                  relative
                  overflow-hidden
                  bg-[#C9A84C]
                  text-[#041f19]
                  font-semibold
                  px-5
                  py-3.5
                  rounded-2xl
                  text-sm
                  tracking-[0.14em]
                  uppercase
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_20px_60px_rgba(201,168,76,0.35)]
                "
              >

                <span className="relative z-10 flex items-center justify-center gap-3">

                  <LogOut className="w-4 h-4" />

                  Sign out
                </span>

                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}