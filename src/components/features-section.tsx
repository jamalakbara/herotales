"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Palette, BookOpen, Heart, Sparkles } from "lucide-react";

const features = [
  {
    icon: Palette,
    color: "bg-[#6A89CC]", // Periwinkle Base
    gradient: "linear-gradient(135deg, #6A89CC 0%, #8BA3D9 100%)",
    title: "Personalized Characters",
    description:
      "Describe your child's appearance and watch them come to life in beautiful AI-generated illustrations. Every freckle, curl, and smile features your little one.",
    ctBg: "bg-blue-50",
  },
  {
    icon: BookOpen,
    color: "bg-[#A1BE95]", // Sage Base
    gradient: "linear-gradient(135deg, #A1BE95 0%, #B8CFAE 100%)",
    title: "5 Value Blueprints",
    description:
      "Choose from Bravery, Honesty, Patience, Kindness, or Persistence. We weave these values into exciting adventures that resonate with your child.",
    ctBg: "bg-green-50",
  },
  {
    icon: Heart,
    color: "bg-[#F98866]", // Coral Base
    gradient: "linear-gradient(135deg, #F98866 0%, #FAAB94 100%)",
    title: "Reader Mode Magic",
    description:
      "Distraction-free reading with beautiful page-flip animations, celebration effects, and a paper-textured background that feels like a real storybook.",
    ctBg: "bg-orange-50",
  },
];

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative bg-gradient-to-b from-[#F7F3ED] to-[#FFF2D7]">
      {/* 
        Container Height: 
        We need enough scroll space. 
        For 3 cards, let's say we want each to take up roughly a screen height of scrolling.
      */}
      <div className="h-[500vh] relative">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

          {/* Section Header - Transitioning into depth */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.12], [1, 0]),
              scale: useTransform(scrollYProgress, [0, 0.12], [1, 0.95]),
              filter: useTransform(scrollYProgress, [0, 0.12], ["blur(0px)", "blur(8px)"]),
              y: useTransform(scrollYProgress, [0, 0.12], [0, -40])
            }}
            className="absolute top-12 w-full text-center z-0 px-4 pointer-events-none"
          >
            {/* Decorative background glow for header */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-100/30 to-purple-100/30 blur-3xl rounded-full"></div>

            <div className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-[#6A89CC]/30 shadow-lg shadow-purple-900/5 mb-8 transform transition-transform duration-300">
              <Sparkles className="h-4 w-4 text-[#6A89CC]" />
              <span className="font-heading text-sm font-semibold tracking-wide text-[#4A6DB3]">The Magic Inside</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight text-slate-900 drop-shadow-sm">
              Stories That Spark <br />
              <span className="relative inline-block mt-2">
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-400 to-accent blur-2xl opacity-40"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">
                  Imagination
                </span>
              </span>
            </h2>

            <p className="max-w-xl mx-auto text-lg text-slate-600/90 font-medium leading-relaxed">
              Discover why thousands of parents trust HeroTales for their bedtime routine.
            </p>
          </motion.div>

          {/* Cards Container */}
          <div className="w-full max-w-5xl px-4 md:px-8 relative h-[60vh] md:h-[500px] flex flex-col items-center justify-center">
            {features.map((feature, index) => {
              // ANIMATION TIMING FIX:
              // The next section ("How It Works") overlaps by sliding up -100vh.
              // To prevent it from covering cards before they finish, we must finish ALL card animations
              // well before the end of this section's scroll.

              // Total Height: 500vh
              // Overlap Start (Visual): ~400vh mark
              // Safe Zone: Finish by 0.75 (375vh)

              const ANIMATION_END_POINT = 0.75;
              const rangeStep = ANIMATION_END_POINT / features.length;
              const start = index * rangeStep;
              const end = start + rangeStep;

              // targetScale: Previous cards scale down slightly as new ones come in
              const targetScale = 1 - (features.length - 1 - index) * 0.05;

              return (
                <Card
                  key={index}
                  i={index}
                  feature={feature}
                  progress={scrollYProgress}
                  range={[start, end]}
                  targetScale={targetScale}
                  total={features.length}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const Card = ({
  i,
  feature,
  progress,
  range,
  targetScale,
  total,
}: {
  i: number;
  feature: typeof features[0];
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  total: number;
}) => {


  // Transform logic
  // As scroll progresses through 'range', scale moves from 1 to targetScale (if it's not the active one)
  // Actually, standard stacking effect usually behaves like:
  // Item sticks, next item slides over it. 

  // Let's use a simpler logic for stacking:
  // Each card is absolutely positioned in the stack.
  // Its 'y' value comes from the bottom up to 0.

  // Custom transform for entrance
  // Logic: 
  // 1. Initial state: Offscreen bottom (or further down in stack)
  // 2. Active state: "top: 0" absolute position, but we use transformY

  // We need to map the GLOBAL scroll progress to THIS card's entry.
  // Card enters when progress is effectively at its start range.

  // Let's refine:
  // Card 1: Always visible initially? Or slides up?
  // Let's make Card 1 slide up too for consistency, or start static.
  // Let's try: All cards start `translateY(100vh)` and slide to 0 based on progress.

  // Map progress [range.start, range.end] -> translateY [1000px, 0px]
  // Ideally, card comes in from bottom.

  // To simulate "stacking", the card reaching 0 stays at 0.
  // But subsequent cards cover it.

  // Adjust range for slightly overlapping entrance
  const cardStart = range[0]; // e.g. 0, 0.33, 0.66

  // "y" movement:
  // When progress < cardStart, y is large (offscreen).
  // When progress > cardStart, y reduces to 0 rapidly.
  // Actually, we can use `useTransform` on the global `progress`.

  // We want the card to arrive at its position at `cardStart` + small buffer?
  // No, let's map it simply:
  // The 'sticky' container means we are just animating visual props.

  // Entrance animation
  const y = useTransform(
    progress,
    [range[0], range[0] + 0.2], // It enters relatively quickly
    ["100vh", "0vh"]
  );

  // Scale animation for depth: Card scales down as *subsequent* cards enter
  // It starts scaling down when the NEXT card starts entering.
  const nextCardStart = range[1];
  const scale = useTransform(
    progress,
    [nextCardStart - 0.1, 1], // Start scaling slightly before next card finish
    [1, 0.9] // Scale down to 0.9
  );

  // Opacity fade as it goes way back? Optional.

  // Calculations for static separation if we want a "deck" look 
  // (Card 1 is top, Card 2 is slightly lower top)
  // Let's just stack them perfectly on top (y=0) but use scale for depth.

  // Ensure the first card is visible from the start if i===0?
  // If i===0, we might want it static or just entering very fast.
  const isFirst = i === 0;

  return (
    <div
      className="absolute top-0 w-full h-full flex items-center justify-center p-4"
      style={{
        // Z-Index ensures stacking order
        zIndex: i
      }}
    >
      <motion.div
        style={{
          y: y,
          scale: scale,
          top: `calc(${i} * 20px)`, // Slight vertical offset for distinct "stack" feel
        }}
        className="relative w-full h-full max-h-[500px] max-w-4xl"
      >
        <div className={`
            w-full h-full rounded-[2rem] border border-white/40 shadow-2xl overflow-hidden
            flex flex-col md:flex-row
            ${feature.ctBg} backdrop-blur-3xl bg-opacity-80
        `}>
          {/* Visual Side */}
          <div className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden flex items-center justify-center">
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: feature.gradient }}
            ></div>

            <div className="relative z-10 p-8 glass-card rounded-[2rem] bg-white/30 border-white/50 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
              <feature.icon className="w-20 h-20 text-white drop-shadow-md" />
            </div>

            {/* Decorative Blobs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-left bg-white/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: feature.gradient }}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-foreground">
              {feature.title}
            </h3>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              {feature.description}
            </p>

            <div className="mt-8 pt-6 border-t border-black/5">
              <div className="text-sm font-semibold tracking-wider uppercase text-foreground/50 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                HeroTales Feature
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
