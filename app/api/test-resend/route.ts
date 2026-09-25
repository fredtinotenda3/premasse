// app/api/test-resend/route.ts
// Admin-only diagnostic endpoint — sends a test email to confirm Resend is
// configured correctly. Not for customer-facing use.
//
// SECURITY: this used to be a public, unauthenticated GET route that sent an
// email to a hard-coded personal Gmail address on every request — anyone
// with the URL could trigger sends against the account's Resend quota, and
// the address was a hard-coded personal email rather than configuration.
// It now requires ADMIN auth (matching every other internal/admin route in
// this app) and defaults to EMAIL_ADMIN, with an optional ?to= override for
// an admin who wants to test delivery to a different inbox.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? "Premasse <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: "RESEND_API_KEY is not set" 
    }, { status: 500 });
  }

  const requestedTo = req.nextUrl.searchParams.get("to");
  const to = requestedTo ?? process.env.EMAIL_ADMIN ?? "admin@premasse.co.zw";

  const emailCheck = z.string().email().safeParse(to);
  if (!emailCheck.success) {
    return NextResponse.json(
      { success: false, error: "Invalid 'to' address." },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);
  const testEmail = emailCheck.data;
  
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: "📧 TEST: Premasse Email Configuration",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px;">
          <h1 style="color: #1B5E20;">✅ Resend is working!</h1>
          <p>This test email confirms your API key is configured correctly.</p>
          
          <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>📧 If you can't see this email:</strong><br>
            1. Check your <strong>Spam/Junk folder</strong><br>
            2. Mark this email as "Not Spam"<br>
            3. Add <strong>noreply@resend.dev</strong> to your contacts
          </div>
          
          <p style="color: #666; font-size: 12px;">Sent from: ${fromEmail}</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Premasse Business Services</p>
        </div>
      `,
    });
    
    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Test email sent! Check your inbox AND spam folder.",
      from: fromEmail,
      to: testEmail,
      data 
    });
    
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: String(err) 
    }, { status: 500 });
  }
}