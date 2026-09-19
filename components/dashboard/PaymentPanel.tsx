"use client";

// components/dashboard/PaymentPanel.tsx
// Premium admin payment panel aligned with Premasse design system.
// Original logic preserved completely — improved UI/UX only.

import { useState, useEffect } from "react";
import {
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

type PaymentStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "CANCELLED";

type ExistingPayment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  redirectUrl: string | null;
  createdAt: string;
  paidAt: string | null;
};

type Props = {
  requestId: string;
  existingPayment: ExistingPayment | null;
};

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    classes: string;
  }
> = {
  PENDING: {
    label: "Pending",
    classes:
      "bg-slate-500/10 text-slate-300 border-slate-400/20",
  },

  AWAITING_PAYMENT: {
    label: "Awaiting payment",
    classes:
      "bg-amber-500/10 text-amber-300 border-amber-400/20 shadow-[0_0_25px_rgba(245,158,11,0.12)]",
  },

  PAID: {
    label: "Paid",
    classes:
      "bg-emerald-500/10 text-emerald-300 border-emerald-400/20 shadow-[0_0_25px_rgba(16,185,129,0.14)]",
  },

  FAILED: {
    label: "Failed",
    classes:
      "bg-red-500/10 text-red-300 border-red-400/20 shadow-[0_0_25px_rgba(239,68,68,0.12)]",
  },

  CANCELLED: {
    label: "Cancelled",
    classes:
      "bg-zinc-500/10 text-zinc-300 border-zinc-400/20",
  },
};

export default function PaymentPanel({
  requestId,
  existingPayment,
}: Props) {
  const [payment, setPayment] =
    useState<ExistingPayment | null>(
      existingPayment
    );

  const [amount, setAmount] =
    useState("");

  const [method, setMethod] =
    useState<
      "web" | "ecocash" | "onemoney"
    >("web");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [polling, setPolling] =
    useState(false);

  const [sending, setSending] =
    useState<
      "email" | "whatsapp" | null
    >(null);

  const [sendSuccess, setSendSuccess] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [clientDetails, setClientDetails] =
    useState<{
      email: string;
      name: string;
      phone: string;
    } | null>(null);

  const [
    latestPaymentLink,
    setLatestPaymentLink,
  ] = useState<string | null>(null);

  const [latestAmount, setLatestAmount] =
    useState<number | null>(null);

  // Fetch client details
  useEffect(() => {
    async function fetchClientDetails() {
      try {
        const res = await fetch(
          `/api/requests/${requestId}`
        );

        const json = await res.json();

        if (json.success && json.request) {
          setClientDetails({
            email:
              json.request.clientEmail,
            name:
              json.request.clientName,
            phone:
              json.request.clientPhone,
          });
        }
      } catch {}
    }

    fetchClientDetails();
  }, [requestId]);

  // Keep latest payment link
  useEffect(() => {
    if (
      payment?.redirectUrl &&
      payment.status !== "PAID"
    ) {
      setLatestPaymentLink(
        payment.redirectUrl
      );

      setLatestAmount(payment.amount);
    }
  }, [payment]);

  // Create payment
  async function handleInitiate() {
    setError("");
    setSendSuccess(null);

    const amountNum =
      parseFloat(amount);

    if (
      isNaN(amountNum) ||
      amountNum <= 0
    ) {
      setError(
        "Enter a valid amount greater than 0."
      );

      return;
    }

    if (
      method !== "web" &&
      !phone.match(
        /^(\+263|0)[0-9]{9}$/
      )
    ) {
      setError(
        "Enter a valid Zimbabwean phone number."
      );

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/paynow/initiate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            requestId,
            amount: amountNum,
            method,
            phone:
              phone || undefined,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        setError(
          json.error ??
            "Failed to create payment."
        );

        return;
      }

      setLatestPaymentLink(
        json.redirectUrl
      );

      setLatestAmount(amountNum);

      setPayment({
        id: json.paymentId,
        amount: amountNum,
        status:
          "AWAITING_PAYMENT",
        method,
        redirectUrl:
          json.redirectUrl,
        createdAt:
          new Date().toISOString(),
        paidAt: null,
      });

      setSendSuccess(
        "✅ Payment link created successfully."
      );

      setTimeout(
        () =>
          setSendSuccess(null),
        5000
      );
    } catch {
      setError(
        "Network error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Poll payment
  async function handlePoll() {
    if (!payment?.id) return;

    setPolling(true);

    try {
      const res = await fetch(
        `/api/paynow/poll?paymentId=${payment.id}`
      );

      const json = await res.json();

      if (
        json.success &&
        json.changed
      ) {
        setPayment((prev) =>
          prev
            ? {
                ...prev,
                status: json.status,
              }
            : prev
        );

        if (
          json.status === "PAID"
        ) {
          setLatestPaymentLink(
            null
          );

          setSendSuccess(
            "✅ Payment confirmed!"
          );
        }
      }
    } catch {
      setError(
        "Could not check payment status."
      );
    } finally {
      setPolling(false);
    }
  }

  // Send email
  async function sendEmailLink() {
    if (
      !payment?.id ||
      !latestPaymentLink ||
      !clientDetails?.email
    ) {
      setError(
        "No payment link or email available."
      );

      return;
    }

    setSending("email");

    try {
      const res = await fetch(
        "/api/payments/send-link",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            paymentId: payment?.id,
            requestId,
            method: "email",
          }),
        }
      );

      const json = await res.json();

      if (json.success) {
        setSendSuccess(
          `✅ Payment link sent to ${clientDetails.email}`
        );
      } else {
        setError(
          json.error ??
            "Failed to send email."
        );
      }
    } catch {
      setError(
        "Network error. Please try again."
      );
    } finally {
      setSending(null);
    }
  }

  // Send WhatsApp
  async function sendWhatsAppLink() {
    if (
      !payment?.id ||
      !latestPaymentLink ||
      !clientDetails?.phone
    ) {
      setError(
        "No payment link or phone number available."
      );

      return;
    }

    setSending("whatsapp");

    try {
      const res = await fetch(
        "/api/payments/send-link",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            paymentId: payment.id,
            requestId,
            method: "whatsapp",
          }),
        }
      );

      const json = await res.json();

      if (json.success) {
        setSendSuccess(
          `✅ Payment link sent via WhatsApp`
        );
      } else {
        setError(
          json.error ??
            "Failed to send WhatsApp."
        );
      }
    } catch {
      setError(
        "Network error. Please try again."
      );
    } finally {
      setSending(null);
    }
  }

  // Copy link
  async function copyToClipboard() {
    if (!latestPaymentLink) return;

    await navigator.clipboard.writeText(
      latestPaymentLink
    );

    setSendSuccess(
      "✅ Link copied to clipboard!"
    );

    setTimeout(
      () =>
        setSendSuccess(null),
      3000
    );
  }

  // Existing payment state
  if (
    payment &&
    payment.status !== "FAILED" &&
    payment.status !==
      "CANCELLED" &&
    payment.status !== "PENDING"
  ) {
    const config =
      STATUS_CONFIG[
        payment.status
      ];

    const isPending =
      payment.status ===
      "AWAITING_PAYMENT";

    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] space-y-5">

        <div className="absolute top-[-120px] right-[-120px] w-[240px] h-[240px] rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between">

          <div>
            <h2 className="font-display text-white text-xl font-semibold">
              Payment
            </h2>

            <p className="font-body text-white/45 text-sm mt-1">
              Payment tracking
              and client delivery
            </p>
          </div>

          <span
            className={`inline-flex items-center justify-center font-body font-semibold text-[10px] px-3 py-1.5 rounded-full border uppercase tracking-[0.16em] whitespace-nowrap ${config.classes}`}
          >
            {config.label}
          </span>
        </div>

        {/* Amount */}
        <div className="rounded-[1.5rem] border border-white/10 bg-black/10 px-5 py-5">

          <p className="font-body text-white/35 text-[11px] uppercase tracking-[0.18em] mb-2">
            Amount
          </p>

          <p className="font-display text-white text-4xl font-bold tracking-tight">
            $
            {payment.amount.toFixed(
              2
            )}

            <span className="text-white/35 text-base font-normal ml-2">
              USD
            </span>
          </p>
        </div>

        {/* Payment link */}
        {isPending &&
          payment.redirectUrl && (
            <div className="rounded-[1.5rem] border border-[#C9A84C]/15 bg-[#C9A84C]/10 p-5 space-y-4">

              <p className="font-body text-[#E9D28B] text-sm font-medium">
                Payment link ready
              </p>

              <div className="flex items-center gap-2">

                <input
                  readOnly
                  value={
                    payment.redirectUrl
                  }
                  className="font-mono text-xs bg-black/10 border border-white/10 rounded-xl px-4 py-3 flex-1 text-white/60 truncate"
                />

                <button
                  onClick={
                    copyToClipboard
                  }
                  className="font-body text-xs text-white hover:text-[#C9A84C] border border-white/10 hover:border-[#C9A84C]/30 bg-white/[0.03] px-4 py-3 rounded-xl transition-all shrink-0"
                >
                  Copy
                </button>
              </div>

              {/* Send to client */}
              <div className="border-t border-[#C9A84C]/15 pt-4">

                <p className="font-body text-white text-sm font-medium mb-3">
                  Send to client:
                </p>

                <div className="flex flex-col sm:flex-row gap-3">

                  {/* Email */}
                  <button
                    onClick={
                      sendEmailLink
                    }
                    disabled={
                      sending ===
                      "email"
                    }
                    className="flex-1 font-body text-sm bg-[#0A2540] hover:bg-[#0A2540]/90 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {sending ===
                    "email"
                      ? "Sending..."
                      : `📧 Email`}
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={
                      sendWhatsAppLink
                    }
                    disabled={
                      sending ===
                      "whatsapp"
                    }
                    className="flex-1 font-body text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {sending ===
                    "whatsapp"
                      ? "Sending..."
                      : `💬 WhatsApp`}
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Poll */}
        {isPending && (
          <button
            onClick={handlePoll}
            disabled={polling}
            className="w-full font-body text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {polling
              ? "Checking..."
              : "Check payment status"}
          </button>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="font-body text-red-200 text-sm">
              {error}
            </p>
          </div>
        )}

        {sendSuccess && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="font-body text-emerald-200 text-sm">
              {sendSuccess}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Create payment form
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] space-y-5">

      <div className="absolute top-[-120px] right-[-120px] w-[240px] h-[240px] rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <h2 className="font-display text-white text-xl font-semibold">
          Create payment
        </h2>

        <p className="font-body text-white/45 text-sm mt-1">
          Generate and send a secure payment link.
        </p>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="font-body text-white text-sm font-medium">
          Amount (USD)
        </label>

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          placeholder="0.00"
          className="w-full rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C]/30 transition-all"
        />
      </div>

      {/* Methods */}
      <div className="space-y-3">

        <label className="font-body text-white text-sm font-medium">
          Payment method
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {(
            [
              "web",
              "ecocash",
              "onemoney",
            ] as const
          ).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() =>
                setMethod(m)
              }
              className={`
                rounded-2xl
                border
                px-4
                py-4
                text-sm
                capitalize
                transition-all
                duration-300

                ${
                  method === m
                    ? "border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#E9D28B]"
                    : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20"
                }
              `}
            >
              {m === "web"
                ? "Web / Card"
                : m === "ecocash"
                ? "EcoCash"
                : "OneMoney"}
            </button>
          ))}
        </div>
      </div>

      {/* Phone */}
      {method !== "web" && (
        <div className="space-y-2">

          <label className="font-body text-white text-sm font-medium">
            Mobile number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="+263 77 123 4567"
            className="w-full rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 focus:border-[#C9A84C]/30 transition-all"
          />
        </div>
      )}

      {/* Create button */}
      <button
        onClick={handleInitiate}
        disabled={loading}
        className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-6 py-4 text-[#E9D28B] text-sm font-semibold tracking-[0.16em] uppercase hover:bg-[#C9A84C]/15 hover:border-[#C9A84C]/35 transition-all duration-300 disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            Create payment link

            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="font-body text-red-200 text-sm">
            {error}
          </p>
        </div>
      )}

      {sendSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="font-body text-emerald-200 text-sm">
            {sendSuccess}
          </p>
        </div>
      )}
    </div>
  );
}