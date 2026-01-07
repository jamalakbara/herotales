"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Trash2, AlertTriangle, Shield, Crown, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionManageModal } from "@/components/dashboard/subscription-modal";

// Check if subscriptions are enabled (client-side)
const isSubscriptionEnabled = process.env.NEXT_PUBLIC_APP_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { subscription, isLoading: subLoading, openCheckout, refetch } = useSubscription();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const handleDeleteAllData = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE_ALL_DATA" }),
      });

      if (!response.ok) {
        throw new Error("Deletion failed");
      }

      // Sign out after deletion
      await supabase.auth.signOut();

      toast.success("All your data has been deleted");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-coral/20">
                  <Crown className="h-5 w-5 text-coral" />
                </div>
                <div>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Manage your plan and billing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {subLoading ? "Loading..." : subscription?.isPro ? "Pro Plan" : "Free Plan"}
                    </p>
                    {subscription?.status === "cancelled" && subscription?.isPro && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        Cancelled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription?.isPro
                      ? subscription?.status === "cancelled"
                        ? `Access until ${subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A"}`
                        : "Unlimited story generation"
                      : `${subscription?.usageCount || 0} of ${subscription?.usageLimit || 3} stories this month`
                    }
                  </p>
                </div>
                {subscription?.isPro ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsSubModalOpen(true)}
                    className="rounded-xl"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                ) : isSubscriptionEnabled ? (
                  <Button
                    onClick={openCheckout}
                    className="rounded-xl btn-magic"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="rounded-xl opacity-70"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sage/20">
                  <Shield className="h-5 w-5 text-sage-dark" />
                </div>
                <div>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Your data is protected with COPPA-compliant practices
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-sage/10 border border-sage/20">
                <h4 className="font-medium text-sage-dark mb-2">
                  🔒 Data Protection
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• We never store real names or sensitive child data</li>
                  <li>• All stories are encrypted at rest</li>
                  <li>• Images are stored securely in Supabase Storage</li>
                  <li>• You can delete all data at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions that affect your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-background border border-destructive/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-medium">Delete All My Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all children, stories, images, and audio
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="rounded-xl shrink-0"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete All Data
                        </DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete
                          all your children profiles, stories, images, and audio.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                          <p className="text-sm font-medium text-destructive">
                            You are about to delete:
                          </p>
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            <li>• All children profiles</li>
                            <li>• All generated stories</li>
                            <li>• All story images and audio</li>
                            <li>• Your usage history</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm">
                            Type <strong>DELETE</strong> to confirm
                          </Label>
                          <Input
                            id="confirm"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="rounded-xl"
                            placeholder="Type DELETE here"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAllData}
                          disabled={isDeleting || deleteConfirmation !== "DELETE"}
                          className="rounded-xl"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete Everything
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Subscription Management Modal */}
      <SubscriptionManageModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        subscription={subscription}
        onCancelled={() => refetch()}
      />
    </>
  );
}
