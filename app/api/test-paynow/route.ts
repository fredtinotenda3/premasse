
// app/api/test-paynow/route.ts
// Admin-only diagnostic endpoint — confirms Paynow credentials are loaded
// and reports test/live mode. Not for customer-facing use.
//
// SECURITY: this was previously public and unauthenticated. It doesn't leak
// full secrets (the integration ID is masked, the key is never returned),
// but a public config/health endpoint is still unnecessary surface area, so
// it now requires ADMIN auth like every other internal route in this app.

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPaynowClient, getPaynowMerchantAuthEmail, isPaynowTestMode } from "@/lib/paynow";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  }

  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  const merchantEmail = process.env.PAYNOW_MERCHANT_EMAIL;

  console.log("=== Testing Paynow Configuration ===");
  console.log("Integration ID present:", !!integrationId);
  console.log("Integration ID length:", integrationId?.length);
  console.log("Integration Key present:", !!integrationKey);
  console.log("Merchant auth email present:", !!merchantEmail);
  console.log("Paynow test mode (PAYNOW_TEST_MODE):", isPaynowTestMode());

  if (!integrationId || !integrationKey) {
    return NextResponse.json({ 
      success: false, 
      error: "PAYNOW_INTEGRATION_ID and PAYNOW_INTEGRATION_KEY must be set" 
    }, { status: 500 });
  }

  if (!merchantEmail) {
    return NextResponse.json({
      success: false,
      error: "PAYNOW_MERCHANT_EMAIL must be set to the Paynow merchant account's registered/login email address."
    }, { status: 500 });
  }
  
  try {
    // Try to create a client
    const client = createPaynowClient("test-request-id");
    // Confirms the merchant authemail resolves (throws if missing/blank)
    getPaynowMerchantAuthEmail();
    
    return NextResponse.json({ 
      success: true, 
      message: "Paynow client created successfully",
      integrationId: integrationId.substring(0, 4) + "...",
      merchantAuthEmailConfigured: true,
      testMode: isPaynowTestMode(),
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}