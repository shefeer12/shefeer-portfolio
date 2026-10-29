'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Project } from '@/lib/projects';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CinematicHeroBackgroundProps {
  projects: Project[];
  isMuted: boolean;
  onActiveProjectChange?: (project: Project, index: number) => void;
  onAudioError?: () => void;
  className?: string;
}

/**
 * CinematicHeroBackground
 * 
 * High-performance, dual-buffer video crossfade background.
 * Uses two video elements (Slot A & Slot B) to deliver seamless, zero-flash transitions
 * between curated showcase cuts without decoding stalls or simultaneous audio conflicts.
 */
export default function CinematicHeroBackground({
  projects,
  isMuted,
  onActiveProjectChange,
  onAudioError,
  className,
}: CinematicHeroBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  // Guard against empty array
  const safeProjects = projects && projects.length > 0 ? projects : [];

  // Active buffer slot: 'A' or 'B'
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  // Indices into safeProjects
  const [indexA, setIndexA] = useState<number>(0);
  const [indexB, setIndexB] = useState<number>(safeProjects.length > 1 ? 1 : 0);

  // Crossfade state
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(false);

  // Video element refs
  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  // Lock to prevent concurrent transition triggers
  const transitionLockRef = useRef<boolean>(false);
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active project index
  const activeIndex = activeSlot === 'A' ? indexA : indexB;
  const activeProject = safeProjects[activeIndex] || safeProjects[0];

  // Notify parent of initial and subsequent active project
  useEffect(() => {
    if (activeProject && onActiveProjectChange) {
      onActiveProjectChange(activeProject, activeIndex);
    }
  }, [activeIndex, activeProject, onActiveProjectChange]);

  // Audio synchronization with master isMuted prop
  useEffect(() => {
    const activeVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;
    const standbyVideo = activeSlot === 'A' ? videoRefB.current : videoRefA.current;

    // Standby video must ALWAYS stay completely silent
    if (standbyVideo) {
      standbyVideo.muted = true;
      standbyVideo.volume = 0;
    }

    if (!activeVideo) return;

    if (isMuted) {
      activeVideo.muted = true;
      activeVideo.volume = 0;
    } else {
      activeVideo.muted = false;
      activeVideo.volume = 0.8;
      const playPromise = activeVideo.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('Autoplay with audio blocked by browser:', err);
          if (onAudioError) onAudioError();
        });
      }
    }
  }, [isMuted, activeSlot, onAudioError]);

  /**
   * Transition to the next clip in rotation sequence
   */
  const transitionToNext = useCallback(() => {
    if (transitionLockRef.current || safeProjects.length <= 1) return;
    transitionLockRef.current = true;
    setIsCrossfading(true);

    const nextSlot = activeSlot === 'A' ? 'B' : 'A';
    const nextVideo = nextSlot === 'A' ? videoRefA.current : videoRefB.current;
    const currentVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;

    if (nextVideo) {
      // Configure audio before playback handover
      nextVideo.muted = isMuted;
      nextVideo.volume = isMuted ? 0 : 0.8;
      nextVideo.currentTime = 0;

      const playPromise = nextVideo.play();
      if (playPromise) {
        playPromise.catch((err) => {
          console.warn('Hero video play error on transition:', err);
        });
      }
    }

    // Switch active slot to trigger CSS opacity crossfade
    setActiveSlot(nextSlot);

    // Crossfade duration: 800ms (or 0ms if prefersReducedMotion)
    const fadeDuration = prefersReducedMotion ? 50 : 800;

    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
    }

    crossfadeTimerRef.current = setTimeout(() => {
      // Pause and mute the old video once fully hidden
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.muted = true;
        currentVideo.currentTime = 0;
      }

      // Cue up the next clip in the rotation sequence for the standby slot
      if (activeSlot === 'A') {
        // We just switched to B (playing indexB). Prepare A with (indexB + 1)
        const nextIndexA = (indexB + 1) % safeProjects.length;
        setIndexA(nextIndexA);
      } else {
        // We just switched to A (playing indexA). Prepare B with (indexA + 1)
        const nextIndexB = (indexA + 1) % safeProjects.length;
        setIndexB(nextIndexB);
      }

      setIsCrossfading(false);
      transitionLockRef.current = false;
    }, fadeDuration);
  }, [activeSlot, indexA, indexB, isMuted, prefersReducedMotion, safeProjects.length]);

  // Initial playback start
  useEffect(() => {
    const videoA = videoRefA.current;
    if (videoA) {
      videoA.muted = true;
      videoA.volume = 0;
      const playPromise = videoA.play();
      if (playPromise) {
        playPromise
          .then(() => setHasStartedPlaying(true))
          .catch((err) => {
            console.warn('Initial hero autoplay notice:', err);
            // Even if browser restricts autoplay, fallback to user interaction or retry
          });
      }
    }

    return () => {
      if (crossfadeTimerRef.current) {
        clearTimeout(crossfadeTimerRef.current);
      }
    };
  }, []);

  // Handle tab visibility changes to resume playback seamlessly
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const activeVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;
        if (activeVideo && activeVideo.paused) {
          activeVideo.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeSlot]);

  // Error recovery: If a video fails to decode/load, skip to the next
  const handleVideoError = (slot: 'A' | 'B') => {
    console.warn(`Video load error in slot ${slot}. Skipping to next clip.`);
    if (slot === activeSlot) {
      transitionToNext();
    } else {
      // Standby failed: advance standby slot index
      if (slot === 'A') {
        setIndexA((prev) => (prev + 1) % safeProjects.length);
      } else {
        setIndexB((prev) => (prev + 1) % safeProjects.length);
      }
    }
  };

  // Monitor playback progress to initiate smooth crossfade before abrupt end
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration || Number.isNaN(video.duration)) return;

    // Trigger crossfade 0.6 seconds before clip ends for seamless blend
    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.6 && !transitionLockRef.current && safeProjects.length > 1) {
      transitionToNext();
    }
  };

  const projectA = safeProjects[indexA] || safeProjects[0];
  const projectB = safeProjects[indexB] || safeProjects[0];

  return (
    <div
      className={cn(
        'absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10',
        className
      )}
      aria-hidden="true"
    >
      {/* 
        Responsive Video Stage:
        On desktop, positioned across the center and right side (58%-62% width),
        filling full viewport height. On mobile/tablet, covers full screen behind dark scrim.
      */}
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[62%] xl:w-[58%] 2xl:w-[54%] h-full overflow-hidden">
        
        {/* Slot A Video */}
        {projectA && (
          <video
            ref={videoRefA}
            src={projectA.videoUrl}
            poster={projectA.thumbnailUrl || projectA.thumbnail}
            playsInline
            autoPlay
            muted
            loop={false}
            preload="auto"
            onEnded={transitionToNext}
            onTimeUpdate={activeSlot === 'A' ? handleTimeUpdate : undefined}
            onError={() => handleVideoError('A')}
            onPlaying={() => setHasStartedPlaying(true)}
            className={cn(
              'absolute inset-0 w-full h-full object-cover object-center lg:object-[60%_center] transform-gpu',
              'transition-opacity duration-700 ease-in-out',
              activeSlot === 'A' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          />
        )}

        {/* Slot B Video */}
        {projectB && safeProjects.length > 1 && (
          <video
            ref={videoRefB}
            src={projectB.videoUrl}
            poster={projectB.thumbnailUrl || projectB.thumbnail}
            playsInline
            muted
            loop={false}
            preload="metadata"
            onEnded={transitionToNext}
            onTimeUpdate={activeSlot === 'B' ? handleTimeUpdate : undefined}
            onError={() => handleVideoError('B')}
            className={cn(
              'absolute inset-0 w-full h-full object-cover object-center lg:object-[60%_center] transform-gpu',
              'transition-opacity duration-700 ease-in-out',
              activeSlot === 'B' ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          />
        )}

        {/* First Frame Poster Fallback (Before video starts) */}
        {!hasStartedPlaying && projectA && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center lg:bg-[60%_center] z-20 transition-opacity duration-500"
            style={{
              backgroundImage: `url(${projectA.thumbnailUrl || projectA.thumbnail})`,
            }}
          />
        )}

        {/* 
          ATMOSPHERIC GRADIENT BLENDING & EDGE FEATHERING
          Keeps video sharp in the focus zone, with soft cinematic dark transitions on all borders.
        */}

        {/* Left feathered gradient: Blends video seamlessly into deep #070709 background */}
        <div className="absolute inset-y-0 left-0 w-36 sm:w-56 lg:w-72 xl:w-80 bg-gradient-to-r from-[#070709] via-[#070709]/90 to-transparent z-20 pointer-events-none" />

        {/* Top edge vignette: Soft blend beneath header navigation */}
        <div className="absolute top-0 inset-x-0 h-32 sm:h-40 bg-gradient-to-b from-[#070709] via-[#070709]/70 to-transparent z-20 pointer-events-none" />

        {/* Bottom edge vignette: Soft blend into marquee banner */}
        <div className="absolute bottom-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent z-20 pointer-events-none" />

        {/* Right edge subtle feather */}
        <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#070709]/40 to-transparent z-20 pointer-events-none" />

        {/* Subtle radial filmic vignette to focus attention */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 65% 50%, transparent 40%, rgba(7, 7, 9, 0.45) 85%, rgba(7, 7, 9, 0.9) 100%)',
          }}
        />
      </div>

      {/* 
        Mobile & Tablet Scrim Overlay:
        On smaller viewports where the text overlays the video, this scrim guarantees
        100% headline legibility and text contrast while keeping background motion visible.
      */}
      <div className="absolute inset-0 bg-[#070709]/80 sm:bg-[#070709]/70 lg:hidden z-20 pointer-events-none" />
    </div>
  );
}
