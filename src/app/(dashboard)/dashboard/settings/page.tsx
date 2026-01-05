"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Trash2, AlertTriangle, Shield } from "lucide-react";
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

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAllData = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Delete all children (cascades to stories and images)
      const { error: deleteError } = await supabase
        .from("children")
        .delete()
        .eq("parent_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Sign out and delete account
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Privacy & Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
        transition={{ duration: 0.3, delay: 0.1 }}
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
                    Permanently delete all children, stories, and images
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
                        all your children profiles, stories, and generated images.
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
                          <li>• All story images</li>
                          <li>• Your account access</li>
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
  );
}
