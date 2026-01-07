"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage: number;
  limit: number;
}

export function UpgradeModal({ isOpen, onClose, currentUsage, limit }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Checkout failed");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Crown Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Unlock Unlimited Stories! ✨
          </h2>

          <p className="text-muted-foreground text-center mb-6">
            You&apos;ve created {currentUsage} of {limit} free stories this month.
            Upgrade to create unlimited magical adventures!
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              "Unlimited story generation",
              "Priority AI processing",
              "Audio narration included",
              "Early access to new features",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-sage-dark" />
                </div>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Starting at</p>
            <p className="text-4xl font-bold text-foreground">
              $9<span className="text-lg font-normal text-muted-foreground">/month</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full btn-magic h-12 text-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
