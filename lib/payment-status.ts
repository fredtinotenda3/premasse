// lib/payment-status.ts
// Shared logic for applying a confirmed Paynow status to a payment + its
// service request (advance to IN_PROGRESS, write audit log). Used by both
// the webhook handler (primary path) and the customer-facing poll-status
// fallback (Paynow does not guarantee webhook delivery — see their
// "Polling for a Status Update" docs) so the two paths can't drift apart.

import { prisma } from "@/lib/prisma";
import { shouldApplyWebhookStatusTransition } from "@/lib/paynow";

export async function applyPaymentStatusUpdate(
  paymentId: string,
  newStatus: "AWAITING_PAYMENT" | "PAID" | "FAILED" | "CANCELLED",
  paynowRef?: string | null
): Promise<{ applied: boolean; status: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { request: { select: { id: true, status: true } } },
  });

  if (!payment) return { applied: false, status: newStatus };

  if (!shouldApplyWebhookStatusTransition(payment.status, newStatus)) {
    return { applied: false, status: payment.status };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        paynowRef: paynowRef ?? undefined,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    });

    if (newStatus === "PAID" && payment.request.status === "AWAITING_PAYMENT") {
      const admin = await tx.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (admin) {
        await tx.serviceRequest.update({
          where: { id: payment.requestId },
          data: { status: "IN_PROGRESS" },
        });

        await tx.auditLog.create({
          data: {
            requestId: payment.requestId,
            changedBy: admin.id,
            fromStatus: "AWAITING_PAYMENT",
            toStatus: "IN_PROGRESS",
            note: `✅ Payment confirmed via Paynow (ref: ${paynowRef ?? paymentId}). Amount: $${payment.amount.toFixed(2)} USD.`,
          },
        });
      }
    }
  });

  return { applied: true, status: newStatus };
}
