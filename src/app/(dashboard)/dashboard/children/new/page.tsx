"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, User, Calendar, Palette, Users } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CharacterBuilder } from "@/components/dashboard/character-builder";

const childSchema = z.object({
  nickname: z
    .string()
    .min(1, "Please enter a nickname")
    .max(50, "Nickname is too long"),
  gender: z.enum(["boy", "girl"]),
  age_group: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().min(2, "Must be at least 2 years old").max(12, "Must be 12 or younger")
  ),
  character_description: z.string().optional(),
});

type ChildFormData = z.output<typeof childSchema>;

export default function NewChildPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [characterDescription, setCharacterDescription] = useState("");
  const supabase = createClient();

  const form = useForm<ChildFormData>({
    resolver: zodResolver(childSchema) as never,
    defaultValues: {
      nickname: "",
      gender: "boy",
      age_group: 5,
      character_description: "",
    },
  });

  const onSubmit = async (data: ChildFormData) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to continue");
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("children").insert({
        parent_id: user.id,
        nickname: data.nickname,
        gender: data.gender,
        age_group: data.age_group,
        character_description: characterDescription || data.character_description,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(`${data.nickname} has been added! 🎉`);
      router.push("/dashboard/children");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard/children"
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to children
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-periwinkle mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Add a New Hero</h1>
          <p className="text-muted-foreground mt-2">
            Create a profile for your child to personalize their stories
          </p>
        </div>

        {/* Form */}
        <Card className="glass-card border-0">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nickname */}
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground font-medium">
                        <User className="h-4 w-4" />
                        Nickname
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Luna, Max, Buddy"
                          className="h-12 rounded-xl bg-white/50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be the hero&apos;s name in every story
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender Selection */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground font-medium">
                        <Users className="h-4 w-4" />
                        Gender
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange("boy")}
                            className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${field.value === "boy"
                              ? "border-periwinkle bg-periwinkle/10 text-periwinkle"
                              : "border-muted bg-white/50 text-muted-foreground hover:border-periwinkle/50"
                              }`}
                          >
                            👦 Boy
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange("girl")}
                            className={`flex-1 h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-medium ${field.value === "girl"
                              ? "border-coral bg-coral/10 text-coral"
                              : "border-muted bg-white/50 text-muted-foreground hover:border-coral/50"
                              }`}
                          >
                            👧 Girl
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        This helps create consistent character illustrations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age Group */}
                <FormField
                  control={form.control}
                  name="age_group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-foreground font-medium">
                        <Calendar className="h-4 w-4" />
                        Age
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-white/50">
                            <SelectValue placeholder="Select age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                            <SelectItem key={age} value={String(age)}>
                              {age} years old
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Stories will be tailored to this age group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Character Builder */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-foreground font-medium">
                    <Palette className="h-4 w-4" />
                    Character Appearance
                  </Label>
                  <CharacterBuilder
                    value={characterDescription}
                    onChange={setCharacterDescription}
                  />
                  <p className="text-sm text-muted-foreground">
                    Describe how your child looks for consistent AI illustrations
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl btn-magic text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Add Hero
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Privacy Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          🔒 We only store nicknames, never real names (COPPA compliant)
        </p>
      </motion.div>
    </div>
  );
}
