import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

/**
 * Client-side Stripe instance (for redirecting to checkout)
 */
export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionUrl: string): Promise<void> {
  window.location.href = sessionUrl;
}

/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToPortal(portalUrl: string): Promise<void> {
  window.location.href = portalUrl;
}
