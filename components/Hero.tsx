'use client';

import React, { useState, useCallback, useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { siteConfig } from '@/lib/site-config';
import { getHeroRotationProjects, type Project } from '@/lib/projects';
import CinematicHeroBackground from '@/components/CinematicHeroBackground';
import SpeakerToggle from '@/components/SpeakerToggle';
import Grainient from '@/components/reactbits/Grainient';
import RotatingText from '@/components/reactbits/RotatingText';
import VariableProximity from '@/components/reactbits/VariableProximity';
import Magnetic from '@/components/Magnetic';

interface HeroProps {
  onOpenShowreel?: () => void;
  isPaused?: boolean;
}

export default function Hero({ onOpenShowreel, isPaused = false }: HeroProps) {
  const rotationProjects = getHeroRotationProjects();
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll scrub: as user scrolls out of hero, foreground content drifts up slightly and fades
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.75], [0, -44]);

  // Unified audio state: Starts muted for cross-browser autoplay compliance
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [soundBlocked, setSoundBlocked] = useState<boolean>(false);

  // Active clip tracking for speaker toggle subtitle indicator
  const [activeProject, setActiveProject] = useState<Project>(rotationProjects[0]);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);

  const handleActiveProjectChange = useCallback((project: Project, index: number) => {
    setActiveProject(project);
    setActiveProjectIndex(index);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextState = !prev;
      setSoundBlocked(false);
      return nextState;
    });
  }, []);

  const handleAudioError = useCallback(() => {
    setSoundBlocked(true);
    setIsMuted(true);
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-[94vh] lg:min-h-[96vh] pt-28 sm:pt-32 pb-12 sm:pb-16 flex flex-col justify-between overflow-hidden bg-[#070709]"
    >
      {/* React Bits: Grainient Atmospheric Flow Canvas */}
      <Grainient
        colorA="#070709"
        colorB="#190d06"
        colorC="#ff5500"
        opacity={0.3}
        className="z-0 pointer-events-none"
      />

      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* 
        Cinematic Hero Autoplay Background Engine
        Extends across the center and right side on desktop, filling viewport height,
        with seamless crossfades between 4 curated showcase projects and edge gradient feathering.
      */}
      <CinematicHeroBackground
        projects={rotationProjects}
        isMuted={isMuted}
        isPaused={isPaused}
        onActiveProjectChange={handleActiveProjectChange}
        onAudioError={handleAudioError}
      />

      {/* Foreground Hero Content Container with Scroll Scrub (drifts up slightly and fades) */}
      <motion.div
        style={{
          opacity: prefersReducedMotion ? 1 : heroOpacity,
          y: prefersReducedMotion ? 0 : heroY
        }}
        className="site-container w-full flex-grow flex flex-col justify-center relative z-20 py-8 lg:py-12"
      >
        <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-6 sm:space-y-8">
          {/* Availability & Role Status */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-widest text-muted">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-[10px] tracking-wider font-semibold">
                {siteConfig.bio.availability}
              </span>
            </div>
            <span className="hidden sm:inline-block text-white/20">|</span>
            <span className="text-[11px] text-accent font-semibold tracking-wider">
              FREELANCE VIDEO EDITOR · 2+ YEARS EXP
            </span>
          </div>

          {/* Oversized Editorial Headline with VariableProximity (Interactive Logo Hover Effect) */}
          <div className="space-y-3">
            <h1 aria-label="I Make Every Frame Matter." className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-[5.5rem] font-black tracking-tighter leading-[0.9] text-white uppercase font-sans drop-shadow-sm">
              <span className="sr-only">I Make Every Frame Matter.</span>
              <div aria-hidden="true" className="flex flex-col items-start">
                {/* Proximity-interactive main phrase: letters dynamically swell and glow orange near cursor */}
                <VariableProximity
                  label="I MAKE EVERY FRAME"
                  fromFontWeight={800}
                  toFontWeight={950}
                  radius={110}
                  className="text-white tracking-tighter cursor-default"
                />
                {/* Accent punchline: letters dynamically swell and illuminate near cursor */}
                <div className="mt-1 sm:mt-2">
                  <VariableProximity
                    label="MATTER."
                    fromFontWeight={800}
                    toFontWeight={950}
                    radius={110}
                    hoverColor="#ffffff"
                    className="text-accent tracking-tighter underline decoration-white/10 underline-offset-8 cursor-default"
                  />
                </div>
              </div>
            </h1>

            {/* React Bits: RotatingText for confirmed editing categories */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs sm:text-sm font-mono text-white/80">
              <span className="text-muted">CRAFTING HIGH-IMPACT:</span>
              <RotatingText
                texts={[
                  'RETENTION REELS',
                  'YOUTUBE EDITS',
                  'PODCAST CUTS',
                  'CINEMATIC STORIES',
                  'EVENT HIGHLIGHTS'
                ]}
                mainClassName="px-2.5 py-0.5 bg-accent/15 border border-accent/30 rounded text-accent font-bold"
                staggerDuration={0.02}
                rotationInterval={2600}
              />
            </div>
          </div>

          {/* Supporting Copy - Recommended Tagline */}
          <p className="max-w-2xl text-base sm:text-lg xl:text-xl text-white/80 font-light leading-relaxed drop-shadow-sm">
            {siteConfig.tagline}
          </p>

          {/* Action CTAs with Magnetic Effect */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Magnetic strength={0.3}>
              <a
                href="#work"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-sm bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-accent-hover transition-all duration-200 shadow-xl shadow-accent/20"
              >
                <span>Explore Selected Work</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>
            </Magnetic>

            <Magnetic strength={0.25}>
              <a
                href="#about"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-sm border border-white/20 hover:border-accent bg-white/5 text-white hover:text-accent text-xs font-mono uppercase tracking-wider transition-all duration-200 backdrop-blur-sm"
              >
                <span>About Shefeer</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>
          </div>

          {/* Editorial Footer Strip */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-[10px] font-mono tracking-widest text-muted">
            <div>
              <span className="block text-white/40 mb-0.5">LOCATION</span>
              <span className="text-white font-medium">KOCHI, KERALA, INDIA</span>
            </div>
            <div>
              <span className="block text-white/40 mb-0.5">CLIENT REACH</span>
              <span className="text-accent font-medium">INDIAN & GLOBAL CLIENTS</span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-white/40 mb-0.5">REGULAR SUITE</span>
              <span className="text-white font-medium">PREMIERE · AFTER EFFECTS · CAPCUT</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 
        Animated Speaker Toggle (React Bits Inspired)
        Positioned in the lower-left area of the cinematic hero video composition.
        Separated completely from fixed floating WhatsApp button located on bottom-right.
      */}
      <div className="site-container w-full relative z-30 flex justify-start">
        <SpeakerToggle
          isMuted={isMuted}
          onToggle={handleToggleMute}
          currentProjectTitle={activeProject?.title}
          currentProjectIndex={activeProjectIndex}
          totalProjects={rotationProjects.length}
          soundBlocked={soundBlocked}
          className="mb-3 sm:mb-4"
        />
      </div>

      {/* Marquee Banner Strip - Continuous single-line scrolling on mobile and desktop */}
      <div className="mt-8 sm:mt-10 w-full border-y border-white/10 bg-white/[0.02] py-3 overflow-hidden select-none relative z-20">
        {/* Subtle Edge Fade Masks */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-[#070709] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-[#070709] to-transparent z-10" />

        <div className="hero-marquee-track flex gap-10 items-center whitespace-nowrap will-change-transform w-max text-[11px] font-mono uppercase tracking-[0.25em] text-white/70">
          {[
            { symbol: '★', text: 'TURNING RAW FOOTAGE INTO STORIES THAT CONNECT' },
            { symbol: '●', text: '2+ YEARS FREELANCE EXPERIENCE' },
            { symbol: '▲', text: 'INDIAN & INTERNATIONAL CLIENTS' },
            { symbol: '◆', text: 'COLOR CORRECTION & SUBTITLES' },
            { symbol: '★', text: 'TURNING RAW FOOTAGE INTO STORIES THAT CONNECT' },
            { symbol: '●', text: '2+ YEARS FREELANCE EXPERIENCE' },
            { symbol: '▲', text: 'INDIAN & INTERNATIONAL CLIENTS' },
            { symbol: '◆', text: 'COLOR CORRECTION & SUBTITLES' }
          ].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-2 shrink-0">
              <span className="text-accent">{item.symbol}</span>
              <span>{item.text}</span>
            </span>
          ))}
        </div>

        <style jsx>{`
          .hero-marquee-track {
            animation: hero-marquee-scroll 24s linear infinite;
          }
          @keyframes hero-marquee-scroll {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-marquee-track {
              animation: none;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
