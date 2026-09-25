// tests/paynow.test.ts
// Unit tests for lib/paynow.ts — run with `npm test` (node:test via tsx).
//
// Covers the behaviour fixed in this change:
//   - authemail resolution correctly separates PAYNOW_MERCHANT_EMAIL
//     (test mode) from the customer's email (live mode), and never
//     confuses the two.
//   - verifyPaynowHash validates against Paynow's actual "join values in
//     the order they arrived, do not sort" algorithm.
//   - webhook status transitions are idempotent and never let a confirmed
//     PAID payment regress to a stale Cancelled/Failed callback.

import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import {
  isPaynowTestMode,
  resolvePaynowAuthEmail,
  getPaynowMerchantAuthEmail,
  verifyPaynowHash,
  mapPaynowStatus,
  buildMerchantRef,
  extractPaymentIdFromMerchantRef,
  shouldApplyWebhookStatusTransition,
} from "../lib/paynow";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function signPayload(
  fields: Record<string, string>,
  integrationKey: string
): Record<string, string> {
  // Mirrors Paynow's real algorithm: join values in field order, append the
  // integration key, SHA512, uppercase hex. Deliberately does NOT sort keys.
  const raw = Object.values(fields).join("") + integrationKey;
  const hash = crypto.createHash("sha512").update(raw).digest("hex").toUpperCase();
  return { ...fields, hash };
}

// ─── authemail resolution (the reported bug) ─────────────────────────────────

describe("resolvePaynowAuthEmail / isPaynowTestMode", () => {
  beforeEach(resetEnv);
  afterEach(resetEnv);

  test("defaults to test mode when PAYNOW_TEST_MODE is unset", () => {
    delete process.env.PAYNOW_TEST_MODE;
    assert.equal(isPaynowTestMode(), true);
  });

  test("test mode uses PAYNOW_MERCHANT_EMAIL, never the customer's email", () => {
    process.env.PAYNOW_TEST_MODE = "true";
    process.env.PAYNOW_MERCHANT_EMAIL = "merchant@premasse.co.zw";

    const result = resolvePaynowAuthEmail("customer@example.com");
    assert.equal(result, "merchant@premasse.co.zw");
    assert.notEqual(result, "customer@example.com");
  });

  test("live mode uses the customer's email, never the merchant's email", () => {
    process.env.PAYNOW_TEST_MODE = "false";
    process.env.PAYNOW_MERCHANT_EMAIL = "merchant@premasse.co.zw";

    const result = resolvePaynowAuthEmail("customer@example.com");
    assert.equal(result, "customer@example.com");
    assert.notEqual(result, "merchant@premasse.co.zw");
  });

  test("live mode falls back to merchant email only if no customer email exists", () => {
    process.env.PAYNOW_TEST_MODE = "false";
    process.env.PAYNOW_MERCHANT_EMAIL = "merchant@premasse.co.zw";

    assert.equal(resolvePaynowAuthEmail(undefined), "merchant@premasse.co.zw");
    assert.equal(resolvePaynowAuthEmail(""), "merchant@premasse.co.zw");
    assert.equal(resolvePaynowAuthEmail("   "), "merchant@premasse.co.zw");
  });

  test("throws a clear error if PAYNOW_MERCHANT_EMAIL is missing in test mode", () => {
    process.env.PAYNOW_TEST_MODE = "true";
    delete process.env.PAYNOW_MERCHANT_EMAIL;

    assert.throws(() => resolvePaynowAuthEmail("customer@example.com"), /PAYNOW_MERCHANT_EMAIL/);
  });

  test("getPaynowMerchantAuthEmail trims whitespace", () => {
    process.env.PAYNOW_MERCHANT_EMAIL = "  merchant@premasse.co.zw  ";
    assert.equal(getPaynowMerchantAuthEmail(), "merchant@premasse.co.zw");
  });
});

// ─── Hash verification (order-of-fields bug) ─────────────────────────────────

describe("verifyPaynowHash", () => {
  beforeEach(resetEnv);
  afterEach(resetEnv);

  test("validates a real Paynow-style payload whose field order is not alphabetical", () => {
    process.env.PAYNOW_INTEGRATION_KEY = "test-integration-key-123";

    // Field order as Paynow actually sends it (reference, paynowreference,
    // amount, status, pollurl) is NOT alphabetical (amount, paynowreference,
    // pollurl, reference, status) — this is the exact case the old
    // `.sort()` bug broke.
    const payload = signPayload(
      {
        reference: "PREMASSE_abc123",
        paynowreference: "9510",
        amount: "25.00",
        status: "Paid",
        pollurl: "https://paynow.co.zw/poll/xyz",
      },
      "test-integration-key-123"
    );

    assert.equal(verifyPaynowHash(payload), true);
  });

  test("rejects a payload with a tampered value", () => {
    process.env.PAYNOW_INTEGRATION_KEY = "test-integration-key-123";

    const payload = signPayload(
      { reference: "PREMASSE_abc123", amount: "25.00", status: "Paid" },
      "test-integration-key-123"
    );
    payload.amount = "999.00"; // tamper after signing

    assert.equal(verifyPaynowHash(payload), false);
  });

  test("rejects when there is no hash field", () => {
    process.env.PAYNOW_INTEGRATION_KEY = "test-integration-key-123";
    assert.equal(verifyPaynowHash({ reference: "PREMASSE_abc123", status: "Paid" }), false);
  });

  test("rejects when PAYNOW_INTEGRATION_KEY is not configured", () => {
    delete process.env.PAYNOW_INTEGRATION_KEY;
    assert.equal(verifyPaynowHash({ reference: "x", status: "Paid", hash: "whatever" }), false);
  });
});

// ─── Status mapping ───────────────────────────────────────────────────────────

describe("mapPaynowStatus", () => {
  test("maps known Paynow statuses to internal PaymentStatus values", () => {
    assert.equal(mapPaynowStatus("Paid"), "PAID");
    assert.equal(mapPaynowStatus("Awaiting Delivery"), "PAID");
    assert.equal(mapPaynowStatus("Cancelled"), "CANCELLED");
    assert.equal(mapPaynowStatus("Failed"), "FAILED");
    assert.equal(mapPaynowStatus("Sent"), "AWAITING_PAYMENT");
  });

  test("defaults unknown statuses to AWAITING_PAYMENT rather than losing the payment", () => {
    assert.equal(mapPaynowStatus("SomeNewStatusPaynowInvented"), "AWAITING_PAYMENT");
  });
});

// ─── Merchant reference round-trip ────────────────────────────────────────────

describe("buildMerchantRef / extractPaymentIdFromMerchantRef", () => {
  test("round-trips a CUID payment id", () => {
    const paymentId = "cmoy4c3vq0002da0h0l15vfwi";
    const ref = buildMerchantRef(paymentId);
    assert.equal(ref, "PREMASSE_cmoy4c3vq0002da0h0l15vfwi");
    assert.equal(extractPaymentIdFromMerchantRef(ref), paymentId);
  });

  test("returns null for a reference in the wrong format", () => {
    assert.equal(extractPaymentIdFromMerchantRef("SOMEOTHERPREFIX_abc123"), null);
  });
});

// ─── Webhook idempotency / duplicate-callback protection ─────────────────────

describe("shouldApplyWebhookStatusTransition", () => {
  test("skips when the status hasn't changed (duplicate callback)", () => {
    assert.equal(shouldApplyWebhookStatusTransition("AWAITING_PAYMENT", "AWAITING_PAYMENT"), false);
    assert.equal(shouldApplyWebhookStatusTransition("PAID", "PAID"), false);
  });

  test("applies a genuine forward transition", () => {
    assert.equal(shouldApplyWebhookStatusTransition("AWAITING_PAYMENT", "PAID"), true);
    assert.equal(shouldApplyWebhookStatusTransition("PENDING", "AWAITING_PAYMENT"), true);
  });

  test("never lets a confirmed PAID payment regress to Cancelled or Failed", () => {
    assert.equal(shouldApplyWebhookStatusTransition("PAID", "CANCELLED"), false);
    assert.equal(shouldApplyWebhookStatusTransition("PAID", "FAILED"), false);
    assert.equal(shouldApplyWebhookStatusTransition("PAID", "AWAITING_PAYMENT"), false);
  });
});
