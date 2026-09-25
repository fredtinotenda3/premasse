// app/api/payments/[id]/poll-status/route.ts
// Public, read-only status check for a payment, used by the customer-facing
// payment/complete page. Paynow does not guarantee resulturl webhook
// delivery (see their "Polling for a Status Update" docs) so this is the
// documented fallback — deliberately public (no admin auth), since the
// payment id is an unguessable CUID and this endpoint reveals nothing
// beyond status. It reuses the same applyPaymentStatusUpdate() logic as
// the webhook so a payment confirmed this way still advances the request
// and gets an audit log entry, not just a status flip.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaynowClient, mapPaynowStatus } from "@/lib/paynow";
import { applyPaymentStatusUpdate } from "@/lib/payment-status";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paymentId } = await params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, pollUrl: true, status: true, requestId: true, paynowRef: true },
  });

  if (!payment) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  if (["PAID", "FAILED", "CANCELLED"].includes(payment.status) || !payment.pollUrl) {
    return NextResponse.json({ success: true, status: payment.status });
  }

  try {
    const paynow = createPaynowClient(payment.requestId);
    const result = await paynow.pollTransaction(payment.pollUrl);

    let paynowStatus: string;
    if (typeof result.status === "function") {
      paynowStatus = result.status();
    } else if (typeof result.status === "string") {
      paynowStatus = result.status;
    } else if (result.data && typeof result.data.status === "string") {
      paynowStatus = result.data.status;
    } else {
      paynowStatus = "pending";
    }

    const newStatus = mapPaynowStatus(paynowStatus);
    const outcome = await applyPaymentStatusUpdate(paymentId, newStatus, payment.paynowRef);

    return NextResponse.json({ success: true, status: outcome.status });
  } catch (err) {
    // Never fail the customer's page over a transient poll error — just
    // report the last known status; the client will retry shortly.
    console.error("[payments/poll-status] Poll failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: true, status: payment.status });
  }
}
