"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CallToActionSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background radial soft light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-96 bg-accent/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">
            Ready to Create Your First Story?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of parents who are making bedtime magical with personalized AI adventures.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/signup">
              <Button className="btn-magic h-16 px-12 text-xl rounded-2xl shadow-xl shadow-accent/20">
                <Sparkles className="mr-2 h-6 w-6 animate-pulse" />
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
