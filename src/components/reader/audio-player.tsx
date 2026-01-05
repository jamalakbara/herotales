"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Loader2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  }, [chapterIndex]);

  const fetchAudio = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}/narrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIndex }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      setDuration(data.duration || 0);
    } catch (err) {
      console.error("Audio fetch error:", err);
      setError("Unable to load audio");
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

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="flex items-center gap-3 p-3 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-white/50"
      >
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
        <Button
          size="icon"
          onClick={audioUrl ? togglePlay : fetchAudio}
          disabled={isLoading}
          className="h-12 w-12 rounded-full btn-magic shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Progress and Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              {isLoading ? "Generating..." : "Read to Me"}
            </span>
            {duration > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-periwinkle to-coral"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-xs text-destructive">
            {error}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
