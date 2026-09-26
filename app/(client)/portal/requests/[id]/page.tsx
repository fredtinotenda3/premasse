// app/(client)/portal/requests/[id]/page.tsx
// Premium client-facing request detail page.

import { Metadata } from "next";
import {
  notFound,
  redirect,
} from "next/navigation";

import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { RequestStatus } from "@prisma/client";

import {
  format,
  formatDistanceToNow,
} from "date-fns";

import PortalInvoiceButton from "@/components/portal/PortalInvoiceButton";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata =
  {
    title:
      "Request — Premasse Portal",
  };

export const dynamic =
  "force-dynamic";

const STATUS_CONFIG: Record<
  RequestStatus,
  {
    label: string;
    classes: string;
    desc: string;
  }
> = {
  PENDING: {
    label: "Pending",

    classes:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",

    desc:
      "Your request has been received and is waiting to be reviewed.",
  },

  IN_REVIEW: {
    label: "In review",

    classes:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",

    desc:
      "A practitioner is reviewing your request.",
  },

  IN_PROGRESS: {
    label: "In progress",

    classes:
      "border-purple-500/20 bg-purple-500/10 text-purple-300",

    desc:
      "Work on your request is underway.",
  },

  AWAITING_DOCS: {
    label:
      "Awaiting docs",

    classes:
      "border-orange-500/20 bg-orange-500/10 text-orange-300",

    desc:
      "We need additional documents from you.",
  },

  AWAITING_PAYMENT: {
    label:
      "Awaiting payment",

    classes:
      "border-pink-500/20 bg-pink-500/10 text-pink-300",

    desc:
      "A payment request has been sent to you.",
  },

  COMPLETED: {
    label: "Completed",

    classes:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

    desc:
      "Your request has been completed.",
  },

  CANCELLED: {
    label: "Cancelled",

    classes:
      "border-white/10 bg-white/[0.04] text-white/40",

    desc:
      "This request has been cancelled.",
  },
};

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;  // ← FIXED: params is a Promise
}) {
  const session = await auth();

  if (!session?.user)
    redirect("/portal/login");

  // ← FIXED: await params before using
  const { id } = await params;

  const request =
    await prisma.serviceRequest.findUnique(
      {
        where: {
          id: id,  // ← FIXED: use the awaited id
        },

        include: {
          service: {
            select: {
              name: true,
              category: true,
            },
          },

          documents: {
            orderBy: {
              uploadedAt:
                "desc",
            },
          },

          auditLogs: {
            orderBy: {
              createdAt:
                "desc",
            },

            include: {
              admin: {
                select: {
                  name: true,
                },
              },
            },
          },

          payments: {
            where: {
              status: "PAID",
            },

            orderBy: {
              paidAt: "desc",
            },

            select: {
              id: true,
              amount: true,
              method: true,
              paidAt: true,
              status: true,
            },
          },
        },
      }
    );

  if (!request)
    notFound();

  // Security
  const isOwner =
    request.userId ===
      session.user.id ||
    request.clientEmail ===
      session.user.email;

  if (!isOwner) notFound();

  const cfg =
    STATUS_CONFIG[
      request.status
    ];

  // Hide internal logs
  const visibleLogs =
    request.auditLogs.filter(
      (log) =>
        !log.note?.startsWith(
          "[internal]"
        )
    );

  const STATUS_LABELS: Record<
    string,
    string
  > = {
    PENDING: "Pending",

    IN_REVIEW:
      "In review",

    IN_PROGRESS:
      "In progress",

    AWAITING_DOCS:
      "Awaiting docs",

    AWAITING_PAYMENT:
      "Awaiting payment",

    COMPLETED:
      "Completed",

    CANCELLED:
      "Cancelled",
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-white/35 text-xs tracking-[0.18em] uppercase mb-8">

        <Link
          href="/portal"
          className="hover:text-white/60 transition-colors"
        >
          My requests
        </Link>

        <span>/</span>

        <span className="text-white/60 truncate">
          {request.service.name}
        </span>
      </div>

      {/* Header */}
      <div className="mb-10">

        <div className="inline-flex items-center gap-3 mb-6">

          <div className="flex items-center gap-2.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-5 py-2.5 backdrop-blur-md shadow-[0_10px_40px_rgba(201,168,76,0.08)]">

            <Sparkles className="w-4 h-4 text-[#C9A84C]" />

            <span className="font-body text-[#C9A84C] text-[11px] tracking-[0.24em] uppercase font-semibold">
              Request tracking
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          <div>

            <div className="flex items-center gap-4 flex-wrap mb-4">

              <h1
                className="font-display text-white leading-[0.95]"
                style={{
                  fontSize:
                    "clamp(2.4rem, 5vw, 4.8rem)",

                  letterSpacing:
                    "-0.05em",
                }}
              >
                {
                  request.service
                    .name
                }
              </h1>

              <span
                className={`
                  inline-flex
                  items-center
                  px-4
                  py-2
                  rounded-full
                  border
                  text-[11px]
                  uppercase
                  tracking-[0.18em]
                  font-semibold
                  ${cfg.classes}
                `}
              >
                {cfg.label}
              </span>
            </div>

            <p className="text-white/55 text-base leading-relaxed max-w-2xl">
              {cfg.desc}
            </p>

            <div className="flex items-center gap-3 mt-6 text-white/35 text-sm">

              <Clock3 className="w-4 h-4 text-[#C9A84C]" />

              Submitted{" "}
              {format(
                new Date(
                  request.createdAt
                ),
                "d MMMM yyyy"
              )}
            </div>
          </div>

          <Link
            href="/portal"
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-md
              px-5
              py-3
              text-white/70
              hover:text-white
              hover:border-[#C9A84C]/20
              transition-all
              duration-300
              shrink-0
            "
          >

            <ArrowLeft className="w-4 h-4 text-[#C9A84C]" />

            Back to requests
          </Link>
        </div>
      </div>

      {/* Awaiting docs notice */}
      {request.status ===
        "AWAITING_DOCS" && (
        <div className="rounded-[2rem] border border-orange-500/20 bg-orange-500/10 backdrop-blur-xl px-6 py-5 mb-8 flex gap-4 items-start">

          <div className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">

            <FileText className="w-5 h-5 text-orange-300" />
          </div>

          <div>
            <p className="text-orange-200 text-sm font-medium mb-1">
              Additional documents required
            </p>

            <p className="text-orange-100/75 text-sm leading-relaxed">
              Please upload the requested documents so we can continue processing your request.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">

        {/* LEFT */}
        <div className="space-y-8">

          {/* Submission */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-2xl
              p-8
              shadow-[0_40px_120px_rgba(0,0,0,0.22)]
            "
          >

            <div className="absolute top-[-80px] right-[-80px] w-[220px] h-[220px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

            <div className="relative">

              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-10 bg-[#C9A84C]" />

                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                  Your submission
                </span>
              </div>

              <dl className="space-y-6">

                {[
                  {
                    label:
                      "Service",

                    value:
                      request.service
                        .name,
                  },

                  {
                    label:
                      "Submitted",

                    value:
                      format(
                        new Date(
                          request.createdAt
                        ),
                        "d MMM yyyy, HH:mm"
                      ),
                  },
                ].map(
                  ({
                    label,
                    value,
                  }) => (
                    <div
                      key={label}
                    >

                      <dt className="text-white/35 text-xs uppercase tracking-[0.18em] mb-1">
                        {label}
                      </dt>

                      <dd className="text-white text-sm leading-relaxed">
                        {value}
                      </dd>
                    </div>
                  )
                )}

                {request.notes && (
                  <div>

                    <dt className="text-white/35 text-xs uppercase tracking-[0.18em] mb-1">
                      Your notes
                    </dt>

                    <dd className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {
                        request.notes
                      }
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          {/* Documents */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[2.5rem]
              border
              border-white/10
              bg-white/[0.03]
              backdrop-blur-2xl
              p-8
              shadow-[0_40px_120px_rgba(0,0,0,0.22)]
            "
          >

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[#C9A84C]" />

              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                Documents
              </span>
            </div>

            {request.documents
              .length === 0 ? (
              <p className="text-white/40 text-sm italic">
                No documents uploaded.
              </p>
            ) : (
              <ul className="space-y-4">

                {request.documents.map(
                  (doc) => (
                    <li
                      key={
                        doc.id
                      }
                      className="
                        flex
                        items-center
                        gap-4
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        px-4
                        py-4
                      "
                    >

                      <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">

                        <FileText className="w-5 h-5 text-[#C9A84C]" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <a
                          href={
                            doc.fileUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            text-white
                            text-sm
                            truncate
                            block
                            hover:text-[#C9A84C]
                            transition-colors
                          "
                        >
                          {
                            doc.fileName
                          }
                        </a>

                        <p className="text-white/35 text-xs mt-1">
                          {(
                            doc.fileSize /
                            1024
                          ).toFixed(
                            0
                          )}{" "}
                          KB
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </section>

          {/* Payments */}
          {request.payments
            .length > 0 && (
            <section
              className="
                relative
                overflow-hidden
                rounded-[2.5rem]
                border
                border-white/10
                bg-white/[0.03]
                backdrop-blur-2xl
                p-8
                shadow-[0_40px_120px_rgba(0,0,0,0.22)]
              "
            >

              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-10 bg-[#C9A84C]" />

                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                  Payment
                </span>
              </div>

              <div className="space-y-6">

                {request.payments.map(
                  (p, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5"
                    >

                      <div className="flex items-start justify-between gap-5 mb-5">

                        <div>

                          <p className="font-display text-white text-3xl mb-2">
                            $
                            {p.amount.toFixed(
                              2
                            )}

                            <span className="text-white/35 text-sm ml-2">
                              USD
                            </span>
                          </p>

                          <p className="text-white/50 text-sm">
                            {p.method ??
                              "Web"}{" "}
                            ·{" "}
                            {p.paidAt
                              ? format(
                                  new Date(
                                    p.paidAt
                                  ),
                                  "d MMM yyyy"
                                )
                              : ""}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-300">

                          <CheckCircle2 className="w-4 h-4" />

                          Paid
                        </span>
                      </div>

                      <PortalInvoiceButton
                        paymentId={
                          p.id
                        }
                        amount={
                          p.amount
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT */}
        <aside
          className="
            relative
            overflow-hidden
            rounded-[2.5rem]
            border
            border-white/10
            bg-white/[0.03]
            backdrop-blur-2xl
            p-8
            shadow-[0_40px_120px_rgba(0,0,0,0.22)]
            h-fit
          "
        >

          <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] rounded-full bg-[#C9A84C]/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[#C9A84C]" />

              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">
                Activity timeline
              </span>
            </div>

            {visibleLogs.length ===
            0 ? (
              <p className="text-white/40 text-sm italic">
                No activity yet.
              </p>
            ) : (
              <ol className="relative">

                {visibleLogs.map(
                  (
                    log,
                    i
                  ) => {
                    const isLast =
                      i ===
                      visibleLogs.length -
                        1;

                    return (
                      <li
                        key={
                          log.id
                        }
                        className="relative flex gap-4 pb-8"
                      >

                        {!isLast && (
                          <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/10" />
                        )}

                        <div
                          className={`
                            relative
                            z-10
                            shrink-0
                            w-6
                            h-6
                            rounded-full
                            border
                            flex
                            items-center
                            justify-center
                            ${
                              i ===
                              0
                                ? "bg-[#C9A84C] border-[#C9A84C]"
                                : "bg-white/[0.04] border-white/10"
                            }
                          `}
                        >

                          <div
                            className={`
                              w-2
                              h-2
                              rounded-full
                              ${
                                i ===
                                0
                                  ? "bg-[#041f19]"
                                  : "bg-white/40"
                              }
                            `}
                          />
                        </div>

                        <div className="flex-1 pt-0.5">

                          <p className="text-white text-sm font-medium leading-relaxed">
                            {log.fromStatus
                              ? `${
                                  STATUS_LABELS[
                                    log
                                      .fromStatus
                                  ] ??
                                  log.fromStatus
                                } → ${
                                  STATUS_LABELS[
                                    log
                                      .toStatus
                                  ] ??
                                  log.toStatus
                                }`
                              : `Request ${
                                  STATUS_LABELS[
                                    log
                                      .toStatus
                                  ]?.toLowerCase() ??
                                  log.toStatus
                                }`}
                          </p>

                          <p className="text-white/35 text-xs mt-1">
                            {formatDistanceToNow(
                              new Date(
                                log.createdAt
                              ),
                              {
                                addSuffix:
                                  true,
                              }
                            )}
                          </p>

                          {log.note &&
                            !log.note.startsWith(
                              "[internal]"
                            ) && (
                              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">

                                <p className="text-white/65 text-sm leading-relaxed">
                                  {
                                    log.note
                                  }
                                </p>
                              </div>
                            )}
                        </div>
                      </li>
                    );
                  }
                )}
              </ol>
            )}

            {/* Contact */}
            <div className="mt-10 pt-8 border-t border-white/10">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center shrink-0">

                  <ShieldCheck className="w-5 h-5 text-[#C9A84C]" />
                </div>

                <div>

                  <h3 className="text-white text-sm font-medium mb-2">
                    Need assistance?
                  </h3>

                  <p className="text-white/50 text-sm leading-relaxed mb-4">
                    Contact our team regarding this request or any additional clarification.
                  </p>

                  <a
                    href="mailto:info@premasse.co.zw"
                    className="text-[#C9A84C] text-sm hover:text-white transition-colors duration-300"
                  >
                    info@premasse.co.zw
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}