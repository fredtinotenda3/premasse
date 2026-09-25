// app/(client)/portal/new/page.tsx
// Premium authenticated new request page.

import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import PortalRequestForm from "@/components/portal/PortalRequestForm";

import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata =
  {
    title:
      "New request — Premasse Portal",
  };

export const revalidate = 60;

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: {
    service?: string;
  };
}) {
  const session = await auth();

  if (!session?.user)
    redirect("/portal/login");

  const services =
    await prisma.service.findMany(
      {
        where: {
          isActive: true,
        },

        orderBy: {
          sortOrder: "asc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          price: true,
        },
      }
    );

  const preselected =
    searchParams.service
      ? services.find(
          (s) =>
            s.slug ===
            searchParams.service
        )?.id
      : undefined;

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">

        <div className="inline-flex items-center gap-3 mb-6">

          <div className="flex items-center gap-2.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-5 py-2.5 backdrop-blur-md shadow-[0_10px_40px_rgba(201,168,76,0.08)]">

            <Sparkles className="w-4 h-4 text-[#C9A84C]" />

            <span className="font-body text-[#C9A84C] text-[11px] tracking-[0.24em] uppercase font-semibold">
              Client request
            </span>
          </div>
        </div>

        <h1
          className="font-display text-white leading-[0.95] mb-4"
          style={{
            fontSize:
              "clamp(2.8rem, 5vw, 5rem)",

            letterSpacing:
              "-0.05em",
          }}
        >
          Submit a
          <br />

          <span className="text-[#C9A84C] italic">
            new request.
          </span>
        </h1>

        <p className="text-white/60 text-base sm:text-lg max-w-2xl leading-relaxed">
          Our team will review your request and respond within one business day.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-5 mt-8">

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

            <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
              Secure submission
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

            <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
              Zimbabwe specialists
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />

            <span className="text-white/45 text-[11px] tracking-[0.18em] uppercase">
              One business day response
            </span>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

        {/* Form */}
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
          <div className="absolute top-[-100px] right-[-100px] w-[260px] h-[260px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[#C9A84C]" />

              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                Service request form
              </span>
            </div>

            <PortalRequestForm
              services={services}
              preselectedServiceId={
                preselected
              }
              defaultName={
                session.user.name ??
                ""
              }
              defaultEmail={
                session.user
                  .email ?? ""
              }
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Process */}
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

            <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-10 bg-[#C9A84C]" />

                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                  What happens next
                </span>
              </div>

              <ol className="space-y-7">

                {[
                  {
                    step: "1",

                    title:
                      "We review your request",

                    body:
                      "A registered practitioner reviews your submission and confirms requirements.",
                  },

                  {
                    step: "2",

                    title:
                      "We contact you",

                    body:
                      "Our team reaches out within one business day with updates or next steps.",
                  },

                  {
                    step: "3",

                    title:
                      "We process your service",

                    body:
                      "We prepare, submit, and manage your service from start to completion.",
                  },
                ].map(
                  ({
                    step,
                    title,
                    body,
                  }) => (
                    <li
                      key={step}
                      className="flex gap-4"
                    >

                      <span className="font-display text-[#C9A84C] text-2xl font-bold leading-none shrink-0 w-6">
                        {step}
                      </span>

                      <div>

                        <p className="text-white text-sm font-medium mb-2">
                          {title}
                        </p>

                        <p className="text-white/55 text-sm leading-relaxed">
                          {body}
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ol>
            </div>
          </div>

          {/* Support */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-[#C9A84C]/20
              bg-[#C9A84C]/10
              backdrop-blur-xl
              p-8
              shadow-[0_30px_80px_rgba(0,0,0,0.2)]
            "
          >

            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/10 to-transparent" />

            <div className="relative">

              <h3 className="font-display text-white text-2xl leading-tight mb-4">
                Need assistance?
              </h3>

              <p className="text-white/70 text-sm leading-relaxed mb-6">
                If you&apos;re unsure which service you need, contact our team directly and we&apos;ll guide you.
              </p>

              <a
                href="mailto:info@premasse.co.zw"
                className="
                  text-[#041f19]
                  bg-[#C9A84C]
                  hover:bg-white
                  transition-all
                  duration-300
                  px-5
                  py-3
                  rounded-2xl
                  text-sm
                  font-semibold
                  inline-flex
                  items-center
                  gap-2
                "
              >
                Contact support
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}