// app/api/paynow/webhook/route.ts
// Receives payment status updates from Paynow via POST.
// Automatically updates payment status and request status when client pays.

import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaynowHash,
  parseWebhookBody,
  mapPaynowStatus,
  extractPaymentIdFromMerchantRef,
} from "@/lib/paynow";
import { applyPaymentStatusUpdate } from "@/lib/payment-status";

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

  // 6. Map Paynow status and apply it. applyPaymentStatusUpdate() loads the
  // payment, checks the transition is safe (no-op / already-PAID guard),
  // and — if applied — updates payment + advances the request + writes the
  // audit log. Shared with the customer-facing poll-status fallback route
  // so both paths behave identically.
  const newStatus = mapPaynowStatus(paynowStatus);
  const result = await applyPaymentStatusUpdate(paymentId, newStatus, paynowRef);

  if (!result.applied) {
    console.info(`[paynow/webhook] No-op for payment ${paymentId} (status: ${result.status})`);
    return new NextResponse("OK", { status: 200 });
  }

  console.info(`[paynow/webhook] ✅ Payment ${paymentId} updated to ${newStatus}`);

  // Paynow requires exactly "OK" in the response body
  return new NextResponse("OK", { status: 200 });
}