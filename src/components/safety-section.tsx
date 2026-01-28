"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { Shield, Lock, Eye, UserMinus, XCircle } from "lucide-react";

const safetyFeatures = [
  {
    icon: UserMinus,
    title: "No Real Names",
    description: "We only use nicknames. Your child's real identity remains completely offline.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: XCircle,
    title: "Data Deletion",
    description: "You have total control. Delete your account and data permanently at any time.",
    color: "bg-red-50 text-red-600"
  },
  {
    icon: Lock,
    title: "Zero Sharing",
    description: "We never sell or share personal data with third parties or advertisers.",
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    icon: Eye,
    title: "Parental Gate",
    description: "Sensitive settings and payments are protected by a secure parental gate.",
    color: "bg-emerald-50 text-emerald-600"
  }
];

export default function SafetySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Parallax Reveal Logic (Existing) --
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 0.4], [-150, 0]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.3], [0.5, 1]);

  return (
    <section
      ref={containerRef}
      className="relative z-10 -mt-32 pt-48 pb-24 px-4"
    >
      <motion.div
        style={{ y: parallaxY, opacity: parallaxOpacity }}
        className="max-w-5xl mx-auto perspective-1000"
      >
        <TiltCard>
          {/* Header Content */}
          <div className="text-center mb-12 relative z-10">
            <div className="relative inline-block">
              {/* Pulse Animation Layers */}
              <motion.div
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-sage/30 rounded-full z-0"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1.5], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 bg-sage/40 rounded-full z-0"
              />

              <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-sage to-sage-dark flex items-center justify-center shadow-lg shadow-sage/30">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mt-6 mb-4 font-heading text-slate-800">
              Your Child's Safety is Our <span className="text-sage-dark">Priority</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-body text-lg leading-relaxed">
              HeroTales is a "safe harbor" in the digital world. We are fully COPPA compliant and designed from the ground up to protect your family's privacy.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {safetyFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/50 border border-white/60 hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md flex items-start gap-4"
              >
                <div className={`p-3 rounded-xl ${feature.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Background Mesh */}
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[radial-gradient(#A1BE95_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-[3rem]"></div>
        </TiltCard>
      </motion.div>
    </section>
  );
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const highlightX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const highlightY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 overflow-hidden"
    >
      {/* Dynamic Highlight Effect */}
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(
            600px circle at ${highlightX} ${highlightY}, 
            rgba(255, 255, 255, 0.4), 
            transparent 40%
          )`,
        }}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {children}
    </motion.div>
  );
}
