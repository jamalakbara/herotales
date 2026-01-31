"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/reader/audio-visualizer";
import { MagneticContainer } from "@/components/reader/magnetic-container";
import { buttonVariants } from "@/lib/animation-variants";

interface AudioPlayerProps {
  storyId: string;
  chapterIndex: number;
  isVisible: boolean;
}

export function AudioPlayer({ storyId, chapterIndex, isVisible }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentAttempted, setCurrentAttempted] = useState(false);

  // Fetch or generate audio when chapter changes
  useEffect(() => {
    if (isVisible && !audioUrl) {
      fetchAudio();
    }
  }, [chapterIndex, isVisible]);

  // Stop audio when chapter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
    }
    setAudioUrl(null);
    setCurrentAttempted(false); // Reset attempt flag for new chapter
  }, [chapterIndex]);

  const fetchAudio = async () => {
    setIsLoading(true);
    setError(null);
    setCurrentAttempted(true); // Mark that we've attempted to load audio

    try {
      const response = await fetch(`/api/stories/${storyId}/narrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex }),
      });

      if (!response.ok) {
        // Get error details from response
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Audio generation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setDuration(data.duration || 0);
    } catch (err) {
      console.error("Audio fetch error:", err);
      // Only set error if it's not a cover page (chapter 0)
      // For now, silently fail to not disrupt the reading experience
      setError(null); // Changed from "Unable to load audio" to null for graceful degradation
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || duration;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Hide player if not visible or if loading failed (attempted but no audio)
  // Keep visible during initial load and while playing
  if (!isVisible || (!isLoading && !audioUrl && currentAttempted)) {
    return null;
  }

  return (
    <AnimatePresence>
      <MagneticContainer strength="subtle" distance={120}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: isPlaying ? [1, 1.05, 1] : 1,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            scale: isPlaying ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
            opacity: { duration: 0.3 },
            y: { duration: 0.3 },
          }}
          className="glass-premium flex items-center gap-3 p-3 rounded-2xl shadow-xl relative overflow-hidden"
        >
          {/* Animated gradient border (visible when playing) */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
            animate={{
              opacity: isPlaying ? 1 : 0,
              background: [
                "linear-gradient(45deg, rgba(147,112,219,0.3), rgba(255,127,80,0.3))",
                "linear-gradient(135deg, rgba(255,127,80,0.3), rgba(147,112,219,0.3))",
                "linear-gradient(225deg, rgba(147,112,219,0.3), rgba(255,127,80,0.3))",
                "linear-gradient(315deg, rgba(255,127,80,0.3), rgba(147,112,219,0.3))",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Audio element (hidden) */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
            />
          )}

          {/* Play/Pause Button */}
          <motion.div
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              size="icon"
              onClick={audioUrl ? togglePlay : fetchAudio}
              disabled={isLoading}
              className="h-12 w-12 rounded-full btn-magic shrink-0 relative z-10"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </motion.div>

          {/* Progress and Info */}
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-foreground flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                {isLoading ? "Generating..." : "Read to Me"}
              </span>
              {/* Spacer to maintain height if needed, or just empty */}
              <div />
            </div>

            {/* Progress Bar with Audio Visualizer */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-periwinkle to-coral rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Time Indicator - Moved here for better spacing */}
              {duration > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums shrink-0 translate-y-[1px]">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              )}

              {/* Audio Visualizer */}
              <AudioVisualizer isPlaying={isPlaying} barCount={5} />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-destructive relative z-10"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </MagneticContainer>
    </AnimatePresence>
  );
}
