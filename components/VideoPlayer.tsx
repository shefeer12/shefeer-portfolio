'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useId
} from 'react';
import {
  AlertCircle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight
} from 'lucide-react';
import {
  getDeliveryVideoUrl,
  getPosterUrl,
  isCloudinaryUrl
} from '@/lib/cloudinary-url';
import { resolveVideoDuration } from '@/lib/video-durations';
import { parseAspectRatio } from '@/lib/projects';
import ElasticSlider from '@/components/reactbits/ElasticSlider';

export interface VideoPlayerProps {
  src?: string;
  cloudinaryPublicId?: string;
  duration?: number;
  type?: 'html5' | 'cloudinary' | 'youtube' | 'vimeo' | 'demo';
  poster?: string;
  title?: string;
  aspectRatio?: string;
  autoPlay?: boolean;
  loop?: boolean;
  mutedDefault?: boolean;
  showControls?: boolean;
  isDemo?: boolean;
  className?: string;
  onEnded?: () => void;
  onNextProject?: () => void;
  onClose?: () => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2] as const;

export default function VideoPlayer({
  src,
  cloudinaryPublicId,
  duration: durationProp,
  type = 'html5',
  poster,
  title = 'Video Player',
  aspectRatio = '9:16',
  autoPlay = false,
  loop = false,
  mutedDefault = false,
  showControls = true,
  isDemo = false,
  className = '',
  onEnded,
  onNextProject,
  onClose
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const bufferedBarRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const currentTimeTextRef = useRef<HTMLSpanElement>(null);

  const rafIdRef = useRef<number | null>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const scrubTimeRef = useRef<number>(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sliderId = useId();

  // Cloudinary URL delivery helpers
  const isCloudinary =
    type === 'cloudinary' || Boolean(cloudinaryPublicId) || isCloudinaryUrl(src);
  const resolvedSrc = cloudinaryPublicId
    ? getDeliveryVideoUrl(cloudinaryPublicId, { width: 1080 })
    : isCloudinary && src
    ? getDeliveryVideoUrl(src, { width: 1080 })
    : src;

  const resolvedPoster =
    poster ||
    (cloudinaryPublicId
      ? getPosterUrl(cloudinaryPublicId, { width: 1080 })
      : isCloudinaryUrl(src)
      ? getPosterUrl(src, { width: 1080 })
      : undefined);

  const isSimulated = Boolean(isDemo) || !resolvedSrc;
  const isYouTube =
    !isSimulated &&
    resolvedSrc &&
    (resolvedSrc.includes('youtube.com') || resolvedSrc.includes('youtu.be'));

  // Analyzed duration upfront
  const resolvedDuration =
    durationProp && durationProp > 0
      ? durationProp
      : resolveVideoDuration(resolvedSrc, isSimulated ? 30 : 34.03);

  // Read volume and mute safely from localStorage
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.8;
    try {
      const saved = localStorage.getItem('shefeer_player_volume');
      if (saved !== null) {
        const parsed = Number(JSON.parse(saved));
        return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.8;
      }
    } catch {}
    return 0.8;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (mutedDefault) return true;
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('shefeer_player_muted');
      if (saved !== null) {
        return Boolean(JSON.parse(saved));
      }
    } catch {}
    return false;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(resolvedDuration);
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [showTapToUnmute, setShowTapToUnmute] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [hasFirstFrame, setHasFirstFrame] = useState<boolean>(false);

  const safeDuration =
    Number.isFinite(duration) && duration > 0.5
      ? duration
      : Number.isFinite(resolvedDuration) && resolvedDuration > 0.5
      ? resolvedDuration
      : 30;

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice(
      typeof window !== 'undefined' &&
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  // Format time mm:ss or hh:mm:ss
  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  // Sync duration whenever media element reports valid finite duration
  const syncDuration = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    const d = el.duration;
    if (Number.isFinite(d) && d > 0.1) {
      setDuration((prev) => (Math.abs(prev - d) > 0.2 ? d : prev));
    }
  }, []);

  // Auto-hide controls timer (2.5s)
  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setControlsVisible(true);
    if (isPlaying && !isScrubbing && !speedMenuOpen) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
    }
  }, [isPlaying, isScrubbing, speedMenuOpen]);

  const showControlsTemporarily = useCallback(() => {
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  // RequestAnimationFrame loop for high-performance progress updates
  useEffect(() => {
    let active = true;

    const updateProgressFrame = () => {
      if (!active) return;

      const video = videoRef.current;
      const d = safeDuration;

      if (d > 0) {
        let t = 0;
        if (isDraggingRef.current) {
          t = scrubTimeRef.current;
        } else if (!isSimulated && video) {
          t = video.currentTime;
        }

        const clampedT = Math.max(0, Math.min(d, t));
        const ratio = Math.max(0, Math.min(1, clampedT / d));

        // Update progress bar fill transform
        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${ratio})`;
        }

        // Update handle position
        if (handleRef.current) {
          handleRef.current.style.left = `${ratio * 100}%`;
        }

        // Update time display directly without triggering React re-renders
        if (currentTimeTextRef.current) {
          currentTimeTextRef.current.textContent = formatTime(clampedT);
        }

        // Update buffered range
        if (video && video.buffered.length > 0 && bufferedBarRef.current) {
          try {
            const bufEnd = video.buffered.end(video.buffered.length - 1);
            const bufRatio = Math.max(0, Math.min(1, bufEnd / d));
            bufferedBarRef.current.style.transform = `scaleX(${bufRatio})`;
          } catch {}
        }
      }

      rafIdRef.current = requestAnimationFrame(updateProgressFrame);
    };

    rafIdRef.current = requestAnimationFrame(updateProgressFrame);

    return () => {
      active = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [safeDuration, isSimulated]);

  // Autoplay and source initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isSimulated) return;

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackSpeed;

    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setShowTapToUnmute(false);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError') {
              // Browser blocked autoplay with audio: fallback to muted autoplay and show pill
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setShowTapToUnmute(true);
                })
                .catch(() => {});
            } else {
              console.warn('Autoplay error:', err);
            }
          });
      }
    }

    // Halt download completely when unmounting / closing
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (video) {
        try {
          video.pause();
          video.removeAttribute('src');
          video.load();
        } catch {}
      }
    };
  }, [autoPlay, isSimulated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seek commit helper
  const commitSeek = useCallback(
    (targetTime: number) => {
      const clamped = Math.max(0, Math.min(targetTime, safeDuration));
      scrubTimeRef.current = clamped;

      if (videoRef.current) {
        try {
          videoRef.current.currentTime = clamped;
        } catch (e) {
          console.warn('Seek error:', e);
        }
      }

      const ratio = safeDuration > 0 ? clamped / safeDuration : 0;
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${ratio})`;
      }
      if (handleRef.current) {
        handleRef.current.style.left = `${ratio * 100}%`;
      }
      if (currentTimeTextRef.current) {
        currentTimeTextRef.current.textContent = formatTime(clamped);
      }

      if (clamped < safeDuration && isEnded) {
        setIsEnded(false);
      }
    },
    [safeDuration, isEnded]
  );

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (isEnded) {
      handleReplay();
      return;
    }

    if (isSimulated) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsEnded(false);
          })
          .catch((err) => console.warn('Play error:', err));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isEnded, isSimulated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Replay
  const handleReplay = useCallback(() => {
    commitSeek(0);
    setIsEnded(false);
    if (!isSimulated && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      setIsPlaying(true);
    }
  }, [commitSeek, isSimulated]);

  // Sync volume, mute and playback rate to video element whenever state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Toggle Mute & Persist
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setShowTapToUnmute(false);
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      try {
        localStorage.setItem('shefeer_player_muted', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Volume change & Persist
  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (clamped > 0) {
      setIsMuted(false);
    }
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      if (clamped > 0) {
        videoRef.current.muted = false;
      }
    }
    try {
      localStorage.setItem('shefeer_player_volume', JSON.stringify(clamped));
      if (clamped > 0) {
        localStorage.setItem('shefeer_player_muted', JSON.stringify(false));
      }
    } catch {}
  }, []);

  // Speed change
  const handleSetSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setSpeedMenuOpen(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, []);

  // Fullscreen toggle (Container on modern browsers, webkitEnterFullscreen on iOS)
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
          (videoRef.current as any).webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Pointer Scrubbing Handlers with setPointerCapture
  const handleScrubberPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isDraggingRef.current = true;
    setIsScrubbing(true);
    scheduleControlsHide();

    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * safeDuration;

    scrubTimeRef.current = target;
    setHoverRatio(ratio);
    setHoverTime(target);
  };

  const handleScrubberPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * safeDuration;

    setHoverRatio(ratio);
    setHoverTime(target);

    if (isDraggingRef.current) {
      scrubTimeRef.current = target;
    }
  };

  const handleScrubberPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      isDraggingRef.current = false;
      setIsScrubbing(false);
      commitSeek(scrubTimeRef.current);
    }
  };

  const handleScrubberPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      isDraggingRef.current = false;
      setIsScrubbing(false);
    }
  };

  // Keyboard navigation (both element & global window listener for modal)
  const handleKeyDownAction = useCallback(
    (key: string, e?: React.KeyboardEvent | KeyboardEvent) => {
      if (key === 'Escape') {
        if (document.fullscreenElement) {
          e?.preventDefault();
          e?.stopPropagation();
          document.exitFullscreen().catch(() => {});
          return true;
        }
        return false;
      }

      if (key === ' ' || key === 'k' || key === 'K') {
        e?.preventDefault();
        togglePlay();
        showControlsTemporarily();
        return true;
      } else if (key === 'm' || key === 'M') {
        e?.preventDefault();
        toggleMute();
        showControlsTemporarily();
        return true;
      } else if (key === 'f' || key === 'F') {
        e?.preventDefault();
        toggleFullscreen();
        showControlsTemporarily();
        return true;
      } else if (key === 'ArrowLeft') {
        e?.preventDefault();
        const current = videoRef.current ? videoRef.current.currentTime : scrubTimeRef.current;
        commitSeek(Math.max(0, current - 5));
        showControlsTemporarily();
        return true;
      } else if (key === 'ArrowRight') {
        e?.preventDefault();
        const current = videoRef.current ? videoRef.current.currentTime : scrubTimeRef.current;
        commitSeek(Math.min(safeDuration, current + 5));
        showControlsTemporarily();
        return true;
      } else if (key === 'ArrowUp') {
        e?.preventDefault();
        setVolume((prev) => {
          const next = Math.round(Math.min(1, prev + 0.1) * 10) / 10;
          handleVolumeChange(next);
          return next;
        });
        showControlsTemporarily();
        return true;
      } else if (key === 'ArrowDown') {
        e?.preventDefault();
        setVolume((prev) => {
          const next = Math.round(Math.max(0, prev - 0.1) * 10) / 10;
          handleVolumeChange(next);
          return next;
        });
        showControlsTemporarily();
        return true;
      }
      return false;
    },
    [togglePlay, toggleMute, toggleFullscreen, commitSeek, handleVolumeChange, safeDuration, showControlsTemporarily]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    handleKeyDownAction(e.key, e);
  };

  // Global window keydown listener while player is mounted
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      (window as any).__lastPlayerKey = e.key;
      handleKeyDownAction(e.key, e);
    };

    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [handleKeyDownAction]);

  // Video click handler: single-click toggles play, double-click toggles fullscreen
  const handleVideoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      toggleFullscreen();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        togglePlay();
        showControlsTemporarily();
      }, 250);
    }
  };

  // Keep controls visible when paused, scrubbing, ended, or menu open
  useEffect(() => {
    if (!isPlaying || isScrubbing || isEnded || speedMenuOpen) {
      setControlsVisible(true);
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    } else {
      scheduleControlsHide();
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isPlaying, isScrubbing, isEnded, speedMenuOpen, scheduleControlsHide]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={showControlsTemporarily}
      onPointerDown={showControlsTemporarily}
      className={`relative group bg-[#000000] overflow-hidden select-none outline-none focus-visible:ring-1 focus-visible:ring-accent ${
        isFullscreen && !controlsVisible ? 'cursor-none' : ''
      } ${className}`}
      style={{
        aspectRatio: intrinsicRatio || parseAspectRatio(aspectRatio, '9 / 16')
      }}
      role="region"
      aria-label={`${title} video player`}
    >
      {/* 1. Video Element */}
      {!isSimulated && !isYouTube && resolvedSrc && !hasError && (
        <video
          ref={videoRef}
          src={resolvedSrc}
          poster={resolvedPoster}
          playsInline
          loop={loop}
          preload="metadata"
          className="w-full h-full object-contain bg-black cursor-pointer"
          onClick={handleVideoClick}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            syncDuration(el);
            if (el.videoWidth && el.videoHeight) {
              setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
            }
            if (el.readyState >= 2) {
              setHasFirstFrame(true);
            }
          }}
          onLoadedData={() => {
            setHasFirstFrame(true);
            setIsBuffering(false);
          }}
          onDurationChange={(e) => syncDuration(e.currentTarget)}
          onCanPlay={() => {
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            setIsBuffering(false);
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsEnded(false);
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            setIsBuffering(false);
          }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => {
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            bufferingTimerRef.current = setTimeout(() => {
              setIsBuffering(true);
            }, 300);
          }}
          onPlaying={() => {
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            setIsBuffering(false);
            setHasFirstFrame(true);
            setIsPlaying(true);
            setIsEnded(false);
          }}
          onError={() => {
            if (bufferingTimerRef.current) clearTimeout(bufferingTimerRef.current);
            setIsBuffering(false);
            setHasError(true);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
            if (loop) {
              handleReplay();
            } else {
              onEnded?.();
            }
          }}
        />
      )}

      {/* 2. Poster overlay until first frame rendered */}
      {!hasFirstFrame && resolvedPoster && !hasError && (
        <div
          className="absolute inset-0 bg-contain bg-no-repeat bg-center pointer-events-none z-10 bg-black"
          style={{ backgroundImage: `url("${resolvedPoster}")` }}
        />
      )}

      {/* 3. Tap to Unmute Pill (when autoplay with audio was blocked) */}
      {showTapToUnmute && isPlaying && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-16 sm:top-4 left-4 landscape:left-16 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-mono uppercase tracking-wider border border-white/20 rounded-none shadow-lg transition"
          aria-label="Tap to unmute"
        >
          <VolumeX className="w-3.5 h-3.5 text-accent" />
          <span>Tap to unmute</span>
        </button>
      )}

      {/* 4. Buffering Spinner (Only if buffering > 300ms) */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-black/40">
          <div className="w-9 h-9 border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase mt-2.5">
            Buffering...
          </span>
        </div>
      )}

      {/* 5. Error State with Retry Button */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/95 z-30">
          <AlertCircle className="w-9 h-9 text-accent mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Playback Encountered an Issue</p>
          <p className="text-xs text-white/60 mb-5 max-w-xs leading-relaxed">
            The media stream could not be loaded or was interrupted. Check your connection or retry playback.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-accent text-black font-semibold rounded-none hover:bg-accent-hover transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Playback
          </button>
        </div>
      )}

      {/* 6. Centered Play / Pause Button (appears when paused, fades when playing) */}
      {!isPlaying && !isEnded && !hasError && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition z-15 focus:outline-none"
          aria-label="Play video"
        >
          <div className="w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </button>
      )}

      {/* 7. End State: Replay & Next Project Overlay */}
      {isEnded && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-25 p-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-mono text-xs uppercase tracking-wider font-semibold rounded-none hover:bg-white/90 transition shadow-lg"
              aria-label="Replay video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            {onNextProject && (
              <button
                type="button"
                onClick={onNextProject}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-mono text-xs uppercase tracking-wider font-semibold rounded-none hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                aria-label="Next project"
              >
                <span>Next Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. Solid Black/70% Controls Bar (Bottom of video) */}
      {showControls && (
        <div
          className={`absolute bottom-0 inset-x-0 bg-black/70 border-t border-white/10 px-3 pt-2 pb-2.5 flex flex-col gap-1 transition-opacity duration-200 z-30 ${
            controlsVisible
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar with 24px invisible hit area */}
          <div
            ref={progressBarRef}
            id={sliderId}
            role="slider"
            tabIndex={0}
            aria-label="Seek slider"
            aria-valuenow={Math.round(
              isDraggingRef.current
                ? scrubTimeRef.current
                : videoRef.current
                ? videoRef.current.currentTime
                : 0
            )}
            aria-valuemin={0}
            aria-valuemax={Math.round(safeDuration)}
            aria-valuetext={`${formatTime(
              videoRef.current ? videoRef.current.currentTime : 0
            )} of ${formatTime(safeDuration)}`}
            onPointerDown={handleScrubberPointerDown}
            onPointerMove={handleScrubberPointerMove}
            onPointerUp={handleScrubberPointerUp}
            onPointerCancel={handleScrubberPointerCancel}
            onMouseEnter={() => scheduleControlsHide()}
            onMouseLeave={() => {
              if (!isDraggingRef.current) {
                setHoverRatio(null);
                setHoverTime(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const cur = videoRef.current ? videoRef.current.currentTime : 0;
                commitSeek(Math.max(0, cur - 5));
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const cur = videoRef.current ? videoRef.current.currentTime : 0;
                commitSeek(Math.min(safeDuration, cur + 5));
              }
            }}
            className="group/scrub relative w-full h-6 flex items-center cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            {/* Time Tooltip during hover or drag */}
            {hoverRatio !== null && hoverTime !== null && (
              <div
                className="absolute bottom-full mb-2 -translate-x-1/2 px-1.5 py-0.5 bg-black/95 border border-white/10 text-[10px] font-mono text-white pointer-events-none rounded-none shadow-md"
                style={{ left: `${hoverRatio * 100}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}

            {/* Track Bar (3px default, expands to 6px on hover or scrub) */}
            <div className="relative w-full h-[3px] group-hover/scrub:h-[6px] transition-[height] duration-150 bg-white/20 rounded-none overflow-hidden">
              {/* Lighter buffered range */}
              <div
                ref={bufferedBarRef}
                className="absolute inset-y-0 left-0 bg-white/30 origin-left scale-x-0 transition-transform duration-150"
              />
              {/* Active Orange fill */}
              <div
                ref={progressFillRef}
                className="absolute inset-y-0 left-0 bg-accent origin-left scale-x-0 will-change-transform"
              />
            </div>

            {/* Scrubber Handle */}
            <div
              ref={handleRef}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-black/30 rounded-none pointer-events-none transition-opacity duration-150 ${
                isScrubbing ? 'opacity-100 scale-110' : 'opacity-0 group-hover/scrub:opacity-100'
              }`}
              style={{ left: '0%' }}
            />
          </div>

          {/* Minimal Controls Row */}
          <div className="flex items-center justify-between text-white text-xs pt-0.5">
            <div className="flex items-center gap-2.5">
              {/* Play / Pause / Replay Button */}
              <button
                type="button"
                onClick={isEnded ? handleReplay : togglePlay}
                className="p-1 text-white hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={isEnded ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
              >
                {isEnded ? (
                  <RotateCcw className="w-4 h-4" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 text-white hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/50" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Volume Slider: ElasticSlider ONLY on desktop, hidden on touch devices */}
              {!isTouchDevice && (
                <div className="w-16 sm:w-20 hidden sm:flex items-center">
                  <ElasticSlider
                    startingValue={0}
                    maxValue={1}
                    stepSize={0.01}
                    value={isMuted ? 0 : volume}
                    valuePosition="none"
                    leftIcon={null}
                    rightIcon={null}
                    thumb={true}
                    thumbColor="#ffffff"
                    trackColor="rgba(255, 255, 255, 0.2)"
                    rangeColor="#ff5500"
                    thickness={3}
                    activeThickness={5}
                    maxStretch={8}
                    bounce={0.2}
                    ariaLabel="Volume control"
                    onChange={handleVolumeChange}
                  />
                </div>
              )}

              {/* Timecode: "0:12 / 0:45", monospace, tabular-nums */}
              <div className="font-mono text-[11px] tabular-nums tracking-wide text-white/80 select-none ml-1">
                <span ref={currentTimeTextRef} className="text-white font-medium">
                  00:00
                </span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{formatTime(safeDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed Menu: (0.5, 1, 1.25, 1.5, 2) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSpeedMenuOpen((prev) => !prev)}
                  className="px-1.5 py-0.5 font-mono text-[11px] text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition rounded-none focus:outline-none focus:ring-1 focus:ring-accent"
                  aria-label={`Playback speed: ${playbackSpeed}x`}
                >
                  {playbackSpeed}x
                </button>

                {speedMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#050507] border border-white/15 rounded-none shadow-2xl py-1 text-xs font-mono min-w-[70px] z-40">
                    {SPEED_OPTIONS.map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleSetSpeed(speed)}
                        className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-white/10 transition ${
                          playbackSpeed === speed
                            ? 'text-accent font-semibold'
                            : 'text-white/80'
                        }`}
                      >
                        <span>{speed}x</span>
                        {playbackSpeed === speed && (
                          <span className="w-1.5 h-1.5 bg-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 text-white hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
