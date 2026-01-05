"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function generateMathProblem() {
  const a = Math.floor(Math.random() * 10) + 5;
  const b = Math.floor(Math.random() * 10) + 5;
  return { a, b, answer: a + b };
}

export function ParentalGate({ onSuccess, onCancel }: ParentalGateProps) {
  const [problem, setProblem] = useState(() => generateMathProblem());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  // Hold button alternative
  const handleHoldStart = useCallback(() => {
    setIsHolding(true);
  }, []);

  const handleHoldEnd = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress((p) => {
          if (p >= 100) {
            onSuccess();
            return 100;
          }
          return p + 3.33; // 3 seconds to complete
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isHolding, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer) === problem.answer) {
      onSuccess();
    } else {
      setError(true);
      setUserAnswer("");
      setProblem(generateMathProblem());
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold">Parental Gate</h2>
          <p className="text-muted-foreground mt-2">
            Please solve this to exit Reader Mode
          </p>
        </div>

        {/* Math Problem */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold mb-4">
              {problem.a} + {problem.b} = ?
            </p>
            <motion.input
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={`
                w-24 h-16 text-center text-3xl font-bold rounded-xl border-2
                ${error ? "border-destructive" : "border-primary/30"}
                focus:border-primary focus:outline-none
              `}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl">
            Submit
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Hold Button Alternative */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Hold the button for 3 seconds
          </p>
          <Button
            variant="outline"
            className="relative w-full h-14 rounded-xl overflow-hidden"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
          >
            <motion.div
              className="absolute inset-0 bg-primary/20"
              initial={{ width: 0 }}
              animate={{ width: `${holdProgress}%` }}
            />
            <span className="relative z-10">
              {holdProgress > 0 ? `Hold... ${Math.round(holdProgress)}%` : "Hold to Exit"}
            </span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
