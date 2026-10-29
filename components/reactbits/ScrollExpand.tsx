'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScrollExpandProps {
  videoSrc: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ScrollExpand({
  videoSrc,
  poster,
  title = 'CINEMATIC MASTER CUT',
  subtitle = 'SCROLL TO EXPAND · 9:16 NATIVE',
  className = ''
}: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center']
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ['24px', '4px']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [0.5, 0.2, 0]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full py-16 flex flex-col items-center justify-center overflow-hidden', className)}
    >
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Scroll expand header hint */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-accent uppercase mb-4">
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          <span>{subtitle}</span>
        </div>

        {/* Dynamic Expanding Video Card */}
        <motion.div
          style={{
            scale,
            borderRadius
          }}
          className="relative w-full max-w-[380px] aspect-[9/16] bg-black border border-white/15 overflow-hidden shadow-2xl shadow-black/90 group cursor-pointer"
          onClick={togglePlay}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            playsInline
            loop
            muted={isMuted}
            className="w-full h-full object-contain bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Dynamic Scroll Shading Overlay */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-black pointer-events-none"
          />

          {/* Viewfinder Overlays */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between text-[10px] font-mono text-white/80 pointer-events-none z-10">
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/40'}`} />
              {isPlaying ? 'LIVE STREAM' : 'PAUSED'}
            </span>
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-accent font-bold">
              9:16
            </span>
          </div>

          {/* Play/Pause Button on Hover / Paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition duration-200">
              <div className="w-16 h-16 rounded-full bg-accent text-black flex items-center justify-center shadow-2xl shadow-accent/40 transform group-hover:scale-110 transition-transform">
                <Play fill="currentColor" className="w-7 h-7 ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Bar Controls */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/70 backdrop-blur-md p-2.5 rounded border border-white/10 text-white text-xs font-mono z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-1 hover:text-accent transition"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-1 hover:text-accent transition"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-[10px] text-white/70">{title}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
