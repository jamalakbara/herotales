"use client";

import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";

export default function SafetySection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card text-center relative overflow-hidden"
        >
          {/* Decorative sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sage mb-4 relative z-10 shadow-md"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            COPPA Compliant & Safe
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We take your child&apos;s privacy seriously. HeroTales is designed with
            safety as the foundation, ensuring fully compliant and secure experiences.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
            {[
              "Only nicknames, never real names",
              "You can delete all data anytime",
              "No data shared with third parties",
              "Parental gate for reader mode",
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/40 transition-colors"
              >
                <div className="bg-sage/10 p-1 rounded-full">
                  <Check className="h-4 w-4 text-sage shrink-0" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
