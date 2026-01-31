"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Sparkles, User, BookOpen, Wand2 } from "lucide-react";

// Theme configuration for each step
const steps = [
  {
    step: 1,
    title: "Add Your Child's Profile",
    description:
      "Enter their nickname, age, and describe their appearance. Our AI ensures the illustrations look just like them in every story.",
    icon: User,
    color: "#6A89CC", // Periwinkle
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    accent: "text-blue-500",
    shadow: "shadow-blue-200/20",
    gradient: "from-blue-100/20 to-indigo-100/20"
  },
  {
    step: 2,
    title: "Choose Today's Lesson",
    description:
      "Pick from 5 value blueprints: Bravery, Honesty, Patience, Kindness, or Persistence. We weave these values seamlessly into the adventure.",
    icon: BookOpen,
    color: "#A1BE95", // Sage
    bg: "bg-green-50/50",
    border: "border-green-100",
    accent: "text-green-600",
    shadow: "shadow-green-200/20",
    gradient: "from-green-100/20 to-emerald-100/20"
  },
  {
    step: 3,
    title: "Watch the Magic Happen",
    description:
      "In seconds, our AI writes a unique 5-chapter story complete with cohesive, consistent, and beautiful illustrations.",
    icon: Wand2,
    color: "#F98866", // Coral
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    accent: "text-orange-500",
    shadow: "shadow-orange-200/20",
    gradient: "from-orange-100/20 to-red-100/20"
  },
];

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative z-20 -mt-[100vh] pt-40 pb-32 px-4 bg-gradient-to-b from-[#F7F3ED] to-[#E8F5E9] rounded-t-[4rem] md:rounded-t-[6rem] rounded-b-[4rem] md:rounded-b-[6rem] shadow-[0_-20px_60px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-periwinkle/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-coral/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-sage/20 text-sage-dark text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sage" />
            <span className="font-heading tracking-wide uppercase text-xs">Simple & Magical</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-heading text-slate-800">
            Create a Story in <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-periwinkle via-indigo-400 to-coral">3 Simple Steps</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            Turn your child's bedtime routine into an interactive adventure in just a few minutes.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">

          {/* The Story Thread (Connecting Line) */}
          <div className="absolute left-[28px] md:left-[3.5rem] top-8 bottom-32 w-0.5 bg-slate-200/60 hidden sm:block">
            <motion.div
              style={{ height: useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]) }}
              className="w-full bg-gradient-to-b from-periwinkle via-sage to-coral shadow-[0_0_10px_rgba(106,137,204,0.5)]"
            />
          </div>

          <div className="space-y-16 relative">
            {steps.map((item, index) => (
              <StepCard key={item.step} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ item, index }: { item: typeof steps[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="flex flex-col sm:flex-row items-start gap-8 relative z-10 group"
    >
      {/* Icon Circle */}
      <div className="shrink-0 relative">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`
             w-14 h-14 md:w-28 md:h-28 rounded-full 
             flex items-center justify-center 
             bg-white border-4 border-white shadow-xl 
             relative z-10
           `}
        >
          <div className={`
              absolute inset-0 rounded-full opacity-20 bg-gradient-to-tr ${item.gradient}
            `}></div>
          <item.icon className={`w-6 h-6 md:w-10 md:h-10 ${item.accent} transition-transform duration-500 group-hover:scale-110`} strokeWidth={1.5} />

          {/* Number Badge */}
          <div className={`
               absolute -top-1 -right-1 md:top-0 md:right-0
               w-6 h-6 md:w-8 md:h-8 rounded-full 
               bg-white border-2 border-white shadow-md
               flex items-center justify-center
               text-xs md:text-sm font-bold text-slate-600
            `}>
            {item.step}
          </div>
        </motion.div>
      </div>

      {/* Content Card */}
      <div className={`
         w-full p-8 rounded-[2.5rem] 
         bg-white/40 backdrop-blur-md 
         border border-white/60 
         shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]
         hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:bg-white/60
         transition-all duration-300 transform
         group-hover:-translate-y-1 group-hover:scale-[1.01]
         relative overflow-hidden
      `}>
        {/* Subtle internal gradient */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${item.gradient} pointer-events-none`}></div>

        <div className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800 font-heading">
            {item.title}
          </h3>
          <p className="text-slate-600 font-body text-lg leading-relaxed">
            {item.description}
          </p>

          {/* Action Hint (Optional) */}
          <div className={`mt-6 inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 ${item.accent}`}>
            Learn more <Sparkles className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
