"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Calendar, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: {
    status: string;
    isPro: boolean;
    subscriptionId?: string | null;
    usageCount: number;
    usageLimit: number;
    endDate?: string | null;
  } | null;
  onCancelled?: () => void;
}

export function SubscriptionManageModal({
  isOpen,
  onClose,
  subscription,
  onCancelled,
}: SubscriptionModalProps) {
  const [showCancelInfo, setShowCancelInfo] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen || !subscription) return null;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled. You'll have access until the end of your billing period.");
      onCancelled?.();
      onClose();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-coral/20">
              <Crown className="h-6 w-6 text-coral" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Manage Subscription</h2>
              <p className="text-sm text-muted-foreground">Your Pro Plan details</p>
            </div>
          </div>

          {/* Plan Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-sage/10 border border-sage/20">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-sage-dark" />
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">Unlimited stories</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === "cancelled"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-sage/20 text-sage-dark"
                }`}>
                {subscription.status === "cancelled" ? "Cancelled" : "Active"}
              </span>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {subscription.status === "cancelled" ? "Access ends" : "Renews on"}
                </p>
                <p className="font-medium">{formatDate(subscription.endDate)}</p>
              </div>
            </div>

            {subscription.subscriptionId && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Subscription ID</p>
                  <p className="font-mono text-sm">{subscription.subscriptionId.slice(0, 20)}...</p>
                </div>
              </div>
            )}
          </div>

          {/* Cancel Section - only show if not already cancelled */}
          {subscription.status !== "cancelled" && (
            !showCancelInfo ? (
              <Button
                variant="ghost"
                onClick={() => setShowCancelInfo(true)}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                Cancel subscription
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <div className="flex gap-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Cancel your subscription?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your access will continue until {formatDate(subscription.endDate)}.
                      After that, you&apos;ll be on the free plan with 3 stories/month.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelInfo(false)}
                    className="flex-1"
                    disabled={isCancelling}
                  >
                    Keep Plan
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSubscription}
                    className="flex-1"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </div>
              </motion.div>
            )
          )}

          {/* Show message if cancelled */}
          {subscription.status === "cancelled" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <p className="text-sm text-amber-700">
                Your subscription is cancelled. You&apos;ll have access until {formatDate(subscription.endDate)}.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
