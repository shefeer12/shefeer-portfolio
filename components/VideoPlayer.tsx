'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AlertCircle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  getCloudinaryVideoUrl,
  getCloudinaryVideoPosterUrl,
  isCloudinaryUrl
} from '@/lib/cloudinary';
import { resolveVideoDuration } from '@/lib/video-durations';
import { parseAspectRatio } from '@/lib/projects';
import ElasticSlider from '@/components/reactbits/ElasticSlider';

export interface VideoPlayerProps {
  src?: string;
  cloudinaryPublicId?: string;
  duration?: number; // Optional initial duration metadata in seconds
  type?: 'html5' | 'cloudinary' | 'youtube' | 'vimeo' | 'demo';
  poster?: string;
  title?: string;
  aspectRatio?: string; // Flexible aspect ratio (e.g. '9:16', '16:9', '1:1', '4:5')
  autoPlay?: boolean;
  loop?: boolean;
  mutedDefault?: boolean;
  showControls?: boolean;
  isDemo?: boolean;
  className?: string;
  onEnded?: () => void;
}

export default function VideoPlayer({
  src,
  cloudinaryPublicId,
  duration: durationProp,
  type = 'demo',
  poster,
  title = 'Video Player',
  aspectRatio = '9:16',
  autoPlay = false,
  loop = true,
  mutedDefault = true,
  showControls = true,
  isDemo = false,
  className = '',
  onEnded
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve Cloudinary URLs
  const isCloudinary = type === 'cloudinary' || Boolean(cloudinaryPublicId) || isCloudinaryUrl(src);
  const resolvedSrc = cloudinaryPublicId
    ? getCloudinaryVideoUrl(cloudinaryPublicId)
    : isCloudinary && src
    ? getCloudinaryVideoUrl(src)
    : src;

  const resolvedPoster =
    poster ||
    (cloudinaryPublicId
      ? getCloudinaryVideoPosterUrl(cloudinaryPublicId)
      : isCloudinaryUrl(src)
      ? getCloudinaryVideoPosterUrl(src)
      : undefined);

  const isSimulated = isDemo || type === 'demo' || !resolvedSrc;
  const isYouTube = !isSimulated && resolvedSrc && (resolvedSrc.includes('youtube.com') || resolvedSrc.includes('youtu.be'));

  // Resolve exact analyzed duration upfront (defaults to pre-analyzed duration or 34.03s, never 0 or 1)
  const resolvedDuration =
    durationProp && durationProp > 0
      ? durationProp
      : resolveVideoDuration(resolvedSrc, isSimulated ? 30 : 34.03);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isMuted, setIsMuted] = useState<boolean>(mutedDefault);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(resolvedDuration);
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);

  // Safe duration guaranteed to always be the exact video duration (never 0, NaN, or negative)
  const safeDuration =
    Number.isFinite(duration) && duration > 0.5
      ? duration
      : Number.isFinite(resolvedDuration) && resolvedDuration > 0.5
      ? resolvedDuration
      : 30;

  // Active display time for scrubber and timecode (strictly bounded)
  const rawTime = isScrubbing ? scrubTime : currentTime;
  const displayTime = Number.isFinite(rawTime) ? Math.max(0, Math.min(rawTime, safeDuration)) : 0;

  // Sync duration whenever media element reports valid finite duration
  const syncDuration = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    const d = el.duration;
    if (Number.isFinite(d) && d > 0.1) {
      setDuration((prev) => (Math.abs(prev - d) > 0.2 ? d : prev));
    }
  }, []);

  // Check duration on mount or when src changes, and reset playback state to avoid state leaks
  useEffect(() => {
    setCurrentTime(0);
    setScrubTime(0);
    setIsScrubbing(false);
    setIsEnded(false);
    setIsPlaying(autoPlay);
    setHasError(false);
    setIsBuffering(false);
    setIntrinsicRatio(null);
    setDuration(resolvedDuration);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0;
      } catch {
        // ignore if not ready
      }
      syncDuration(videoRef.current);
    }
  }, [resolvedSrc, resolvedDuration, syncDuration, autoPlay]);

  // Format time in mm:ss or hh:mm:ss
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

  // Commit seek to the HTML5 video element or simulated playback
  const commitSeek = useCallback(
    (targetTime: number) => {
      const clamped = Math.max(0, Math.min(targetTime, safeDuration));
      setCurrentTime(clamped);
      setScrubTime(clamped);

      if (!isSimulated && videoRef.current) {
        try {
          videoRef.current.currentTime = clamped;
        } catch (e) {
          console.warn('Seek error:', e);
        }
      }

      if (clamped < safeDuration && isEnded) {
        setIsEnded(false);
      }
    },
    [safeDuration, isSimulated, isEnded]
  );

  // ElasticSlider drag / scrub change
  const handleScrubChange = useCallback(
    (val: number) => {
      if (!Number.isFinite(val)) return;
      setIsScrubbing(true);
      setScrubTime(val);
      if (isEnded) setIsEnded(false);
    },
    [isEnded]
  );

  // ElasticSlider scrub finish
  const handleScrubEnd = useCallback(
    (val: number) => {
      if (Number.isFinite(val)) {
        commitSeek(val);
      }
      setIsScrubbing(false);
    },
    [commitSeek]
  );

  // Simulated timer for demo mode or fallback
  useEffect(() => {
    if (!isSimulated || !isPlaying || isScrubbing) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= safeDuration) {
          if (loop) return 0;
          setIsPlaying(false);
          setIsEnded(true);
          onEnded?.();
          return safeDuration;
        }
        return Math.min(prev + 0.1, safeDuration);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulated, isPlaying, isScrubbing, safeDuration, loop, onEnded]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls when playing and not hovering
  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setControlsVisible(true);
    if (isPlaying && !isScrubbing) {
      hideControlsTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 2400);
    }
  }, [isPlaying, isScrubbing]);

  const handleMouseMove = () => {
    scheduleControlsHide();
  };

  useEffect(() => {
    if (!isPlaying || isScrubbing || isEnded) {
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
  }, [isPlaying, isScrubbing, isEnded, scheduleControlsHide]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isEnded) {
      handleReplay();
      return;
    }

    if (isSimulated) {
      if (currentTime >= safeDuration) setCurrentTime(0);
      setIsPlaying(!isPlaying);
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
          .catch((err) => {
            console.warn('Playback error:', err);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Replay from start
  const handleReplay = () => {
    commitSeek(0);
    setIsEnded(false);
    if (isSimulated) {
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isSimulated) {
      setIsMuted(!isMuted);
      return;
    }

    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Keyboard navigation within the player
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      commitSeek(Math.max(0, displayTime - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      commitSeek(Math.min(safeDuration, displayTime + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      commitSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      commitSeek(safeDuration);
    }
  };

  // Extract YouTube ID if needed
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = match && match[2].length === 11 ? match[2] : '';
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&rel=0`;
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        setIsHovering(true);
        scheduleControlsHide();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (isPlaying && !isScrubbing) {
          setControlsVisible(false);
        }
      }}
      onMouseMove={handleMouseMove}
      className={`relative group bg-[#050507] overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      style={{
        aspectRatio: intrinsicRatio || parseAspectRatio(aspectRatio, '9 / 16')
      }}
      role="region"
      aria-label={`${title} video player`}
    >
      {/* 1. Real Video Player (HTML5 & Cloudinary Stream) */}
      {!isSimulated && !isYouTube && resolvedSrc && !hasError && (
        <video
          ref={videoRef}
          src={resolvedSrc}
          poster={resolvedPoster}
          playsInline
          muted={isMuted}
          loop={loop}
          preload="metadata"
          className="w-full h-full object-contain bg-black cursor-pointer"
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            syncDuration(el);
            if (el.videoWidth && el.videoHeight) {
              setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
            }
            setIsBuffering(false);
          }}
          onDurationChange={(e) => {
            syncDuration(e.currentTarget);
          }}
          onCanPlay={(e) => {
            syncDuration(e.currentTarget);
          }}
          onTimeUpdate={(e) => {
            const el = e.currentTarget;
            if (!isScrubbing) {
              const t = el.currentTime;
              if (Number.isFinite(t)) {
                setCurrentTime(t);
              }
            }
            // Continuous duration safety check
            const d = el.duration;
            if (Number.isFinite(d) && d > 1 && Math.abs(duration - d) > 0.5) {
              setDuration(d);
            }
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsEnded(false);
            if (videoRef.current) syncDuration(videoRef.current);
          }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
            setIsEnded(false);
          }}
          onError={() => setHasError(true)}
          onEnded={() => {
            setIsPlaying(false);
            setIsEnded(true);
            if (loop) {
              handleReplay();
            } else {
              onEnded?.();
            }
          }}
          onClick={togglePlay}
        />
      )}

      {/* 2. YouTube Embed */}
      {isYouTube && resolvedSrc && (
        <iframe
          src={getYouTubeEmbedUrl(resolvedSrc)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}

      {/* 3. Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/95 z-20">
          <AlertCircle className="w-9 h-9 text-accent mb-3" />
          <p className="text-sm font-medium text-white mb-1">Video failed to load</p>
          <p className="text-xs text-muted mb-4 max-w-xs">
            The media stream is temporarily unavailable. You can retry playback or preview the edit below.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white rounded transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 4. Simulated / Poster Mode (When in demo mode or without stream) */}
      {(isSimulated || hasError) && (
        <div
          className="absolute inset-0 cursor-pointer bg-black"
          onClick={togglePlay}
        >
          {resolvedPoster && (
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out ${
                isPlaying ? 'scale-[1.02] brightness-90' : 'scale-100 brightness-80'
              }`}
              style={{ backgroundImage: `url("${resolvedPoster}")` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        </div>
      )}

      {/* 5. Buffering Indicator */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15 bg-black/20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 6. Minimal Center Play / Replay Trigger (shows when paused or ended) */}
      {(!isPlaying || isEnded) && !isYouTube && (
        <button
          type="button"
          onClick={isEnded ? handleReplay : togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition hover:bg-black/20 z-10 focus:outline-none"
          aria-label={isEnded ? 'Replay video' : isPlaying ? 'Pause video' : 'Play video'}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent text-black flex items-center justify-center shadow-xl shadow-accent/30 transition-transform duration-200 hover:scale-110 active:scale-95">
            {isEnded ? (
              <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-1" />
            )}
          </div>
        </button>
      )}

      {/* 7. Bottom Controls Bar with React Bits ElasticSlider Progress */}
      {showControls && !isYouTube && (
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3.5 pt-8 pb-3 flex flex-col gap-1.5 transition-opacity duration-300 z-20 ${
            controlsVisible || isHovering || !isPlaying || isEnded || isScrubbing
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ElasticSlider Progress & Seeking Scrubber */}
          <div className="w-full px-0.5">
            <ElasticSlider
              className="w-full !w-full"
              orientation="horizontal"
              startingValue={0}
              maxValue={safeDuration}
              value={displayTime}
              valuePosition="none"
              leftIcon={null}
              rightIcon={null}
              thumb={true}
              thumbColor="#ffffff"
              trackColor="rgba(255, 255, 255, 0.22)"
              rangeColor="#ff5500"
              thickness={4}
              activeThickness={8}
              maxStretch={20}
              bounce={0.35}
              ariaLabel="Seek video"
              onChange={handleScrubChange}
              onChangeEnd={handleScrubEnd}
            />
          </div>

          {/* Minimal Controls Row */}
          <div className="flex items-center justify-between text-white text-xs pt-1">
            <div className="flex items-center gap-3">
              {/* Play / Pause / Replay Button */}
              <button
                type="button"
                onClick={isEnded ? handleReplay : togglePlay}
                className="p-1 rounded text-white/90 hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={isEnded ? 'Replay video' : isPlaying ? 'Pause video' : 'Play video'}
              >
                {isEnded ? (
                  <RotateCcw className="w-4 h-4" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Volume / Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded text-white/90 hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/60" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Timecode: Tabular Numerals showing exact elapsed / total duration */}
              <div className="font-mono text-[11px] tabular-nums tracking-wide text-white/80 select-none">
                <span className="text-white font-medium">{formatTime(displayTime)}</span>
                <span className="text-white/40 mx-1">/</span>
                <span className="text-white/60">{formatTime(safeDuration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 rounded text-white/90 hover:text-accent transition focus:outline-none focus:ring-1 focus:ring-accent"
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
