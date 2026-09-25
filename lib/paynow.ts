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

  console.log("[paynow] Creating Paynow client — ID present:", !!integrationId,
    "| ID length:", integrationId?.length,
    "| Key present:", !!integrationKey,
    "| Test mode:", isPaynowTestMode());

  if (!integrationId || !integrationKey) {
    console.error("[paynow] ❌ Missing Paynow credentials!");
    throw new Error(
      "PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY must be set in .env.local"
    );
  }

  // Trim any whitespace
  const cleanId = integrationId.trim();
  const cleanKey = integrationKey.trim();

  // Never log the full integration ID/key — a masked prefix is enough to
  // confirm the right credential is loaded without exposing it in logs.
  console.log("[paynow] Using Integration ID:", maskSecret(cleanId));

  const paynow = new Paynow(cleanId, cleanKey);

  paynow.resultUrl = `${SITE_URL}/api/paynow/webhook`;
  paynow.returnUrl = `${SITE_URL}/payment/complete?ref=${requestId}`;

  return paynow;
}

// ─── Masking helper for safe logging ─────────────────────────────────────────

function maskSecret(value: string): string {
  if (value.length <= 4) return "****";
  return `${value.slice(0, 4)}${"*".repeat(Math.max(value.length - 4, 4))}`;
}

// ─── Test mode vs live mode ──────────────────────────────────────────────────
// Paynow's `authemail` behaviour is genuinely different between an
// integration that Paynow has not yet approved ("test mode") and one that
// has been approved for real customer payments ("live mode") — this can't be
// detected from our side (Paynow decides it when they review the
// integration), so it's controlled by the PAYNOW_TEST_MODE env var.
//
//   PAYNOW_TEST_MODE=true  (default) — Paynow will only allow the
//     integration's own registered/login email as `authemail`; anything
//     else is rejected with "The integration ID is in test mode...". Use
//     PAYNOW_MERCHANT_EMAIL for every transaction in this mode.
//   PAYNOW_TEST_MODE=false — the integration is live. `authemail` must be
//     the CUSTOMER's email instead: Paynow uses it to decide whether the
//     payer has a registered Paynow account of their own. Passing the
//     merchant's email here in live mode makes Paynow think the merchant is
//     paying and prompts the customer to log into the merchant's own
//     account, breaking checkout for real customers entirely.
//
// Defaults to "true" because that matches this integration's current,
// as-configured state (this is exactly the error being fixed). Set
// PAYNOW_TEST_MODE=false in both local and Vercel env once Paynow approves
// the integration for live payments — see the "Request to be Set Live"
// step in the Paynow merchant dashboard.

export function isPaynowTestMode(): boolean {
  const raw = process.env.PAYNOW_TEST_MODE;
  if (raw === undefined) return true;
  return raw.trim().toLowerCase() !== "false";
}

// ─── Merchant auth email ──────────────────────────────────────────────────────
// The Paynow merchant account's own registered/login email — required as
// `authemail` in test mode, and used as a last-resort fallback in live mode
// if a request somehow has no customer email (see resolvePaynowAuthEmail).

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

// ─── Resolve the correct authemail for a transaction ─────────────────────────
// Single source of truth for the customer-email-vs-merchant-email decision,
// driven by PAYNOW_TEST_MODE (see above). Always use this instead of picking
// between clientEmail / PAYNOW_MERCHANT_EMAIL inline at each call site.

export function resolvePaynowAuthEmail(customerEmail?: string | null): string {
  if (isPaynowTestMode()) {
    console.warn(
      "[paynow] Running in TEST MODE (PAYNOW_TEST_MODE=true/unset) — using " +
      "PAYNOW_MERCHANT_EMAIL as authemail, per Paynow's test-mode " +
      "requirement. Set PAYNOW_TEST_MODE=false once Paynow sets this " +
      "integration live, so real customer emails are used instead."
    );
    return getPaynowMerchantAuthEmail();
  }

  const trimmedCustomerEmail = customerEmail?.trim();
  if (trimmedCustomerEmail) return trimmedCustomerEmail;

  // Defensive fallback only — clientEmail is a required field on
  // ServiceRequest, so this should be practically unreachable in live mode.
  console.warn("[paynow] No customer email available in live mode — falling back to merchant email.");
  return getPaynowMerchantAuthEmail();
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
// BUG FIX: this previously sorted the payload keys alphabetically before
// concatenating them. Paynow's own "Validating a hash on an inbound message"
// spec (developers.paynow.co.zw/docs/paynow/validating_hash) requires the
// values to be joined in the order the fields appear in the received
// message — NOT alphabetically. Sorting silently broke verification for
// every genuine webhook (any field set whose arrival order isn't already
// alphabetical), so this was rejecting real Paynow callbacks as invalid and
// relying entirely on manual/admin polling to ever mark a payment PAID.
// `payload` here comes from parseWebhookBody(), which uses
// Object.fromEntries(new URLSearchParams(body)) — this already preserves
// the original field order from the POST body, so we just need to stop
// re-sorting it.

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

// ─── Webhook status-transition guard ─────────────────────────────────────────
// Decides whether an inbound (already hash-verified) status update should be
// applied to a payment record. Used by the webhook handler to:
//   1. Skip no-op updates — protects against duplicate/replayed callbacks
//      re-processing (and re-advancing the request / re-writing audit logs
//      for) a payment whose status hasn't actually changed.
//   2. Never let a payment regress out of PAID — a confirmed payment must
//      not be silently overwritten by a stale, reordered, or duplicate
//      "Cancelled"/"Failed" callback arriving after a "Paid" one.

export function shouldApplyWebhookStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  if (currentStatus === newStatus) return false;
  if (currentStatus === "PAID") return false;
  return true;
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