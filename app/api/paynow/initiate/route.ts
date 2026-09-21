// app/api/paynow/initiate/route.ts
// Admin-only. Creates a Payment record and initiates it with Paynow.
// Supports both web checkout and mobile (EcoCash / OneMoney).
// Returns the redirectUrl (web) or instructions (mobile) for the admin to share.

import { NextRequest, NextResponse } from "next/server";
import { z }                        from "zod";
import { auth }                     from "@/auth";
import { prisma }                   from "@/lib/prisma";
import {
  createPaynowClient,
  buildMerchantRef,
  getPaynowMerchantAuthEmail,
}                                   from "@/lib/paynow";

// ── Validation schema ─────────────────────────────────────────────────────────

const initiateSchema = z.object({
  requestId: z.string().cuid(),
  amount:    z.number().positive("Amount must be greater than 0").max(100000),
  method:    z.enum(["web", "ecocash", "onemoney"]),
  phone:     z
    .string()
    .regex(/^(\+263|0)[0-9]{9}$/, "Enter a valid Zimbabwean number")
    .optional(),
}).refine(
  (data) => data.method === "web" || !!data.phone,
  { message: "Phone number is required for mobile payments", path: ["phone"] }
);

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Admin auth guard
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  }

  // 2. Parse + validate
  let body: unknown;
  try { body = await req.json(); }
  catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = initiateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { requestId, amount, method, phone } = parsed.data;

  // 3. Load request + service
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where:   { id: requestId },
    include: { service: { select: { name: true } } },
  });

  if (!serviceRequest) {
    return NextResponse.json({ success: false, error: "Request not found." }, { status: 404 });
  }

  if (["COMPLETED", "CANCELLED"].includes(serviceRequest.status)) {
    return NextResponse.json(
      { success: false, error: "Cannot initiate payment on a closed request." },
      { status: 409 }
    );
  }

  // 4. Block duplicate pending payments
  const existingPending = await prisma.payment.findFirst({
    where:  { requestId, status: { in: ["PENDING", "AWAITING_PAYMENT"] } },
    select: { id: true },
  });

  if (existingPending) {
    return NextResponse.json(
      { success: false, error: "A payment is already in progress for this request." },
      { status: 409 }
    );
  }

  // 5. Resolve Paynow's authemail. This must be the CUSTOMER's email, per
  //    Paynow's own SDK semantics — Paynow uses it to check whether the
  //    payer has a registered Paynow account (prompting a normal login for
  //    THEIR OWN account) or lets them pay as a guest. Passing the
  //    merchant's own email here was tried and is wrong: it makes Paynow's
  //    checkout page think the *merchant* is paying, and prompts the
  //    customer to log into the merchant's Paynow account — which they
  //    obviously can't and shouldn't do. `clientEmail` is a required field
  //    on ServiceRequest, so this will always be present; the merchant
  //    email is kept only as a last-resort fallback for defense in depth.
  let authEmail = serviceRequest.clientEmail;
  if (!authEmail) {
    try {
      authEmail = getPaynowMerchantAuthEmail();
    } catch (err) {
      console.error("[paynow/initiate] Paynow configuration error:", err);
      return NextResponse.json(
        { success: false, error: "Paynow is not configured correctly. Contact the administrator." },
        { status: 500 }
      );
    }
  }

  // 6. Create Payment record (PENDING) before calling Paynow
  const payment = await prisma.payment.create({
    data: {
      requestId,
      amount,
      method,
      phone:       phone ?? null,
      status:      "PENDING",
      initiatedBy: session.user.id,
    },
    select: { id: true },
  });

  // 7. Build Paynow payment object.
  // authemail = the CUSTOMER's email (see note above) — this is what lets
  // real customers actually complete payment instead of being redirected
  // to log into the merchant's own Paynow account.
  const paynow     = createPaynowClient(requestId);
  const merchantRef = buildMerchantRef(payment.id);
  const paynowPayment = paynow.createPayment(
    merchantRef,
    authEmail
  );
  paynowPayment.add(serviceRequest.service.name, amount);

  // 8. Send to Paynow
  try {
    if (method === "web") {
      // ── Web checkout ──────────────────────────────────────────────────────
      const response = await paynow.send(paynowPayment);

      if (!response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data:  { status: "FAILED" },
        });
        console.error("[paynow/initiate] Paynow web init failed:", response.error);
        return NextResponse.json(
          { success: false, error: response.error ?? "Paynow rejected the payment request." },
          { status: 502 }
        );
      }

      // Save pollUrl + redirectUrl
      await prisma.payment.update({
        where: { id: payment.id },
        data:  {
          status:      "AWAITING_PAYMENT",
          pollUrl:     response.pollUrl,
          redirectUrl: response.redirectUrl,
        },
      });

      console.info(
        `[paynow/initiate] Web payment initiated: ${payment.id} for request ${requestId} ($${amount})`
      );

      return NextResponse.json({
        success:     true,
        paymentId:   payment.id,
        method:      "web",
        redirectUrl: response.redirectUrl,
        pollUrl:     response.pollUrl,
      });

    } else {
      // ── Mobile (EcoCash / OneMoney) ───────────────────────────────────────
      const response = await paynow.sendMobile(paynowPayment, phone!, method);

      if (!response.success) {
        await prisma.payment.update({
          where: { id: payment.id },
          data:  { status: "FAILED" },
        });
        console.error("[paynow/initiate] Paynow mobile init failed:", response.error);
        return NextResponse.json(
          { success: false, error: response.error ?? "Mobile payment request failed." },
          { status: 502 }
        );
      }

      // Save pollUrl for status polling
      await prisma.payment.update({
        where: { id: payment.id },
        data:  {
          status:  "AWAITING_PAYMENT",
          pollUrl: response.pollUrl,
        },
      });

      console.info(
        `[paynow/initiate] Mobile payment initiated: ${payment.id} for request ${requestId} ($${amount} via ${method})`
      );

      return NextResponse.json({
        success:      true,
        paymentId:    payment.id,
        method,
        instructions: response.instructions,
        pollUrl:      response.pollUrl,
      });
    }
  } catch (err) {
    // Paynow SDK threw — mark payment failed
    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: "FAILED" },
    });
    console.error("[paynow/initiate] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Payment initiation failed. Please try again." },
      { status: 500 }
    );
  }
}