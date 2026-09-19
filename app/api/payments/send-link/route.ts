// app/api/payments/send-link/route.ts
// Sends payment link to client via email or WhatsApp.
//
// SECURITY: amount, recipient email, and the payment link are always read
// from the authoritative Payment/ServiceRequest records in the database —
// never trusted from the client request body — so a tampered client request
// cannot redirect the email, alter the amount shown, or substitute a
// different payment link.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  // Admin auth guard
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  }

  const body = await req.json();
  const { paymentId, requestId, method } = body;

  // NOTE: any `to`, `amount`, `paymentLink`, `clientName` fields the client
  // may still send are intentionally ignored below — they are not
  // authoritative. See the lookup against `prisma.payment` further down.

  console.info(`[payments/send-link] Request received — method="${method}", paymentId=${paymentId ?? "(none)"}, requestId=${requestId ?? "(none)"}`);

  if (!requestId || !method) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Load the authoritative payment record (and its request/service) —
  // this is the single source of truth for amount, recipient email, and
  // the payment link.
  const payment = paymentId
    ? await prisma.payment.findFirst({
        where: { id: paymentId, requestId },
        include: { request: { include: { service: { select: { name: true } } } } },
      })
    : await prisma.payment.findFirst({
        where: { requestId, status: "AWAITING_PAYMENT" },
        orderBy: { createdAt: "desc" },
        include: { request: { include: { service: { select: { name: true } } } } },
      });

  if (!payment) {
    return NextResponse.json(
      { success: false, error: "Payment not found." },
      { status: 404 }
    );
  }

  if (payment.status !== "AWAITING_PAYMENT") {
    return NextResponse.json(
      { success: false, error: "This payment is not awaiting payment; a link cannot be sent." },
      { status: 409 }
    );
  }

  const serviceRequest = payment.request;
  const to = serviceRequest.clientEmail;
  const clientName = serviceRequest.clientName;
  const amount = payment.amount;
  const paymentLink = payment.redirectUrl;

  if (!to) {
    return NextResponse.json(
      { success: false, error: "This request has no client email on file." },
      { status: 400 }
    );
  }

  if (method === "email" && !paymentLink) {
    return NextResponse.json(
      { success: false, error: "This payment has no web payment link to send (mobile payments don't have one)." },
      { status: 400 }
    );
  }

  try {
    if (method === "email") {

      // Send via Email
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Premasse <onboarding@resend.dev>",
        to: [to],
        subject: `💰 Payment Request: ${serviceRequest.service.name} - Premasse`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 32px;">
              <h1 style="color: #1B5E20; font-size: 28px; margin: 0;">Premasse</h1>
              <p style="color: #C9A84C; font-size: 11px; letter-spacing: 2px;">Business Services</p>
            </div>
            
            <h2 style="color: #1B5E20;">Payment Request</h2>
            
            <p>Hello ${clientName?.split(" ")[0] ?? "there"},</p>
            
            <p>Please complete your payment for <strong>${serviceRequest.service.name}</strong>:</p>
            
            <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #1B5E20; margin: 0;">
                $${amount?.toFixed(2) ?? "0.00"} USD
              </p>
            </div>
            
            <a href="${paymentLink}"
               style="display: inline-block; background-color: #1B5E20; color: #C9A84C;
                      padding: 14px 28px; text-decoration: none; border-radius: 4px;
                      margin: 16px 0; text-align: center; width: auto;">
              Pay Now →
            </a>
            
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              This link expires in 24 hours. If you have any questions, please reply to this email.
            </p>
            
            <hr style="margin: 32px 0 16px;" />
            <p style="color: #999; font-size: 11px;">Premasse Business Services · Harare, Zimbabwe</p>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error("[payments/send-link] Email error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      console.log(`[payments/send-link] Payment link emailed to ${to}`);
      return NextResponse.json({ success: true, method: "email" });
    }

    if (method === "whatsapp") {
      // For WhatsApp - you can implement Twilio here if configured
      // For now, return a message that it's not configured
      return NextResponse.json(
        { success: false, error: "WhatsApp not configured yet. Email is working!" },
        { status: 501 }
      );
    }

    return NextResponse.json({ success: false, error: "Invalid method" }, { status: 400 });
  } catch (err) {
    console.error("[payments/send-link] Error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}