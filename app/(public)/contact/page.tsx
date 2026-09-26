// app/(public)/contact/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Clock3,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(100).trim(),
  email: z.string().email("Enter a valid email address").trim().toLowerCase(),
  phone: z
    .string()
    .regex(/^(\+263|0)[0-9]{9}$/, "Enter a valid Zimbabwean number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Enter a subject").max(150).trim(),
  message: z.string().min(10, "Please write a message").max(2000).trim(),
});

type ContactFields = z.infer<typeof contactSchema>;

// ─────────────────────────────────────────────────────────────
// Contact Details
// ─────────────────────────────────────────────────────────────

const CONTACT_ITEMS = [
  {
    label: "Email",
    value: "info@premasse.co.zw",
    href: "mailto:info@premasse.co.zw",
    icon: Mail,
  },
  {
    label: "Location",
    value: "Harare, Zimbabwe",
    href: null,
    icon: MapPin,
  },
  {
    label: "Hours",
    value: "Mon – Fri · 8:00 AM – 5:00 PM CAT",
    href: null,
    icon: Clock3,
  },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [submitState, setSubmitState] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFields>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFields) {
    setServerMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!json.success) {
        setServerMessage(
          json.error ?? "Something went wrong. Please try again."
        );

        setSubmitState("error");
        return;
      }

      setSubmitState("success");
      reset();
    } catch {
      setServerMessage("A network error occurred. Please try again.");
      setSubmitState("error");
    }
  }

  return (
    <main className="bg-[#041f19] overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

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
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Background Image */}
        <div className="absolute inset-0">

          <Image
            src="/images/contact/contact-hero.png"
            alt="African professionals customer support meeting"
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#041f19]/95 via-[#041f19]/78 to-black/35" />

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#C9A84C]/10" />

          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.22)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 pt-32 sm:pt-36 pb-24 w-full">

          <div className="max-w-3xl animate-fade-up">

            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-8">

              <div className="flex items-center gap-2.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-5 py-2.5 backdrop-blur-md shadow-[0_10px_40px_rgba(201,168,76,0.08)]">

                <Sparkles className="w-4 h-4 text-[#C9A84C]" />

                <span className="font-body text-[#C9A84C] text-[11px] tracking-[0.24em] uppercase font-semibold">
                  Speak with our specialists
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="font-display text-white leading-[0.95] mb-8"
              style={{
                fontSize: "clamp(3.2rem, 6vw, 6.4rem)",
                letterSpacing: "-0.05em",
              }}
            >
              Let&apos;s talk about
              <br />

              <span className="relative inline-block text-[#C9A84C] italic">
                your business.

                <span className="absolute left-0 bottom-2 w-full h-[12px] bg-[#C9A84C]/15 blur-sm rounded-full -z-10" />
              </span>
            </h1>

            {/* Description */}
            <p className="font-body text-white text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-12">
              Have questions before submitting a request? Reach out to our team
              and we&apos;ll guide you through the right compliance,
              registration, accounting, or advisory solution.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                <span className="text-white/50 text-[11px] tracking-[0.18em] uppercase">
                  ZIMRA Registered
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                <span className="text-white/50 text-[11px] tracking-[0.18em] uppercase">
                  One business day response
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

                <span className="text-white/50 text-[11px] tracking-[0.18em] uppercase">
                  Zimbabwean business specialists
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="relative py-24 sm:py-28">

        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[-120px] w-[420px] h-[420px] rounded-full bg-[#C9A84C]/8 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">

          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12">

            {/* FORM */}
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
                lg:p-14
                shadow-[0_40px_120px_rgba(0,0,0,0.25)]
              "
            >

              {/* Glow */}
              <div className="absolute top-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

              <div className="relative">

                {submitState === "success" ? (
                  <div className="text-center py-10">

                    <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mx-auto mb-8">
                      <Send className="w-8 h-8 text-[#C9A84C]" />
                    </div>

                    <h2 className="font-display text-white text-3xl mb-4">
                      Message sent
                    </h2>

                    <p className="font-body text-white/60 text-base leading-relaxed max-w-md mx-auto mb-8">
                      Thanks for reaching out. Our team will get back to you
                      within one business day.
                    </p>

                    <button
                      onClick={() => setSubmitState("idle")}
                      className="
                        border
                        border-white/10
                        bg-white/[0.04]
                        backdrop-blur-md
                        text-white
                        hover:text-[#C9A84C]
                        transition-all
                        duration-300
                        px-8
                        py-4
                        rounded-2xl
                        text-sm
                        tracking-[0.16em]
                        uppercase
                      "
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Heading */}
                    <div className="mb-10">

                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-10 bg-[#C9A84C]" />

                        <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                          Contact form
                        </span>
                      </div>

                      <h2 className="font-display text-white text-4xl leading-tight mb-4">
                        Send a message
                      </h2>

                      <p className="font-body text-white/55 text-sm">
                        Fields marked with * are required.
                      </p>
                    </div>

                    {/* Form */}
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                      className="space-y-6"
                    >

                      {/* Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        <Field
                          label="Full name"
                          error={errors.name?.message}
                          required
                        >
                          <input
                            {...register("name")}
                            type="text"
                            placeholder="Tatenda Moyo"
                            autoComplete="name"
                            className={inputCls(!!errors.name)}
                          />
                        </Field>

                        <Field
                          label="Email address"
                          error={errors.email?.message}
                          required
                        >
                          <input
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            className={inputCls(!!errors.email)}
                          />
                        </Field>
                      </div>

                      {/* Phone */}
                      <Field
                        label="Phone number"
                        error={errors.phone?.message}
                        hint="Optional — Zimbabwean numbers only"
                      >
                        <input
                          {...register("phone")}
                          type="tel"
                          placeholder="+263 77 123 4567"
                          autoComplete="tel"
                          className={inputCls(!!errors.phone)}
                        />
                      </Field>

                      {/* Subject */}
                      <Field
                        label="Subject"
                        error={errors.subject?.message}
                        required
                      >
                        <input
                          {...register("subject")}
                          type="text"
                          placeholder="How can we help?"
                          className={inputCls(!!errors.subject)}
                        />
                      </Field>

                      {/* Message */}
                      <Field
                        label="Message"
                        error={errors.message?.message}
                        required
                      >
                        <textarea
                          {...register("message")}
                          rows={6}
                          placeholder="Tell us about your enquiry..."
                          className={`${inputCls(
                            !!errors.message
                          )} resize-none`}
                        />
                      </Field>

                      {/* Server Error */}
                      {submitState === "error" && serverMessage && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
                          <p className="text-red-300 text-sm">
                            {serverMessage}
                          </p>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                          group
                          relative
                          overflow-hidden
                          w-full
                          bg-[#C9A84C]
                          text-[#041f19]
                          font-body
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
                          {isSubmitting ? "Sending..." : "Send message"}

                          {!isSubmitting && (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </span>

                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">

              {/* Contact Details */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-8
                  shadow-[0_30px_80px_rgba(0,0,0,0.2)]
                "
              >

                <div className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

                <div className="relative">

                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-10 bg-[#C9A84C]" />

                    <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                      Contact details
                    </span>
                  </div>

                  <div className="space-y-6">
                    {CONTACT_ITEMS.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="
                            group
                            flex
                            items-start
                            gap-4
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/[0.03]
                            p-5
                            transition-all
                            duration-300
                            hover:bg-white/[0.05]
                            hover:border-[#C9A84C]/20
                          "
                        >
                          <div className="w-11 h-11 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-[#C9A84C]" />
                          </div>

                          <div>
                            <p className="text-white/35 text-[11px] tracking-[0.18em] uppercase mb-2">
                              {item.label}
                            </p>

                            {item.href ? (
                              <a
                                href={item.href}
                                className="text-white hover:text-[#C9A84C] transition-colors duration-300 text-sm sm:text-base"
                              >
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-white text-sm sm:text-base">
                                {item.value}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Service Request CTA */}
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-8
                  shadow-[0_30px_80px_rgba(0,0,0,0.2)]
                "
              >

                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent" />

                <div className="relative">

                  <h3 className="font-display text-white text-2xl leading-tight mb-4">
                    Ready to proceed?
                  </h3>

                  <p className="font-body text-white/60 text-sm leading-relaxed mb-8">
                    If you already know the service you need, submit a direct
                    request and our specialists will begin assisting you.
                  </p>

                  <Link
                    href="/request"
                    className="
                      group
                      relative
                      overflow-hidden
                      w-full
                      bg-[#C9A84C]
                      text-[#041f19]
                      font-body
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
                      inline-flex
                      items-center
                      justify-center
                      gap-3
                    "
                  >
                    Request a Service

                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Response Time */}
              <div
                className="
                  rounded-[2rem]
                  border
                  border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-8
                  shadow-[0_30px_80px_rgba(0,0,0,0.2)]
                "
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-2 h-2 rounded-full bg-[#C9A84C]" />

                  <span className="text-[#C9A84C] text-xs tracking-[0.18em] uppercase font-semibold">
                    Response time
                  </span>
                </div>

                <p className="text-white/65 text-sm leading-relaxed">
                  We respond to all enquiries within one business day. For
                  urgent matters, email us directly at{" "}
                  <a
                    href="mailto:info@premasse.co.zw"
                    className="text-white hover:text-[#C9A84C] transition-colors"
                  >
                    info@premasse.co.zw
                  </a>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
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
      <label className="font-body text-white text-sm font-medium">
        {label}

        {required && (
          <span className="text-[#C9A84C] ml-1">*</span>
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

function inputCls(hasError: boolean): string {
  return [
    "w-full rounded-2xl border bg-white/[0.03] backdrop-blur-md px-5 py-4",
    "text-white placeholder:text-white/30",
    "transition-all duration-300 outline-none",
    hasError
      ? "border-red-400/30 focus:border-red-400 focus:ring-4 focus:ring-red-400/10"
      : "border-white/10 focus:border-[#C9A84C]/40 focus:ring-4 focus:ring-[#C9A84C]/10",
  ].join(" ");
}