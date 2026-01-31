"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Debug: Log Supabase configuration on mount
  useEffect(() => {
    console.log("Supabase client initialized");
    console.log("Current origin:", window.location.origin);
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);

    try {
      // Log configuration for debugging
      console.log("Attempting password reset for:", data.email);
      console.log("Redirect URL:", `${window.location.origin}/auth/callback?next=/update-password`);

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        console.error("Supabase error:", error);
        toast.error(error.message);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error(`Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Link>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-sage mb-4"
          >
            <span className="text-3xl">{isSuccess ? "✅" : "🔑"}</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">
            {isSuccess ? "Check Your Email" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSuccess
              ? "We've sent you a password reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {/* Form or Success State */}
        <div className="glass-card">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle className="h-16 w-16 text-sage mx-auto mb-4" />
              <p className="text-foreground mb-2">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="font-medium text-primary mb-6">
                {form.getValues("email")}
              </p>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>
            </motion.div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="parent@example.com"
                            className="pl-10 h-12 rounded-xl bg-white/50 border-border/50 focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
