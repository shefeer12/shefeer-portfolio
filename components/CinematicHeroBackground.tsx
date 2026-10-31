'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Project } from '@/lib/projects';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getDeliveryVideoUrl, getPosterUrl } from '@/lib/cloudinary-url';

export interface CinematicHeroBackgroundProps {
  projects: Project[];
  isMuted: boolean;
  isPaused?: boolean;
  onActiveProjectChange?: (project: Project, index: number) => void;
  onAudioError?: () => void;
  className?: string;
}

/**
 * CinematicHeroBackground
 * 
 * High-performance, dual-buffer video crossfade background.
 * Optimized for minimal initial payload, bandwidth savings, and mobile devices:
 * - Load ONLY curated clips
 * - First frame poster shows instantly
 * - Slot B (next clip) preloads ONLY after Slot A is playing
 * - IntersectionObserver pauses video when scrolled off-screen
 * - Respects prefers-reduced-motion, navigator.connection.saveData, and slow connections
 * - Width-limited delivery streams (640w mobile, 1080w desktop)
 * - Seamless 800ms A/B crossfade preserved
 */
export default function CinematicHeroBackground({
  projects,
  isMuted,
  isPaused = false,
  onActiveProjectChange,
  onAudioError,
  className,
}: CinematicHeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Guard against empty array
  const safeProjects = projects && projects.length > 0 ? projects : [];

  // Active buffer slot: 'A' or 'B'
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');

  // Indices into safeProjects
  const [indexA, setIndexA] = useState<number>(0);
  const [indexB, setIndexB] = useState<number>(safeProjects.length > 1 ? 1 : 0);

  // Playback & optimization states
  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [disableAutoplay, setDisableAutoplay] = useState<boolean>(false);

  // Video element refs
  const videoRefA = useRef<HTMLVideoElement | null>(null);
  const videoRefB = useRef<HTMLVideoElement | null>(null);

  // Lock to prevent concurrent transition triggers
  const transitionLockRef = useRef<boolean>(false);
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active project index
  const activeIndex = activeSlot === 'A' ? indexA : indexB;
  const activeProject = safeProjects[activeIndex] || safeProjects[0];

  // Detect mobile viewport and network constraints on mount
  useEffect(() => {
    const checkConstraints = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Check prefers-reduced-motion, saveData, and slow connections
      const nav = typeof navigator !== 'undefined' ? (navigator as unknown as {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }) : {};

      const saveData = Boolean(nav.connection?.saveData);
      const effectiveType = nav.connection?.effectiveType;
      const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion || saveData || isSlow) {
        setDisableAutoplay(true);
      }
    };

    checkConstraints();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver to pause/stop hero video when scrolled off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Control playback based on visibility and isPaused prop
  useEffect(() => {
    const activeVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;
    if (!activeVideo || disableAutoplay) return;

    if (!isInView || isPaused) {
      if (!activeVideo.paused) {
        activeVideo.pause();
      }
    } else if (hasStartedPlaying && activeVideo.paused) {
      activeVideo.play().catch(() => {});
    }
  }, [isInView, isPaused, activeSlot, disableAutoplay, hasStartedPlaying]);

  // Notify parent of active project change
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

    if (isMuted || isPaused || !isInView) {
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
  }, [isMuted, isPaused, isInView, activeSlot, onAudioError]);

  /**
   * Transition to next clip in rotation sequence
   */
  const transitionToNext = useCallback(() => {
    if (transitionLockRef.current || safeProjects.length <= 1 || disableAutoplay) return;
    transitionLockRef.current = true;

    const nextSlot = activeSlot === 'A' ? 'B' : 'A';
    const nextVideo = nextSlot === 'A' ? videoRefA.current : videoRefB.current;
    const currentVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;

    if (nextVideo) {
      // Configure audio before playback handover to persist user mute preference
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

    // Crossfade duration: 800ms (or 50ms if prefersReducedMotion)
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

      // Cue up the next clip in rotation sequence for standby slot
      if (activeSlot === 'A') {
        const nextIndexA = (indexB + 1) % safeProjects.length;
        setIndexA(nextIndexA);
      } else {
        const nextIndexB = (indexA + 1) % safeProjects.length;
        setIndexB(nextIndexB);
      }

      transitionLockRef.current = false;
    }, fadeDuration);
  }, [activeSlot, disableAutoplay, indexA, indexB, isMuted, prefersReducedMotion, safeProjects.length]);

  // Initial playback start for Slot A
  useEffect(() => {
    if (disableAutoplay) return;

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
          });
      }
    }

    return () => {
      if (crossfadeTimerRef.current) {
        clearTimeout(crossfadeTimerRef.current);
      }
    };
  }, [disableAutoplay]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInView && !isPaused && !disableAutoplay) {
        const activeVideo = activeSlot === 'A' ? videoRefA.current : videoRefB.current;
        if (activeVideo && activeVideo.paused) {
          activeVideo.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeSlot, isInView, isPaused, disableAutoplay]);

  // Error recovery
  const handleVideoError = (slot: 'A' | 'B') => {
    console.warn(`Video load error in slot ${slot}. Skipping to next clip.`);
    if (slot === activeSlot) {
      transitionToNext();
    } else {
      if (slot === 'A') {
        setIndexA((prev) => (prev + 1) % safeProjects.length);
      } else {
        setIndexB((prev) => (prev + 1) % safeProjects.length);
      }
    }
  };

  // Monitor playback progress to initiate smooth crossfade before clip end
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!video.duration || Number.isNaN(video.duration)) return;

    const remainingTime = video.duration - video.currentTime;
    if (remainingTime <= 0.6 && !transitionLockRef.current && safeProjects.length > 1) {
      transitionToNext();
    }
  };

  const projectA = safeProjects[indexA] || safeProjects[0];
  const projectB = safeProjects[indexB] || safeProjects[0];

  // Sizing: lighter on mobile (640px) vs desktop (1080px)
  const targetWidth = isMobile ? 640 : 1080;

  const projectAVideoSrc = projectA ? getDeliveryVideoUrl(projectA.videoUrl, { width: targetWidth }) : '';
  const projectBVideoSrc = projectB ? getDeliveryVideoUrl(projectB.videoUrl, { width: targetWidth }) : '';

  const projectAPosterSrc = projectA
    ? getPosterUrl(projectA.videoUrl, { width: targetWidth }) || projectA.thumbnailUrl || projectA.thumbnail
    : '';
  const projectBPosterSrc = projectB
    ? getPosterUrl(projectB.videoUrl, { width: targetWidth }) || projectB.thumbnailUrl || projectB.thumbnail
    : '';

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-10',
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[62%] xl:w-[58%] 2xl:w-[54%] h-full overflow-hidden">
        
        {/* Instant First Frame Poster Overlay (Fades out only after video starts playing) */}
        {(!hasStartedPlaying || disableAutoplay) && projectAPosterSrc && (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center lg:bg-[60%_center] z-20 transition-opacity duration-700 pointer-events-none"
            style={{
              backgroundImage: `url("${projectAPosterSrc}")`,
            }}
          />
        )}

        {/* Slot A Video: starts as soon as it can */}
        {!disableAutoplay && projectA && (
          <video
            ref={videoRefA}
            src={projectAVideoSrc}
            poster={projectAPosterSrc}
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

        {/* 
          Slot B Video:
          Preloads ONLY after the current clip is actively playing (hasStartedPlaying === true).
          Never downloads before Slot A starts, saving bandwidth on initial page load.
        */}
        {!disableAutoplay && projectB && safeProjects.length > 1 && hasStartedPlaying && (
          <video
            ref={videoRefB}
            src={projectBVideoSrc}
            poster={projectBPosterSrc}
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

        {/* Feathered dark gradient edges & atmospheric vignette */}
        <div className="absolute inset-y-0 left-0 w-36 sm:w-56 lg:w-72 xl:w-80 bg-gradient-to-r from-[#070709] via-[#070709]/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 sm:h-40 bg-gradient-to-b from-[#070709] via-[#070709]/70 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#070709]/40 to-transparent z-20 pointer-events-none" />

        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 65% 50%, transparent 40%, rgba(7, 7, 9, 0.45) 85%, rgba(7, 7, 9, 0.9) 100%)',
          }}
        />
      </div>

      {/* Mobile scrim overlay */}
      <div className="absolute inset-0 bg-[#070709]/80 sm:bg-[#070709]/70 lg:hidden z-20 pointer-events-none" />
    </div>
  );
}
