// app/(public)/payment/complete/page.tsx
// Premium cinematic payment completion page.

import { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";


import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  XCircle,
  LoaderCircle,
} from "lucide-react";

export const metadata: Metadata =
  {
    title:
      "Payment — Premasse Business Services",

    robots: {
      index: false,
      follow: false,
    },
  };

export const dynamic =
  "force-dynamic";

export default async function PaymentCompletePage({
  searchParams,
}: {
  searchParams: Promise<{
    ref?: string;
  }>;
}) {
  const params =
    await searchParams;

  const requestId =
    params.ref;

  // ───────────────────────────────────────────────────────────
  // Payment
  // ───────────────────────────────────────────────────────────

  const payment =
    requestId
      ? await prisma.payment.findFirst(
          {
            where: {
              requestId,
            },

            orderBy: {
              createdAt:
                "desc",
            },

            select: {
              status: true,
              amount: true,
              method: true,
              paidAt: true,
            },
          }
        )
      : null;

  const isPaid =
    payment?.status ===
    "PAID";

  const isCancelled =
    payment?.status ===
    "CANCELLED";

  const isFailed =
    payment?.status ===
    "FAILED";

  const isPending =
    payment?.status ===
      "AWAITING_PAYMENT" ||
    !payment;

  // ───────────────────────────────────────────────────────────
  // Content
  // ───────────────────────────────────────────────────────────

  const config = isPaid
    ? {
        title:
          "Payment confirmed",

        heading:
          "Thank you.",

        description: `Your payment of $${payment?.amount.toFixed(
          2
        )} USD has been received successfully. Our team will now begin processing your request.`,

        sub:
          "You’ll hear from us shortly via email.",

        icon:
          CheckCircle2,

        accent:
          "text-emerald-400",

        badge:
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      }
    : isCancelled
    ? {
        title:
          "Payment cancelled",

        heading:
          "Payment cancelled.",

        description:
          "Your payment was cancelled before completion. Your request is still on file and can be resumed at any time.",

        sub:
          "Contact us if you’d like to continue with the payment.",

        icon:
          XCircle,

        accent:
          "text-white/40",

        badge:
          "bg-white/[0.04] border-white/10 text-white/45",
      }
    : isFailed
    ? {
        title:
          "Payment failed",

        heading:
          "Something went wrong.",

        description:
          "The payment could not be completed successfully. Please contact us and we’ll help you retry the transaction.",

        sub:
          "No funds were confirmed for this transaction.",

        icon:
          XCircle,

        accent:
          "text-red-400",

        badge:
          "bg-red-500/10 border-red-500/20 text-red-300",
      }
    : {
        title:
          "Payment processing",

        heading:
          "Processing payment…",

        description:
          "We’re currently waiting for confirmation from Paynow. This may take a few moments depending on your bank or mobile provider.",

        sub:
          "You can safely close this page — we’ll notify you by email.",

        icon:
          LoaderCircle,

        accent:
          "text-amber-400",

        badge:
          "bg-amber-500/10 border-amber-500/20 text-amber-300",
      };

  const Icon =
    config.icon;

  return (
    <>

      <main className="relative min-h-screen overflow-hidden bg-[#041f19] pt-20">

        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute top-[-180px] left-[-120px] w-[420px] h-[420px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

          <div className="absolute bottom-[-220px] right-[-120px] w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.08),transparent_28%)]" />

          <div className="absolute inset-0 bg-gradient-to-br from-[#041f19] via-[#041f19]/96 to-black" />
        </div>

        {/* Hero */}
        <section className="relative px-6 pt-24 pb-16">

          <div className="max-w-4xl mx-auto text-center">

            <div className="inline-flex items-center gap-3 mb-8">

              <div
                className={`flex items-center gap-2.5 rounded-full border px-5 py-2.5 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.18)] ${config.badge}`}
              >

                <Sparkles className="w-4 h-4" />

                <span className="font-body text-[11px] tracking-[0.24em] uppercase font-semibold">
                  Payment status
                </span>
              </div>
            </div>

            <h1
              className="font-display text-white leading-[0.95] mb-5"
              style={{
                fontSize:
                  "clamp(2.8rem, 5vw, 5rem)",

                letterSpacing:
                  "-0.05em",
              }}
            >
              {config.title}
            </h1>

            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Secure payment
              processing for
              Premasse Business
              Services.
            </p>
          </div>
        </section>

        {/* Card */}
        <section className="relative px-6 pb-24">

          <div className="max-w-2xl mx-auto">

            <div
              className="
                relative
                overflow-hidden
                rounded-[2.5rem]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-2xl
                p-10 sm:p-14
                shadow-[0_40px_120px_rgba(0,0,0,0.28)]
              "
            >

              {/* Glow */}
              <div className="absolute top-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

              <div className="relative text-center">

                {/* Icon */}
                <div
                  className={`
                    w-24
                    h-24
                    rounded-full
                    border
                    mx-auto
                    mb-8
                    flex
                    items-center
                    justify-center
                    bg-white/[0.04]
                    border-white/10
                    ${config.accent}
                  `}
                >

                  <Icon
                    className={`w-11 h-11 ${
                      isPending
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </div>

                {/* Heading */}
                <h2 className="font-display text-white text-4xl mb-5">
                  {config.heading}
                </h2>

                {/* Description */}
                <p className="text-white/70 text-base leading-relaxed max-w-xl mx-auto mb-4">
                  {
                    config.description
                  }
                </p>

                <p className="text-white/40 text-sm leading-relaxed">
                  {config.sub}
                </p>

                {/* Amount */}
                {isPaid &&
                  payment && (
                    <div className="mt-10 inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-3 text-emerald-300 text-sm font-semibold tracking-[0.12em] uppercase">
                      Paid · $
                      {payment.amount.toFixed(
                        2
                      )}{" "}
                      USD
                    </div>
                  )}

                {/* Reference */}
                {requestId && (
                  <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

                    <p className="text-white/35 text-[11px] uppercase tracking-[0.2em] mb-2">
                      Reference
                    </p>

                    <p className="text-white/75 font-mono text-sm break-all">
                      {
                        requestId
                      }
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

                  <Link
                    href="/"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      px-7
                      py-4
                      text-white/70
                      hover:text-white
                      hover:border-white/20
                      transition-all
                      duration-300
                    "
                  >

                    Back to home
                  </Link>

                  <Link
                    href="/contact"
                    className="
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-[#C9A84C]/20
                      bg-[#C9A84C]/10
                      px-7
                      py-4
                      text-[#C9A84C]
                      hover:bg-[#C9A84C]/15
                      transition-all
                      duration-300
                    "
                  >

                    Contact us

                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}