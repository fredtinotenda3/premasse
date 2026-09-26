// app/(auth)/portal/login/page.tsx

import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Sign in — Premasse Portal",

  robots: {
    index: false,
    follow: false,
  },
};

const ERROR_MESSAGES: Record<
  string,
  string
> = {
  Verification:
    "This sign-in link has expired or already been used. Request a new one.",

  EmailCreateAccount:
    "No account found for this email. Please register first.",

  default:
    "Something went wrong. Please try again.",
};

async function sendMagicLink(
  formData: FormData
) {
  "use server";

  const email = formData.get(
    "email"
  ) as string;

  const callbackUrl =
    (formData.get(
      "callbackUrl"
    ) as string) || "/portal";

  try {
    await signIn("email", {
      email,
      redirectTo: callbackUrl,
    });
  } catch (error: any) {
    if (
      error?.message ===
      "NEXT_REDIRECT"
    )
      throw error;

    redirect(
      `/portal/login?error=default`
    );
  }
}

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    registered?: string;
    callbackUrl?: string;
  }>;
}) {
  const {
    error,
    registered,
    callbackUrl,
  } = await searchParams;

  const session = await auth();

  if (
    session?.user?.role ===
    "CLIENT"
  ) {
    redirect(
      callbackUrl ?? "/portal"
    );
  }

  const errorMsg = error
    ? ERROR_MESSAGES[error] ??
      ERROR_MESSAGES.default
    : null;

  const justRegistered =
    registered === "1";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041f19]">

      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Gold glow */}
        <div className="absolute top-[-140px] left-[-120px] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/10 blur-3xl animate-pulse" />

        {/* Emerald glow */}
        <div className="absolute bottom-[-220px] right-[-140px] w-[620px] h-[620px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",

            backgroundSize:
              "60px 60px",
          }}
        />
      </div>

      {/* Background Image */}
      <div className="absolute inset-0">

        <Image
          src="/images/auth/login-hero.png"
          alt="Professional business portal login"
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            brightness-[1.02]
            contrast-[1.05]
            saturate-[1.05]
            scale-[1.03]
            animate-[slowZoom_18s_ease-in-out_infinite_alternate]
          "
        />

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#041f19]/96 via-[#041f19]/82 to-black/45" />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#C9A84C]/10" />

        <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.22)]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">

            <div className="inline-flex items-center gap-3 mb-6">

              <div className="flex items-center gap-2.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-5 py-2.5 backdrop-blur-md shadow-[0_10px_40px_rgba(201,168,76,0.08)]">

                <Sparkles className="w-4 h-4 text-[#C9A84C]" />

                <span className="font-body text-[#C9A84C] text-[11px] tracking-[0.24em] uppercase font-semibold">
                  Client portal
                </span>
              </div>
            </div>

            <Logo size="lg" subtitle="Secure business access" className="mx-auto" />
          </div>

          {/* Card */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-2xl
              p-8
              sm:p-10
              shadow-[0_40px_120px_rgba(0,0,0,0.25)]
            "
          >

            {/* Glow */}
            <div className="absolute top-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

            <div className="relative">

              {/* Heading */}
              <div className="mb-8">

                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-10 bg-[#C9A84C]" />

                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                    Portal access
                  </span>
                </div>

                <h2 className="font-display text-white text-4xl leading-tight mb-4">
                  Sign in
                </h2>

                <p className="text-white/60 text-sm leading-relaxed">
                  Enter your email address and we&apos;ll send you a secure magic sign-in link.
                </p>
              </div>

              {/* Registered */}
              {justRegistered && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 mb-6 flex gap-4 items-start">

                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">

                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="text-emerald-400"
                    >
                      <path
                        d="M2 7l4 4 6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <p className="text-emerald-200 text-sm leading-relaxed">
                    Account created successfully. Enter your email to continue.
                  </p>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 mb-6 flex gap-4 items-start">

                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    className="text-red-400 shrink-0 mt-0.5"
                  >
                    <circle
                      cx="7.5"
                      cy="7.5"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M7.5 4.5v3M7.5 10h.01"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  <p className="text-red-300 text-sm leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                action={sendMagicLink}
                className="space-y-6"
              >

                <input
                  type="hidden"
                  name="callbackUrl"
                  value={
                    callbackUrl ??
                    "/portal"
                  }
                />

                <div className="flex flex-col gap-2">

                  <label
                    htmlFor="email"
                    className="text-white text-sm font-medium"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      backdrop-blur-md
                      px-5
                      py-4
                      text-white
                      placeholder:text-white/30
                      transition-all
                      duration-300
                      outline-none
                      focus:border-[#C9A84C]/40
                      focus:ring-4
                      focus:ring-[#C9A84C]/10
                    "
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="
                    group
                    relative
                    overflow-hidden
                    w-full
                    bg-[#C9A84C]
                    text-[#041f19]
                    font-semibold
                    px-8
                    py-4
                    rounded-2xl
                    text-sm
                    tracking-[0.16em]
                    uppercase
                    text-center
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:shadow-[0_20px_60px_rgba(201,168,76,0.35)]
                  "
                >

                  <span className="relative z-10 flex items-center justify-center gap-3">

                    Send sign-in link

                    <ArrowUpRight className="w-4 h-4" />
                  </span>

                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </form>

              {/* SPAM WARNING - ADDED HERE */}
              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
                <p className="text-amber-300 text-xs text-center leading-relaxed">
                  <span className="font-bold">📧 Email not arriving?</span><br />
                  Check your <span className="font-semibold">Spam/Junk folder</span> and mark 
                  noreply@resend.dev as safe.
                </p>
              </div>

              {/* Register */}
              <div className="mt-6 pt-6 border-t border-white/10 text-center">

                <p className="text-white/45 text-sm">

                  Don&apos;t have an account?{" "}

                  <Link
                    href="/portal/register"
                    className="text-[#C9A84C] hover:text-white transition-colors duration-300"
                  >
                    Register
                  </Link>
                </p>
              </div>

              {/* Trust */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                  <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
                    Secure login
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                  <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
                    Magic link authentication
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <p className="text-center mt-8">

            <Link
              href="/"
              className="text-white/35 hover:text-white/65 transition-colors duration-300 text-sm"
            >
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}