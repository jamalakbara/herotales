"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export default function HeroScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Total frames based on the file list (00001.jpg to 00192.jpg)
  const frameCount = 192;

  // Track scroll progress relative to the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress (0 to 1) to frame index (0 to frameCount - 1)
  const currentIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];

      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        // Construct filename with 5-digit padding: 00001.jpg
        const filename = i.toString().padStart(5, "0") + ".jpg";
        img.src = `/herosection/${filename}`;
        await new Promise((resolve) => {
          img.onload = resolve;
          // Continue even if error to avoid breaking everything
          img.onerror = resolve;
        });
        loadedImages.push(img);
      }

      setImages(loadedImages);
      setLoaded(true);
    };

    loadImages();
  }, []);

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || images.length === 0) return;

    // Ensure index is integer and within bounds
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.round(index))
    );

    const img = images[frameIndex];
    if (!img) return;

    // Use standard 16:9 aspect ratio or maintain window ratio?
    // Let's cover the screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // "object-fit: cover" logic for canvas
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  useEffect(() => {
    if (!loaded) return;

    // Update on scroll change
    const unsubscribe = currentIndex.on("change", (latest) => {
      renderFrame(latest);
    });

    // Initial render
    renderFrame(0);

    // Handle resize
    const handleResize = () => renderFrame(currentIndex.get());
    window.addEventListener("resize", handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [loaded, currentIndex, images]);

  return (
    <div ref={containerRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#FFF2D7]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Loading Indicator */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-periwinkle-dark bg-[#FFF2D7] z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-t-transparent border-periwinkle rounded-full animate-spin"></div>
              <p className="font-mono text-sm opacity-70">Loading Experience...</p>
            </div>
          </div>
        )}

        {/* Overlay Content - Fades out as you scroll down */}
        <motion.div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
        >
          {/* We will project content here from the parent page if needed, 
              or we can keep it clean and just have the video.
              For now, leaving empty to let parent handle overlays absolutely positioned 
              OR we can compose children here. 
          */}
        </motion.div>
      </div>
    </div>
  );
}
