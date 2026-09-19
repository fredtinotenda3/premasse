
// app/api/test-paynow/route.ts
import { NextResponse } from "next/server";
import { createPaynowClient, getPaynowMerchantAuthEmail } from "@/lib/paynow";

export async function GET() {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;
  const merchantEmail = process.env.PAYNOW_MERCHANT_EMAIL;

  console.log("=== Testing Paynow Configuration ===");
  console.log("Integration ID present:", !!integrationId);
  console.log("Integration ID value:", integrationId);
  console.log("Integration Key present:", !!integrationKey);
  console.log("Merchant auth email present:", !!merchantEmail);

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
      integrationId: integrationId.substring(0, 10) + "...",
      merchantAuthEmailConfigured: true,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}