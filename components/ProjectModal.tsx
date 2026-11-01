'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Info,
  Layers,
  Sparkles,
  Volume2,
  Wand2,
  X
} from 'lucide-react';
import type { Project } from '@/lib/projects';
import VideoPlayer from '@/components/VideoPlayer';
import { getWhatsAppUrl } from '@/lib/site-config';

interface ProjectModalProps {
  project: Project | null;
  clickOrigin?: { x: number; y: number } | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ProjectModal({
  project,
  clickOrigin,
  onClose,
  onNext,
  onPrev
}: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [showMobileLandscapeInfo, setShowMobileLandscapeInfo] = useState<boolean>(false);

  const titleId = useId();

  const isWidescreen =
    project?.aspectRatio === '16:9' || project?.aspectRatio === '16/9';
  const isSquare = project?.aspectRatio === '1:1';

  // Prevent background scrolling, trap focus, handle Escape and arrow keys
  useEffect(() => {
    if (!project) return;

    // Save previously focused element to return focus on modal close
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Move initial focus to close button for keyboard & accessibility
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape precedence: If in fullscreen, let player exit fullscreen first
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          // Fullscreen active: let the browser / player exit fullscreen
          return;
        }
        e.preventDefault();
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab') {
        const modalEl = modalRef.current;
        if (!modalEl) return;

        const focusable = Array.from(
          modalEl.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalEl.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalEl.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);

      // Return focus to trigger element when closed
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [project, onClose, onNext, onPrev]);

  // Reset landscape info drawer on project change
  useEffect(() => {
    setShowMobileLandscapeInfo(false);
  }, [project?.id]);

  const inquiryWhatsAppUrl = project
    ? getWhatsAppUrl(
        `Hi Shefeer, I watched your edit "${project.title}" (${project.category}) on your portfolio and I would love to discuss a project with you.`
      )
    : '';

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.25,
            ease: 'easeOut'
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-lenis-prevent
          onClick={onClose}
        >
          <motion.div
            key={project.id}
            ref={modalRef}
            data-lenis-prevent
            initial={{
              opacity: prefersReducedMotion ? 1 : 0,
              scale: prefersReducedMotion ? 1 : 0.96
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: prefersReducedMotion ? 1 : 0,
              scale: prefersReducedMotion ? 1 : 0.98
            }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            style={{
              transformOrigin: clickOrigin
                ? `${clickOrigin.x}px ${clickOrigin.y}px`
                : 'center center'
            }}
            className={`relative w-full max-w-[1200px] max-h-[100dvh] sm:max-h-[calc(100dvh-48px)] bg-[#050507] border-0 sm:border border-white/10 shadow-2xl rounded-none overflow-hidden flex flex-col ${
              isWidescreen ? 'lg:flex-col' : 'lg:flex-row'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Always Reachable 44px Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-50 w-11 h-11 bg-black/80 hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-accent rounded-none shadow-lg"
              aria-label="Close modal (Escape)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mobile Landscape Info Button Toggle */}
            <div className="absolute top-3 left-3 z-50 hidden landscape:flex lg:landscape:hidden">
              <button
                type="button"
                onClick={() => setShowMobileLandscapeInfo((prev) => !prev)}
                className="w-11 h-11 bg-black/80 hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-accent rounded-none shadow-lg"
                aria-label="Toggle project details"
              >
                <Info className="w-5 h-5 text-accent" />
              </button>
            </div>

            {/* LAYOUT A: 16:9 Widescreen Layout (Video on Top, Details Underneath in 2 Columns) */}
            {isWidescreen ? (
              <div className="w-full flex flex-col max-h-[100dvh] sm:max-h-[calc(100dvh-48px)] overflow-y-auto">
                {/* Widescreen Video Section */}
                <div className="w-full bg-black flex items-center justify-center flex-shrink-0 border-b border-white/10 max-h-[60dvh] sm:max-h-[70dvh]">
                  <div className="w-full max-w-[1000px] mx-auto">
                    <VideoPlayer
                      src={project.videoUrl}
                      cloudinaryPublicId={project.cloudinaryPublicId}
                      duration={project.durationSeconds}
                      type={project.videoType || 'html5'}
                      poster={project.thumbnailUrl || project.thumbnail}
                      title={project.title}
                      aspectRatio={project.aspectRatio}
                      autoPlay={!prefersReducedMotion}
                      loop={false}
                      isDemo={project.isDemoPlaceholder}
                      className="w-full max-h-[60dvh] sm:max-h-[70dvh]"
                      onEnded={() => {}}
                      onNextProject={onNext}
                      onClose={onClose}
                    />
                  </div>
                </div>

                {/* Details Underneath in Two Columns */}
                <div className="p-5 sm:p-7 md:p-8 bg-[#08080c] grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Left Column: Title, Category, Brief & Overview, Tags */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/50">
                        <span className="text-accent font-semibold tracking-wider uppercase">
                          {project.order ? String(project.order).padStart(2, '0') : '01'} // {project.category}
                        </span>
                        {project.client && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="text-white/70">{project.client}</span>
                          </>
                        )}
                        <span className="text-white/20">·</span>
                        <span>{project.aspectRatio}</span>
                        {project.duration && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>{project.duration}</span>
                          </>
                        )}
                      </div>
                      <h2
                        id={titleId}
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                      >
                        {project.title}
                      </h2>
                    </div>

                    {/* Brief & Overview */}
                    <div className="space-y-2 border-l border-white/10 pl-3.5">
                      <p className="text-[10px] uppercase tracking-widest text-accent font-mono">
                        Brief & Objective
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed font-light">
                        {project.brief || project.description}
                      </p>
                      {project.overview && (
                        <p className="text-xs text-white/60 leading-relaxed pt-2">
                          {project.overview}
                        </p>
                      )}
                    </div>

                    {/* Plain Text Software Tags (NO chips) */}
                    {project.tools && project.tools.length > 0 && (
                      <div className="space-y-1 pt-2">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                          Software & Tools
                        </p>
                        <p className="text-xs font-mono text-white/80 tracking-wide">
                          {project.tools.join('  ·  ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Post-Production Strategy & Navigation / CTA */}
                  <div className="space-y-5 flex flex-col justify-between">
                    {/* Editing Approach */}
                    {project.editingApproach && (
                      <div className="space-y-3">
                        <p className="text-[11px] uppercase tracking-widest text-white/80 font-mono flex items-center gap-2">
                          <Wand2 className="w-3.5 h-3.5 text-accent" />
                          Post-Production Strategy
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Sparkles className="w-3 h-3 text-accent" /> Hook Strategy
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.hookStrategy}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3 h-3 text-accent" /> Pacing & Rhythm
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.pacingAndRhythm}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Volume2 className="w-3 h-3 text-accent" /> Sound Design
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.soundDesign}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Layers className="w-3 h-3 text-accent" /> Color Grading
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.colorGrading}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation & WhatsApp CTA */}
                    <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {onPrev && (
                          <button
                            type="button"
                            onClick={onPrev}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-none transition flex items-center justify-center gap-1.5 text-xs font-mono"
                            aria-label="Previous project"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Prev</span>
                          </button>
                        )}
                        {onNext && (
                          <button
                            type="button"
                            onClick={onNext}
                            className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-none transition flex items-center justify-center gap-1.5 text-xs font-mono"
                            aria-label="Next project"
                          >
                            <span>Next</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <a
                        href={inquiryWhatsAppUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                      >
                        <span>Book a Similar Edit</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LAYOUT B: 9:16 and 1:1 Layout (Video on Left Sized by Ratio, Details on Right) */
              <>
                {/* Video Column */}
                <div
                  className={`bg-black flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 flex-shrink-0 ${
                    // Desktop: height capped at viewport height minus 48px, width derived from ratio
                    isSquare
                      ? 'lg:w-[480px] lg:h-[calc(100dvh-48px)]'
                      : 'lg:w-[min(480px,calc((100dvh-48px)*9/16))] lg:h-[calc(100dvh-48px)]'
                  } w-full max-h-[50dvh] sm:max-h-[60dvh] lg:max-h-[calc(100dvh-48px)] landscape:max-h-[100dvh]`}
                >
                  <VideoPlayer
                    src={project.videoUrl}
                    cloudinaryPublicId={project.cloudinaryPublicId}
                    duration={project.durationSeconds}
                    type={project.videoType || 'html5'}
                    poster={project.thumbnailUrl || project.thumbnail}
                    title={project.title}
                    aspectRatio={project.aspectRatio}
                    autoPlay={!prefersReducedMotion}
                    loop={false}
                    isDemo={project.isDemoPlaceholder}
                    className="w-full h-full max-h-[50dvh] sm:max-h-[60dvh] lg:max-h-[calc(100dvh-48px)] landscape:max-h-[100dvh]"
                    onEnded={() => {}}
                    onNextProject={onNext}
                    onClose={onClose}
                  />
                </div>

                {/* Details Column */}
                <div
                  className={`flex-1 p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto bg-[#08080c] ${
                    showMobileLandscapeInfo
                      ? 'fixed inset-0 z-40 bg-[#08080c] flex flex-col landscape:flex'
                      : 'landscape:hidden lg:landscape:flex'
                  }`}
                >
                  <div className="space-y-6">
                    {/* Header Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs text-white/50">
                        <span className="text-accent font-semibold tracking-wider uppercase">
                          {project.order ? String(project.order).padStart(2, '0') : '01'} // {project.category}
                        </span>
                        {project.client && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="text-white/70">{project.client}</span>
                          </>
                        )}
                        <span className="text-white/20">·</span>
                        <span>{project.aspectRatio}</span>
                        {project.duration && (
                          <>
                            <span className="text-white/20">·</span>
                            <span>{project.duration}</span>
                          </>
                        )}
                      </div>
                      <h2
                        id={titleId}
                        className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                      >
                        {project.title}
                      </h2>
                    </div>

                    {/* Creative Brief & Overview */}
                    <div className="space-y-2 border-l border-white/10 pl-3.5">
                      <p className="text-[10px] uppercase tracking-widest text-accent font-mono">
                        Brief & Objective
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed font-light">
                        {project.brief || project.description}
                      </p>
                      {project.overview && (
                        <p className="text-xs text-white/60 leading-relaxed pt-2">
                          {project.overview}
                        </p>
                      )}
                    </div>

                    {/* Editing Strategy */}
                    {project.editingApproach && (
                      <div className="space-y-3">
                        <p className="text-[11px] uppercase tracking-widest text-white/80 font-mono flex items-center gap-2">
                          <Wand2 className="w-3.5 h-3.5 text-accent" />
                          Post-Production Strategy
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Sparkles className="w-3 h-3 text-accent" /> Hook Strategy
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.hookStrategy}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Clock className="w-3 h-3 text-accent" /> Pacing & Rhythm
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.pacingAndRhythm}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Volume2 className="w-3 h-3 text-accent" /> Sound Design
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.soundDesign}
                            </p>
                          </div>

                          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1">
                            <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                              <Layers className="w-3 h-3 text-accent" /> Color Grading
                            </span>
                            <p className="text-white/60 leading-normal text-[11px]">
                              {project.editingApproach.colorGrading}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Software & Master Delivery (Plain Text, NO chips) */}
                    {project.tools && project.tools.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                          Software & Tools
                        </p>
                        <p className="text-xs font-mono text-white/80 tracking-wide">
                          {project.tools.join('  ·  ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation & CTA */}
                  <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {onPrev && (
                        <button
                          type="button"
                          onClick={onPrev}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-none transition flex items-center justify-center gap-1.5 text-xs font-mono"
                          aria-label="Previous project"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Prev</span>
                        </button>
                      )}
                      {onNext && (
                        <button
                          type="button"
                          onClick={onNext}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-none transition flex items-center justify-center gap-1.5 text-xs font-mono"
                          aria-label="Next project"
                        >
                          <span>Next</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <a
                      href={inquiryWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                    >
                      <span>Book a Similar Edit</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
