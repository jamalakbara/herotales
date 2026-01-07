"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface SubscriptionInfo {
  status: string;
  isActive: boolean;
  isPro: boolean;
  usageCount: number;
  usageLimit: number;
  canGenerate: boolean;
  subscriptionId: string | null;
  endDate: string | null;
}

const FREE_TIER_LIMIT = 3;

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      // Get profile with subscription status
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, subscription_id, subscription_end_date")
        .eq("id", user.id)
        .single();

      // Get current month's usage
      const currentMonth = new Date().toISOString().slice(0, 7); // '2026-01'
      const { data: usage } = await supabase
        .from("usage_stats")
        .select("story_count")
        .eq("user_id", user.id)
        .eq("month_year", currentMonth)
        .single();

      const status = profile?.subscription_status || "free";
      const endDate = profile?.subscription_end_date || null;

      // Check if subscription is still valid (active, trialing, or cancelled but not expired)
      const isEndDateValid = endDate ? new Date(endDate) > new Date() : false;
      const isActive = status === "active" || status === "trialing";
      const isCancelledButValid = status === "cancelled" && isEndDateValid;
      const hasProAccess = isActive || isCancelledButValid;

      const usageCount = usage?.story_count || 0;

      setSubscription({
        status,
        isActive: hasProAccess,
        isPro: hasProAccess,
        usageCount,
        usageLimit: hasProAccess ? Infinity : FREE_TIER_LIMIT,
        canGenerate: hasProAccess || usageCount < FREE_TIER_LIMIT,
        subscriptionId: profile?.subscription_id || null,
        endDate: endDate,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setSubscription({
        status: "free",
        isActive: false,
        isPro: false,
        usageCount: 0,
        usageLimit: FREE_TIER_LIMIT,
        canGenerate: true,
        subscriptionId: null,
        endDate: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const openCheckout = async () => {
    try {
      const response = await fetch("/api/midtrans/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Checkout failed");

      const { token, redirectUrl } = await response.json();

      // If Snap.js is loaded, use popup; otherwise redirect
      if (typeof window !== "undefined" && (window as unknown as { snap?: { pay: (token: string) => void } }).snap) {
        (window as unknown as { snap: { pay: (token: string) => void } }).snap.pay(token);
      } else {
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      throw error;
    }
  };

  // Midtrans doesn't have a built-in portal, redirect to settings
  const openPortal = async () => {
    window.location.href = "/dashboard/settings";
  };

  return {
    subscription,
    isLoading,
    refetch: fetchSubscription,
    openCheckout,
    openPortal,
  };
}
