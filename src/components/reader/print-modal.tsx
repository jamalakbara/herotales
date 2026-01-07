"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Download, X, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/haptics";

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
}

export function PrintModal({ isOpen, onClose, storyId, storyTitle }: PrintModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [printUrl, setPrintUrl] = useState<string | null>(null);

  const handleGeneratePrintable = async () => {
    setIsGenerating(true);
    triggerHaptic("medium");

    try {
      const response = await fetch(`/api/stories/${storyId}/print`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to generate printable");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPrintUrl(url);
      triggerHaptic("success");
    } catch (error) {
      console.error("Print generation error:", error);
      triggerHaptic("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPrint = () => {
    if (!printUrl) return;
    triggerHaptic("light");

    // Open in new tab for printing
    const newWindow = window.open(printUrl, "_blank");
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
  };

  const handleDownload = () => {
    if (!printUrl) return;
    triggerHaptic("light");

    const link = document.createElement("a");
    link.href = printUrl;
    link.download = `${storyTitle.replace(/\s+/g, "-")}.pdf`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-periwinkle to-periwinkle-dark flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Print Your Story 📚
          </h2>

          <p className="text-muted-foreground text-center mb-6">
            Create a printable version of &quot;{storyTitle}&quot; that you can print at home!
          </p>

          {/* Content */}
          {!printUrl ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cream border border-sage/20">
                <h4 className="font-medium text-foreground mb-2">What you&apos;ll get:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✨ Beautiful PDF with all chapters</li>
                  <li>🎨 Print-ready format (A4)</li>
                  <li>📖 Includes moral/lesson page</li>
                </ul>
              </div>

              <Button
                onClick={handleGeneratePrintable}
                disabled={isGenerating}
                className="w-full btn-magic h-12 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Printer className="h-5 w-5 mr-2" />
                    Generate Printable
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sage/20 border border-sage/30 text-center">
                <p className="text-sage-dark font-medium">
                  ✅ Your story is ready to print!
                </p>
              </div>

              <Button
                onClick={handleOpenPrint}
                className="w-full btn-magic h-12 text-lg"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Now
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                className="w-full h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                💡 Tip: You can print this PDF at home or use a printing service like Shutterfly!
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
