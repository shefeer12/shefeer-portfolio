'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUpRight, Play, Sparkles, Film, Volume2 } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { getHeroProject } from '@/lib/projects';
import VideoPlayer from '@/components/VideoPlayer';
import Grainient from '@/components/reactbits/Grainient';
import RotatingText from '@/components/reactbits/RotatingText';
import ScrollReveal from '@/components/reactbits/ScrollReveal';

interface HeroProps {
  onOpenShowreel?: () => void;
}

export default function Hero({ onOpenShowreel }: HeroProps) {
  const heroProject = getHeroProject();

  return (
    <section
      id="home"
      className="relative min-h-[94vh] pt-32 pb-16 flex flex-col justify-between overflow-hidden"
    >
      {/* React Bits: Grainient Atmospheric Flow Canvas */}
      <Grainient
        colorA="#070709"
        colorB="#190d06"
        colorC="#ff5500"
        opacity={0.4}
        className="z-0"
      />

      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[160px] pointer-events-none z-0" />

      <div className="site-container w-full flex-grow flex flex-col justify-center relative z-10">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 2xl:gap-20 items-center">
          {/* Left Column: Editorial Headline, RotatingText & Copy */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-6 sm:space-y-8">
            {/* Availability & Role Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono tracking-widest text-muted">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
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

            {/* Oversized Editorial Headline with ScrollReveal */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-[5.5rem] font-black tracking-tighter leading-[0.9] text-white uppercase font-sans">
                <ScrollReveal baseOpacity={0.4} enableBlur={true} blurStrength={3}>
                  I MAKE EVERY FRAME
                </ScrollReveal>{' '}
                <br />
                <span className="text-accent underline decoration-white/10 underline-offset-8">
                  MATTER.
                </span>
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
            <p className="max-w-2xl text-base sm:text-lg xl:text-xl text-white/70 font-light leading-relaxed">
              {siteConfig.tagline}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#work"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-sm bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-accent-hover transition-all duration-200 shadow-xl shadow-accent/20"
              >
                <span>Explore Selected Work</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>

              <a
                href="#about"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-sm border border-white/20 hover:border-accent bg-white/5 text-white hover:text-accent text-xs font-mono uppercase tracking-wider transition-all duration-200"
              >
                <span>About Shefeer</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
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

          {/* Right Column: Hero 9:16 Portrait Showcase Video Card */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[390px] xl:max-w-[420px]">
              {/* Outer Glow & Filmic Edge Frame */}
              <div className="absolute -inset-1 bg-gradient-to-b from-accent/30 via-white/5 to-transparent rounded-lg blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />

              <div className="relative rounded bg-[#0b0b10] border border-white/15 p-2.5 sm:p-3 shadow-2xl">
                {/* Film Viewfinder Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-1.5 border-b border-white/10 text-[9px] font-mono text-white/60 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    <span className="text-white font-bold">HERO SHOWCASE</span>
                  </span>
                  <span className="text-accent font-bold">9:16 PORTRAIT</span>
                </div>

                {/* 9:16 Interactive Video Container */}
                <VideoPlayer
                  src={heroProject.videoUrl}
                  cloudinaryPublicId={heroProject.cloudinaryPublicId}
                  type={heroProject.videoType || 'cloudinary'}
                  poster={heroProject.thumbnailUrl || heroProject.thumbnail}
                  duration={heroProject.durationSeconds}
                  title={heroProject.title}
                  aspectRatio={heroProject.aspectRatio}
                  autoPlay={false}
                  loop={true}
                  mutedDefault={true}
                  showControls={true}
                  isDemo={heroProject.isDemoPlaceholder || false}
                  className="rounded-sm"
                />

                {/* Card Sub-caption */}
                <div className="p-3 bg-white/[0.02] border-t border-white/5 mt-2 flex items-center justify-between text-xs font-mono">
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] font-semibold text-white tracking-wide uppercase truncate">
                      {heroProject.title}
                    </p>
                    <p className="text-[9px] text-muted tracking-wider">
                      {heroProject.duration} · 9:16 MASTER CUT
                    </p>
                  </div>
                  <a
                    href="#work"
                    className="p-1.5 bg-white/10 hover:bg-accent hover:text-black rounded text-white transition-colors flex-shrink-0"
                    aria-label="View selected work cuts"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Banner Strip */}
      <div className="mt-16 w-full border-y border-white/10 bg-white/[0.02] py-3 overflow-hidden select-none relative z-10">
        <div className="flex items-center justify-around gap-8 text-[11px] font-mono uppercase tracking-[0.25em] text-white/60">
          <span className="flex items-center gap-2">
            <span className="text-accent">★</span> TURNING RAW FOOTAGE INTO STORIES THAT CONNECT
          </span>
          <span className="hidden sm:flex items-center gap-2">
            <span className="text-accent">●</span> 2+ YEARS FREELANCE EXPERIENCE
          </span>
          <span className="hidden md:flex items-center gap-2">
            <span className="text-accent">▲</span> INDIAN & INTERNATIONAL CLIENTS
          </span>
          <span className="flex items-center gap-2">
            <span className="text-accent">◆</span> COLOR CORRECTION & SUBTITLES
          </span>
        </div>
      </div>
    </section>
  );
}
