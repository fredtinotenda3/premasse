"use client";

// Polls /api/payments/[id]/poll-status while a payment is still pending, and
// refreshes this (server-rendered) page the moment it resolves — so the
// customer sees "Payment confirmed" without needing to manually reload.
// Renders nothing; it's a background effect only.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = 30; // ~2 minutes, then give up silently (email still arrives)

export default function PaymentStatusPoller({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const attempts = useRef(0);

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      attempts.current += 1;
      if (attempts.current > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/payments/${paymentId}/poll-status`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.status && data.status !== "AWAITING_PAYMENT") {
          clearInterval(interval);
          router.refresh();
        }
      } catch {
        // Transient network error — just try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [paymentId, router]);

  return null;
}
