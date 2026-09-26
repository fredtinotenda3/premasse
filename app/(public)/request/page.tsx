// app/(public)/request/page.tsx

import { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ServiceRequestFormWithUpload from "@/components/forms/ServiceRequestFormWithUpload";
import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://premasse.co.zw";

export const metadata: Metadata = {
  title:
    "Request a Service — Tax & Business Services Zimbabwe",

  description:
    "Submit a service request to Premasse Business Services in Zimbabwe. Company registration, ZIMRA tax registration, ITF263 tax clearance, and SME accounting. Response within 1 business day.",

  alternates: {
    canonical: `${SITE_URL}/request`,
  },

  openGraph: {
    title:
      "Request a Service | Premasse Business Services Zimbabwe",

    description:
      "Submit your request online. Company registration, ZIMRA registration, tax clearance, and accounting services in Zimbabwe.",

    url: `${SITE_URL}/request`,

    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const revalidate = 60;

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{
    service?: string;
  }>;
}) {
  const {
    service: serviceSlug,
  } = await searchParams;

  const services =
    await prisma.service.findMany({
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
    });

  const preselected =
    serviceSlug
      ? services.find(
          (s) =>
            s.slug === serviceSlug
        )?.id
      : undefined;

  return (
    <>
    

      <main className="bg-[#041f19] min-h-screen overflow-hidden">

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

                backgroundSize:
                  "60px 60px",
              }}
            />
          </div>

          {/* Background Image */}
          <div className="absolute inset-0">

            <Image
              src="/images/request/request-hero.png"
              alt="Professional business consultation"
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
                    Request a professional service
                  </span>
                </div>
              </div>

              {/* Heading */}
              <h1
                className="font-display text-white leading-[0.95] mb-8"
                style={{
                  fontSize:
                    "clamp(3.2rem, 6vw, 6.4rem)",

                  letterSpacing:
                    "-0.05em",
                }}
              >
                Request a
                <br />

                <span className="relative inline-block text-[#C9A84C] italic">
                  business service.

                  <span className="absolute left-0 bottom-2 w-full h-[12px] bg-[#C9A84C]/15 blur-sm rounded-full -z-10" />
                </span>
              </h1>

              {/* Description */}
              <p className="font-body text-white text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mb-12">
                Fill in the form below and one of our registered practitioners will contact you within one business day regarding your registration, compliance, accounting, or advisory request.
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

              {/* FORM */}
              <div className="lg:col-span-2">

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

                    <div className="mb-10">

                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px w-10 bg-[#C9A84C]" />

                        <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                          Service request
                        </span>
                      </div>

                      <h2 className="font-display text-white text-4xl leading-tight mb-4">
                        Submit your request
                      </h2>

                      <p className="font-body text-white/55 text-sm">
                        Fields marked{" "}
                        <span className="text-[#C9A84C]">*</span>{" "}
                        are required.
                      </p>
                    </div>

                    <ServiceRequestFormWithUpload
                      services={services}
                      preselectedServiceId={
                        preselected
                      }
                    />
                  </div>
                </div>
              </div>

              {/* SIDEBAR */}
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

                  <div className="absolute top-[-60px] right-[-60px] w-[180px] h-[180px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

                  <div className="relative">

                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-px w-10 bg-[#C9A84C]" />

                      <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                        What happens next
                      </span>
                    </div>

                    <ol className="space-y-6">

                      {[
                        {
                          step: "1",

                          title:
                            "We review your request",

                          body:
                            "A registered practitioner reads your submission and assesses what's needed.",
                        },

                        {
                          step: "2",

                          title:
                            "We contact you",

                          body:
                            "Within one business day, we'll reach out via WhatsApp or email to discuss next steps.",
                        },

                        {
                          step: "3",

                          title:
                            "We get it done",

                          body:
                            "We handle all preparation, submission, and follow-up with ZIMRA or the relevant authority.",
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

                              <p className="text-white/60 text-sm leading-relaxed">
                                {body}
                              </p>
                            </div>
                          </li>
                        )
                      )}
                    </ol>
                  </div>
                </div>

                {/* Direct Contact */}
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
                      Prefer direct contact?
                    </h3>

                    <p className="font-body text-white/70 text-sm leading-relaxed mb-6">
                      Reach out to our team directly during business hours for urgent enquiries or assistance.
                    </p>

                    <a
                      href="mailto:info@premasse.co.zw"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-[#C9A84C]
                        hover:text-white
                        transition-colors
                        duration-300
                        text-sm
                        font-medium
                      "
                    >
                      info@premasse.co.zw
                    </a>
                  </div>
                </div>

                {/* Services */}
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

                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px w-10 bg-[#C9A84C]" />

                    <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-body font-semibold">
                      Available services
                    </span>
                  </div>

                  <ul className="space-y-4">

                    {services.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#C9A84C] shrink-0" />

                        <span className="text-white/70 text-sm leading-relaxed">
                          {s.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}