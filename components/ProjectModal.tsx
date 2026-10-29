'use client';

import React, { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
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
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ProjectModal({ project, onClose, onNext, onPrev }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling and handle Escape/Arrow keys
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNext, onPrev]);

  if (!project) return null;

  const inquiryWhatsAppUrl = getWhatsAppUrl(
    `Hi Shefeer, I watched your edit "${project.title}" (${project.category}) on your portfolio and I would love to discuss a project with you.`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl xl:max-w-7xl bg-[#08080c] border border-white/10 shadow-2xl rounded-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sleek, accessible close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-40 w-9 h-9 rounded-full bg-black/80 hover:bg-white/15 border border-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close video preview (Press Escape)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video-first grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Dominant Video Column (Clean, large 9:16 vertical viewport) */}
          <div className="lg:col-span-6 xl:col-span-7 bg-black/90 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[440px] mx-auto flex flex-col items-center">
              <VideoPlayer
                src={project.videoUrl}
                cloudinaryPublicId={project.cloudinaryPublicId}
                duration={project.durationSeconds}
                type={project.videoType || 'demo'}
                poster={project.thumbnailUrl || project.thumbnail}
                title={project.title}
                aspectRatio={project.aspectRatio}
                autoPlay={false}
                loop={true}
                mutedDefault={true}
                showControls={true}
                isDemo={project.isDemoPlaceholder}
                className="w-full rounded border border-white/10 shadow-2xl shadow-black"
              />

              {/* Minimal technical details directly below video */}
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/50 mt-3 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>MASTER {project.aspectRatio}</span>
                </span>
                <span>{project.duration}</span>
                <span>{project.year}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Case Study & Technical Breakdown */}
          <div className="lg:col-span-6 xl:col-span-5 p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-6 bg-[#0a0a0f]">
            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                  <span className="text-accent font-semibold tracking-wider uppercase">
                    {project.order ? String(project.order).padStart(2, '0') : '01'} // {project.category}
                  </span>
                  {project.client && (
                    <>
                      <span className="text-white/20">·</span>
                      <span className="text-white/60">{project.client}</span>
                    </>
                  )}
                </div>
                <h2
                  id="modal-project-title"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight"
                >
                  {project.title}
                </h2>
              </div>

              {/* Brief & Overview */}
              <div className="space-y-2 bg-white/[0.02] border border-white/5 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-accent font-mono">
                  Brief & Objective
                </p>
                <p className="text-sm text-white/90 leading-relaxed font-light">
                  {project.brief || project.description}
                </p>
                {project.overview && (
                  <p className="text-xs text-white/60 leading-relaxed pt-1 border-t border-white/5 mt-2">
                    {project.overview}
                  </p>
                )}
              </div>

              {/* Editing Approach Breakdown */}
              {project.editingApproach && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/80 font-mono flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5 text-accent" />
                    Post-Production Strategy
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-1">
                      <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3 h-3 text-accent" /> Hook Strategy
                      </span>
                      <p className="text-white/60 leading-normal text-[11px]">
                        {project.editingApproach.hookStrategy}
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-1">
                      <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-accent" /> Pacing & Rhythm
                      </span>
                      <p className="text-white/60 leading-normal text-[11px]">
                        {project.editingApproach.pacingAndRhythm}
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-1">
                      <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                        <Volume2 className="w-3 h-3 text-accent" /> Sound Design
                      </span>
                      <p className="text-white/60 leading-normal text-[11px]">
                        {project.editingApproach.soundDesign}
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm space-y-1">
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

              {/* Tools & Workflow */}
              {project.tools && project.tools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono">
                    Software & Master Delivery
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 text-xs rounded bg-white/5 text-white/80 border border-white/10"
                      >
                        {tool}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 text-xs rounded bg-accent/10 text-accent border border-accent/20 font-mono">
                      {project.aspectRatio} Master
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions: Navigation & Direct Client CTA */}
            <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Prev / Next controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onPrev && (
                  <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded transition flex items-center justify-center gap-1.5 text-xs font-mono"
                    aria-label="Previous project (Arrow Left)"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                )}
                {onNext && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="flex-1 sm:flex-initial px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded transition flex items-center justify-center gap-1.5 text-xs font-mono"
                    aria-label="Next project (Arrow Right)"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Direct Booking CTA */}
              <a
                href={inquiryWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-accent text-black font-semibold text-xs tracking-wider uppercase hover:bg-accent-hover transition shadow-lg shadow-accent/20"
              >
                <span>Book a Similar Edit</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
