import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySignature, mapTransactionStatus } from "@/lib/midtrans/server";

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MidtransNotification {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  custom_field1?: string; // userId stored here
}

export async function POST(request: NextRequest) {
  let payload: MidtransNotification;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  console.log("Midtrans webhook received:", payload.transaction_status, payload.order_id);

  // Verify signature
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const isValid = verifySignature(
    payload.order_id,
    payload.status_code,
    payload.gross_amount,
    serverKey,
    payload.signature_key
  );

  if (!isValid) {
    console.error("Invalid signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  try {
    // Find user by order ID (subscription_id)
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("subscription_id", payload.order_id);

    if (!profiles || profiles.length === 0) {
      console.error("No user found for order:", payload.order_id);
      return NextResponse.json({ received: true });
    }

    const userId = profiles[0].id;
    const status = payload.transaction_status;

    // Calculate subscription end date (30 days)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    if (status === "capture" || status === "settlement") {
      // Payment successful
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_end_date: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    } else if (status === "deny" || status === "cancel" || status === "expire" || status === "failure") {
      // Payment failed
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
    // For "pending" status, we keep the existing pending status

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
