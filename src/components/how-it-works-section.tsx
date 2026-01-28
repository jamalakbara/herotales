"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: 1,
    title: "Add Your Child's Profile",
    description:
      "Enter their nickname, age, and describe their appearance for consistent illustrations.",
  },
  {
    step: 2,
    title: "Choose Today's Lesson",
    description:
      "Pick from 5 value blueprints: Bravery, Honesty, Patience, Kindness, or Persistence.",
  },
  {
    step: 3,
    title: "Watch the Magic Happen",
    description:
      "Our AI creates a unique 5-chapter story with beautiful illustrations in minutes.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-32 px-4 bg-white/50 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Create a Story in{" "}
            <span className="text-gradient">3 Simple Steps</span>
          </h2>
        </motion.div>

        <div className="space-y-12 relative">
          {/* Connector Line */}
          <div className="absolute left-[22px] top-6 bottom-6 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent hidden sm:block opacity-30"></div>

          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col sm:flex-row items-start gap-6 relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="shrink-0 w-12 h-12 rounded-full gradient-periwinkle flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white"
              >
                {item.step}
              </motion.div>
              <div className="glass p-6 rounded-2xl w-full hover:bg-white/40 transition-colors">
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
