// app/api/paynow/webhook/route.ts
// Receives payment status updates from Paynow via POST.
// Automatically updates payment status and request status when client pays.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPaynowHash,
  parseWebhookBody,
  mapPaynowStatus,
  extractPaymentIdFromMerchantRef,
  shouldApplyWebhookStatusTransition,
} from "@/lib/paynow";

export async function POST(req: NextRequest) {
  // 1. Read raw body (URL-encoded form data from Paynow)
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    console.error("[paynow/webhook] Failed to read request body");
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 2. Parse URL-encoded payload
  const payload = parseWebhookBody(rawBody);
  console.info("[paynow/webhook] Received payload:", {
    reference: payload["reference"],
    status: payload["status"],
    amount: payload["amount"],
  });

  // 3. Verify hash — reject anything that doesn't match
  if (!verifyPaynowHash(payload)) {
    console.warn("[paynow/webhook] Hash verification FAILED — ignoring payload");
    return new NextResponse("OK", { status: 200 });
  }

  // 4. Extract Paynow fields
  const paynowReference = payload["reference"];   // Our merchant ref: "PREMASSE_{paymentId}"
  const paynowStatus = payload["status"];         // "Paid", "Cancelled", "Failed"
  const paynowRef = payload["paynowreference"];   // Paynow's own reference number

  if (!paynowReference || !paynowStatus) {
    console.warn("[paynow/webhook] Missing reference or status in payload");
    return new NextResponse("OK", { status: 200 });
  }

  // 5. Extract our paymentId from the merchant reference
  const paymentId = extractPaymentIdFromMerchantRef(paynowReference);
  if (!paymentId) {
    console.warn(`[paynow/webhook] Invalid merchant reference format: ${paynowReference}`);
    return new NextResponse("OK", { status: 200 });
  }

  console.log(`[paynow/webhook] Processing payment: ${paymentId}, status: ${paynowStatus}`);

  // 6. Load the payment record
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      request: {
        select: {
          id: true,
          status: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  if (!payment) {
    console.warn(`[paynow/webhook] No payment found for id=${paymentId}`);
    return new NextResponse("OK", { status: 200 });
  }

  // 7. Map Paynow status to our PaymentStatus
  const newStatus = mapPaynowStatus(paynowStatus);

  // Skip no-op updates (duplicate/replayed callbacks) and never let a
  // confirmed PAID payment regress to a stale Cancelled/Failed status.
  if (!shouldApplyWebhookStatusTransition(payment.status, newStatus)) {
    console.info(
      `[paynow/webhook] Ignoring transition ${payment.status} → ${newStatus} ` +
      `(no-op or would regress a confirmed payment) — skipping`
    );
    return new NextResponse("OK", { status: 200 });
  }

  console.log(`[paynow/webhook] Updating payment ${paymentId}: ${payment.status} → ${newStatus}`);

  // 8. Update payment + optionally update request status
  await prisma.$transaction(async (tx) => {
    // Update payment record
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: newStatus,
        paynowRef: paynowRef ?? null,
        paidAt: newStatus === "PAID" ? new Date() : null,
      },
    });

    // If paid — advance request to IN_PROGRESS and write audit log
    if (newStatus === "PAID" && payment.request.status === "AWAITING_PAYMENT") {
      console.log(`[paynow/webhook] Payment confirmed! Updating request ${payment.request.id} to IN_PROGRESS`);

      // Find system admin for audit log actor
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

  console.info(
    `[paynow/webhook] ✅ Payment ${paymentId} updated to ${newStatus}` +
    (newStatus === "PAID" ? ` — request ${payment.request.id} advanced to IN_PROGRESS` : "")
  );

  // Paynow requires exactly "OK" in the response body
  return new NextResponse("OK", { status: 200 });
}