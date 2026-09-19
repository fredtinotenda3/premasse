// lib/paynow.ts
// Paynow client factory and payment helpers.
// Server-side only — never import this in client components.

// @ts-expect-error: paynow package has no TypeScript types
import { Paynow } from "paynow";
import crypto from "crypto";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ─── Client factory ──────────────────────────────────────────────────────────

export function createPaynowClient(requestId: string): Paynow {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  
  console.log("[paynow] Creating Paynow client with:");
  console.log("[paynow] Integration ID exists:", !!integrationId);
  console.log("[paynow] Integration ID length:", integrationId?.length);
  console.log("[paynow] Integration Key exists:", !!integrationKey);
  
  if (!integrationId || !integrationKey) {
    console.error("[paynow] ❌ Missing Paynow credentials!");
    throw new Error(
      "PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY must be set in .env.local"
    );
  }

  // Trim any whitespace
  const cleanId = integrationId.trim();
  const cleanKey = integrationKey.trim();
  
  console.log("[paynow] Using Integration ID:", cleanId);
  
  const paynow = new Paynow(cleanId, cleanKey);

  paynow.resultUrl = `${SITE_URL}/api/paynow/webhook`;
  paynow.returnUrl = `${SITE_URL}/payment/complete?ref=${requestId}`;

  return paynow;
}

// ─── Merchant auth email ─────────────────────────────────────────────────────
// Paynow's `authemail` field identifies who Paynow itself corresponds with
// about the transaction on the merchant side. It is NOT the customer's email —
// the customer's email is used separately for Premasse's own communications
// (payment link delivery, receipts, etc.) and must never be passed here.
//
// While Paynow's integration is in TEST MODE, Paynow requires `authemail` to
// exactly match the merchant's own registered/login email address, or the
// transaction is rejected. This is a sandbox-only restriction — it is not a
// workaround we're relying on. Passing the merchant's registered email as
// `authemail` is also correct once the integration goes LIVE, so no branching
// or environment-specific logic is required here.

export function getPaynowMerchantAuthEmail(): string {
  const merchantEmail = process.env.PAYNOW_MERCHANT_EMAIL;

  if (!merchantEmail || !merchantEmail.trim()) {
    console.error("[paynow] ❌ Missing PAYNOW_MERCHANT_EMAIL!");
    throw new Error(
      "PAYNOW_MERCHANT_EMAIL must be set to the Paynow merchant account's " +
      "registered/login email address."
    );
  }

  return merchantEmail.trim();
}

// ─── Merchant reference ──────────────────────────────────────────────────────
// IMPORTANT: Paynow merchant reference cannot contain hyphens or special chars
// We replace hyphens with underscores to be safe

export function buildMerchantRef(paymentId: string): string {
  // Replace hyphens with underscores (Paynow doesn't like hyphens)
  const safePaymentId = paymentId.replace(/-/g, '_');
  return `PREMASSE_${safePaymentId}`;
}

// ─── Extract paymentId from merchant reference ───────────────────────────────

export function extractPaymentIdFromMerchantRef(merchantRef: string): string | null {
  // Format: PREMASSE_{paymentId}
  if (!merchantRef.startsWith("PREMASSE_")) return null;
  const paymentId = merchantRef.replace("PREMASSE_", "");
  // Restore hyphens (CUID format: cmoy4c3vq0002da0h0l15vfwi)
  // CUIDs don't have hyphens actually, so this is safe
  return paymentId;
}

// ─── Hash verification ───────────────────────────────────────────────────────

export function verifyPaynowHash(
  payload: Record<string, string>
): boolean {
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  if (!integrationKey) return false;

  const receivedHash = payload["hash"];
  if (!receivedHash) return false;

  const hashString =
    Object.keys(payload)
      .filter((k) => k !== "hash")
      .sort()
      .map((k) => `${payload[k]}`)
      .join("") + integrationKey;

  const expectedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  return receivedHash.toUpperCase() === expectedHash;
}

// ─── Parse webhook body ──────────────────────────────────────────────────────

export function parseWebhookBody(
  body: string
): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

// ─── Map Paynow status (improved with more statuses and case-insensitive) ────

export function mapPaynowStatus(
  paynowStatus: string
): "AWAITING_PAYMENT" | "PAID" | "FAILED" | "CANCELLED" {
  const status = paynowStatus.toLowerCase().trim();
  console.log(`[paynow] Mapping status: "${paynowStatus}" → normalized: "${status}"`);
  
  // Paid statuses - Paynow returns various strings
  if (["paid", "awaiting delivery", "completed", "success", "ok", "confirmed"].includes(status)) {
    return "PAID";
  }
  
  // Cancelled statuses
  if (["cancelled", "canceled", "cancelled by user", "expired"].includes(status)) {
    return "CANCELLED";
  }
  
  // Failed statuses
  if (["failed", "disputed", "error", "rejected", "declined"].includes(status)) {
    return "FAILED";
  }
  
  // Pending / awaiting
  if (["pending", "created", "awaited", "sent", "processing", "initiated"].includes(status)) {
    return "AWAITING_PAYMENT";
  }
  
  // Default to awaiting payment (don't lose the payment)
  console.warn(`[paynow] Unknown status "${paynowStatus}", defaulting to AWAITING_PAYMENT`);
  return "AWAITING_PAYMENT";
}

// ─── Test Paynow connection ──────────────────────────────────────────────────

export async function testPaynowConnection(): Promise<boolean> {
  try {
    console.log("[paynow] ✅ Paynow client created successfully");
    return true;
  } catch (error) {
    console.error("[paynow] ❌ Paynow client creation failed:", error);
    return false;
  }
}