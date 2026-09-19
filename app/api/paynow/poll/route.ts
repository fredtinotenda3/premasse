// app/api/paynow/poll/route.ts
// Admin-triggered status poll.
// Useful when a webhook hasn't arrived yet and the admin wants to check manually.
// Also used by the PaymentPanel component to refresh status on page load.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaynowClient, mapPaynowStatus } from "@/lib/paynow";

export async function GET(req: NextRequest) {
  // Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  }

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) {
    return NextResponse.json({ success: false, error: "paymentId is required." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, pollUrl: true, status: true, requestId: true },
  });

  if (!payment) {
    return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
  }

  if (!payment.pollUrl) {
    return NextResponse.json({ success: false, error: "No poll URL available for this payment." }, { status: 400 });
  }

  // Already in a terminal state — no need to poll
  if (["PAID", "FAILED", "CANCELLED"].includes(payment.status)) {
    return NextResponse.json({ success: true, status: payment.status, changed: false });
  }

  try {
    const paynow = createPaynowClient(payment.requestId);
    const result = await paynow.pollTransaction(payment.pollUrl);
    
    // FIX: The Paynow SDK returns different structures based on version
    // Try multiple ways to get the status
    let paynowStatus: string;
    
    if (typeof result.status === 'function') {
      // Old SDK version
      paynowStatus = result.status();
    } else if (typeof result.status === 'string') {
      // Direct string property
      paynowStatus = result.status;
    } else if (result.data && typeof result.data.status === 'string') {
      // Nested in data object
      paynowStatus = result.data.status;
    } else {
      // Fallback - check the result object structure
      console.log("[paynow/poll] Result structure:", JSON.stringify(result, null, 2));
      // Assume still pending if we can't determine
      paynowStatus = "pending";
    }
    
    console.log(`[paynow/poll] Payment ${paymentId} status from Paynow: ${paynowStatus}`);
    
    const newStatus = mapPaynowStatus(paynowStatus);

    // If status changed, update DB
    if (newStatus !== payment.status) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          paidAt: newStatus === "PAID" ? new Date() : undefined,
        },
      });

      console.info(`[paynow/poll] Payment ${paymentId}: ${payment.status} → ${newStatus}`);
      return NextResponse.json({ success: true, status: newStatus, changed: true });
    }

    return NextResponse.json({ success: true, status: newStatus, changed: false });
  } catch (err: any) {
    // Log as much detail as we safely can (never the integration key) so the
    // *actual* text Paynow returns is visible in Vercel logs, instead of
    // just our generic message to the admin UI.
    console.error("[paynow/poll] Poll failed. pollUrl present:", !!payment.pollUrl);
    console.error("[paynow/poll] Error message:", err?.message);
    if (err?.response) {
      console.error("[paynow/poll] Upstream HTTP status:", err.response.status);
      console.error("[paynow/poll] Upstream response body:", err.response.data);
    }
    return NextResponse.json(
      { success: false, error: "Failed to check payment status." },
      { status: 500 }
    );
  }
}