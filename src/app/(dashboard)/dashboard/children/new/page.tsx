"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, User, Calendar, Palette, Users, Star, Wand2 } from "lucide-react";
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15
    }
  },
};

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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative min-h-[80vh] flex flex-col justify-center max-w-3xl mx-auto py-8"
    >
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-coral/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-periwinkle/15 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      <div className="absolute bottom-[-5%] left-[30%] w-[35%] h-[35%] bg-sage/10 rounded-full blur-[90px] -z-10 animate-pulse delay-300" />

      {/* Back Link */}
      <motion.div variants={item}>
        <Link
          href="/dashboard/children"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all group"
        >
          <span className="h-8 w-8 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="text-sm font-medium">Back to heroes</span>
        </Link>
      </motion.div>

      {/* Header Section */}
      <motion.div variants={item} className="mb-10">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 border border-white/40 backdrop-blur-xl text-sm font-medium text-muted-foreground mb-5 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-coral"></span>
          </span>
          <span>Creating New Hero Profile</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
          Birth a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral via-periwinkle to-coral bg-[length:200%_auto] animate-gradient">
            New Legend
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg">
          Every hero has an origin story. Let&apos;s create a profile that brings your child&apos;s adventures to life.
        </p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        variants={item}
        className="glass-card p-8 md:p-10 border-white/50 bg-gradient-to-br from-white/80 to-white/40 rounded-3xl relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute right-[-30px] top-[-30px] opacity-5 pointer-events-none">
          <Star size={180} strokeWidth={1} />
        </div>
        <div className="absolute left-[-20px] bottom-[-20px] opacity-5 pointer-events-none">
          <Wand2 size={140} strokeWidth={1} />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
            {/* Nickname */}
            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-foreground font-semibold text-base">
                      <span className="h-8 w-8 rounded-xl bg-periwinkle/10 flex items-center justify-center text-periwinkle">
                        <User className="h-4 w-4" />
                      </span>
                      Hero&apos;s Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Luna, Max, Buddy"
                        className="h-14 rounded-2xl bg-white/60 border-white/60 backdrop-blur-sm text-lg placeholder:text-muted-foreground/50 focus:border-periwinkle/50 focus:ring-periwinkle/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground/70">
                      This magical name will appear in every story
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Gender Selection */}
            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-foreground font-semibold text-base">
                      <span className="h-8 w-8 rounded-xl bg-sage/10 flex items-center justify-center text-sage-dark">
                        <Users className="h-4 w-4" />
                      </span>
                      Hero Type
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => field.onChange("boy")}
                          className={`relative h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-medium overflow-hidden group ${field.value === "boy"
                            ? "border-periwinkle bg-periwinkle/10 text-periwinkle shadow-lg shadow-periwinkle/10"
                            : "border-white/60 bg-white/40 text-muted-foreground hover:border-periwinkle/30 hover:bg-white/60"
                            }`}
                        >
                          <span className="text-3xl transform group-hover:scale-110 transition-transform">👦</span>
                          <span className="text-sm font-semibold">Young Knight</span>
                          {field.value === "boy" && (
                            <motion.div
                              layoutId="gender-select"
                              className="absolute inset-0 border-2 border-periwinkle rounded-2xl"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange("girl")}
                          className={`relative h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 font-medium overflow-hidden group ${field.value === "girl"
                            ? "border-coral bg-coral/10 text-coral shadow-lg shadow-coral/10"
                            : "border-white/60 bg-white/40 text-muted-foreground hover:border-coral/30 hover:bg-white/60"
                            }`}
                        >
                          <span className="text-3xl transform group-hover:scale-110 transition-transform">👧</span>
                          <span className="text-sm font-semibold">Young Princess</span>
                          {field.value === "girl" && (
                            <motion.div
                              layoutId="gender-select"
                              className="absolute inset-0 border-2 border-coral rounded-2xl"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-muted-foreground/70">
                      Helps create consistent character illustrations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Age Group */}
            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="age_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-foreground font-semibold text-base">
                      <span className="h-8 w-8 rounded-xl bg-coral/10 flex items-center justify-center text-coral">
                        <Calendar className="h-4 w-4" />
                      </span>
                      Age of Hero
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/60 border-white/60 backdrop-blur-sm text-lg focus:border-coral/50 focus:ring-coral/20">
                          <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                          <SelectItem key={age} value={String(age)} className="text-base py-3">
                            {age} years old {age <= 4 ? "🌱" : age <= 7 ? "🌿" : "🌳"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-muted-foreground/70">
                      Stories will be magically tailored to this age
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Character Builder */}
            <motion.div variants={item} className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground font-semibold text-base">
                <span className="h-8 w-8 rounded-xl bg-periwinkle/10 flex items-center justify-center text-periwinkle">
                  <Palette className="h-4 w-4" />
                </span>
                Character Appearance
              </Label>
              <div className="p-4 rounded-2xl bg-white/40 border border-white/60">
                <CharacterBuilder
                  value={characterDescription}
                  onChange={setCharacterDescription}
                />
              </div>
              <p className="text-sm text-muted-foreground/70">
                Paint a picture of your hero for stunning AI illustrations
              </p>
            </motion.div>

            {/* Submit */}
            <motion.div variants={item} className="pt-4">
              <Button
                type="submit"
                className="w-full h-16 rounded-2xl btn-magic text-lg relative overflow-hidden group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      Summon This Hero
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>

      {/* Privacy Note */}
      <motion.p
        variants={item}
        className="text-center text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2"
      >
        <span className="h-6 w-6 rounded-full bg-sage/10 flex items-center justify-center text-xs">🔒</span>
        We only store nicknames, never real names (COPPA compliant)
      </motion.p>
    </motion.div>
  );
}
