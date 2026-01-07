import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { constructWebhookEvent, getStripe } from "@/lib/stripe/server";
import Stripe from "stripe";

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  // Update profile with Stripe customer ID
  await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    // Try to get userId from metadata
    const userId = subscription.metadata?.userId;
    if (userId) {
      // Get period end from subscription object
      const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
      await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          stripe_customer_id: customerId,
          subscription_status: subscription.status,
          subscription_id: subscription.id,
          subscription_end_date: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        });
    }
    return;
  }

  // Get period end from subscription object
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

  // Update subscription status
  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      subscription_end_date: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID and reset to free
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "free",
        subscription_id: null,
        subscription_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
  }
}
