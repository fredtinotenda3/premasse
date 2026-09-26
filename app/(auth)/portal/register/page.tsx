"use client";

// app/(auth)/portal/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/layout/Logo";

const schema = z.object({
  name: z
    .string()
    .min(
      2,
      "Enter your full name"
    )
    .trim(),

  email: z
    .string()
    .email(
      "Enter a valid email address"
    )
    .trim(),

  phone: z
    .string()
    .regex(
      /^(\+263|0)[0-9]{9}$/,
      "Enter a valid Zimbabwean number"
    )
    .optional()
    .or(z.literal("")),
});

type Fields = z.infer<
  typeof schema
>;

export default function RegisterPage() {
  const router = useRouter();

  const [
    serverError,
    setServerError,
  ] = useState("");

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<Fields>({
    resolver:
      zodResolver(schema),
  });

  async function onSubmit(
    data: Fields
  ) {
    setServerError("");

    const res = await fetch(
      "/api/portal/register",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(data),
      }
    );

    const json =
      await res.json();

    if (!json.success) {
      setServerError(
        json.error ??
          "Registration failed."
      );

      return;
    }

    router.push(
      "/portal/login?registered=1"
    );
  }

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

      {/* Background */}
      <div className="absolute inset-0">

        <Image
          src="/images/auth/register-hero.png"
          alt="Professional client registration portal"
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
                    Client registration
                  </span>
                </div>

                <h2 className="font-display text-white text-4xl leading-tight mb-4">
                  Create account
                </h2>

                <p className="text-white/60 text-sm leading-relaxed">
                  Create your portal account to manage and track your service requests online.
                </p>
              </div>

              {/* Error */}
              {serverError && (
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
                    {serverError}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit(
                  onSubmit
                )}
                className="space-y-6"
              >

                {/* Name */}
                <Field
                  label="Full name"
                  required
                  error={
                    errors.name?.message
                  }
                >

                  <input
                    {...register(
                      "name"
                    )}
                    type="text"
                    placeholder="Tatenda Moyo"
                    autoComplete="name"
                    className={inputCls(
                      !!errors.name
                    )}
                  />
                </Field>

                {/* Email */}
                <Field
                  label="Email address"
                  required
                  error={
                    errors.email
                      ?.message
                  }
                >

                  <input
                    {...register(
                      "email"
                    )}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputCls(
                      !!errors.email
                    )}
                  />
                </Field>

                {/* Phone */}
                <Field
                  label="Phone number"
                  hint="Optional — Zimbabwean numbers only"
                  error={
                    errors.phone
                      ?.message
                  }
                >

                  <input
                    {...register(
                      "phone"
                    )}
                    type="tel"
                    placeholder="+263 77 123 4567"
                    autoComplete="tel"
                    className={inputCls(
                      !!errors.phone
                    )}
                  />
                </Field>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
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
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  <span className="relative z-10 flex items-center justify-center gap-3">

                    {isSubmitting
                      ? "Creating account…"
                      : "Create account"}

                    {!isSubmitting && (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </span>

                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </form>

              {/* Login */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">

                <p className="text-white/45 text-sm">

                  Already have an account?{" "}

                  <Link
                    href="/portal/login"
                    className="text-[#C9A84C] hover:text-white transition-colors duration-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Trust */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                  <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
                    Secure registration
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                  <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
                    Protected information
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

// ─────────────────────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">

      <label className="text-white text-sm font-medium">

        {label}

        {required && (
          <span className="text-[#C9A84C] ml-1">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="text-white/35 text-xs">
          {hint}
        </p>
      )}

      {error && (
        <p className="text-red-300 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Input Classes
// ─────────────────────────────────────────────────────────────

function inputCls(
  hasError: boolean
): string {
  return [
    `
      w-full
      rounded-2xl
      border
      bg-white/[0.03]
      backdrop-blur-md
      px-5
      py-4
      text-white
      placeholder:text-white/30
      transition-all
      duration-300
      outline-none
    `,

    hasError
      ? `
          border-red-400/30
          focus:border-red-400
          focus:ring-4
          focus:ring-red-400/10
        `
      : `
          border-white/10
          focus:border-[#C9A84C]/40
          focus:ring-4
          focus:ring-[#C9A84C]/10
        `,
  ].join(" ");
}