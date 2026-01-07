import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSnapTransaction } from "@/lib/midtrans/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Generate unique order ID
    const orderId = `HERO-${user.id.slice(0, 8)}-${Date.now()}`;

    // Create Snap transaction
    const result = await createSnapTransaction({
      orderId,
      amount: 99000, // IDR 99,000/month
      customerEmail: user.email!,
      customerName: user.email!.split("@")[0],
      userId: user.id,
    });

    // Store order ID for tracking
    await supabase
      .from("profiles")
      .update({
        subscription_id: orderId,
        subscription_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      token: result.token,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error("Midtrans checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
