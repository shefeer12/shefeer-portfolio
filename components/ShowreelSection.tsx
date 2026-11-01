'use client';

import React from 'react';
import { Film, Play, Sparkles, Volume2, Wand2, Info } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { siteConfig } from '@/lib/site-config';
import { projects } from '@/lib/projects';
import Reveal from '@/components/Reveal';
import GlassSurface from '@/components/reactbits/GlassSurface';
import DriftWall from '@/components/reactbits/DriftWall';

export default function ShowreelSection() {
  const { showreel } = siteConfig;

  // Prepare ambient drift tiles from real project thumbnails
  const driftTiles = projects.slice(0, 6).map((p) => ({
    id: p.id,
    thumbnail: p.thumbnail,
    title: p.title
  }));

  return (
    <section id="showreel" className="py-24 sm:py-32 relative bg-[#09090e] border-y border-white/10 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-accent/5 via-transparent to-transparent pointer-events-none" />

      {/* React Bits: DriftWall ambient background filmstrip */}
      <div className="absolute top-10 inset-x-0 overflow-hidden opacity-20 pointer-events-none">
        <DriftWall tiles={driftTiles} speed={45} />
      </div>

      <div className="site-container relative z-10">
        {/* Section Header with Reveal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase mb-3">
              <Film className="w-3.5 h-3.5" />
              <span>02 // CINEMATIC REEL</span>
            </div>
            <Reveal>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans">
                THE 9:16 <br />
                <span className="text-accent">SHOWREEL.</span>
              </h2>
            </Reveal>
          </div>

          <div className="max-w-md">
            <Reveal delay={0.08}>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                A curated reel of vertical moments demonstrating pacing, hook engineering, seamless match cuts, sound design, and color finishing.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Showreel Showcase Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Specs & Creative Philosophy */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <Reveal staggerIndex={0}>
              <GlassSurface intensity="medium" className="p-6 rounded space-y-4">
                <p className="text-[10px] uppercase font-mono tracking-widest text-accent flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Technical Master Specs
                </p>

                <div className="space-y-3 text-xs font-mono text-muted">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">ASPECT RATIO</span>
                    <span className="text-white font-semibold">9:16 Vertical Native</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">MASTER RESOLUTION</span>
                    <span className="text-white font-semibold">2160 × 3840 (4K UHD)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">COLOR PIPELINE</span>
                    <span className="text-white font-semibold">DaVinci YRGB Color Managed</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/40">AUDIO TARGET</span>
                    <span className="text-white font-semibold">-14 LUFS (Platform Standard)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-white/40">RUN TIME</span>
                    <span className="text-accent font-semibold">{showreel.duration}</span>
                  </div>
                </div>
              </GlassSurface>
            </Reveal>

            <Reveal staggerIndex={1}>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded space-y-2">
                <p className="text-xs font-serif italic text-white/80 leading-relaxed">
                  &ldquo;Every cut must serve the emotion. If a frame does not heighten curiosity or push the story forward, it gets discarded.&rdquo;
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-accent pt-1">
                  — MUHAMMED SHEFEER
                </p>
              </div>
            </Reveal>

            {/* Clearly labeled configuration note for the client */}
            <div className="p-4 bg-accent/5 border border-accent/20 rounded flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-white/70 space-y-1">
                <p className="font-semibold text-white">Client Showreel Configuration</p>
                <p>
                  To attach your final master showreel, update <code className="text-accent bg-black/40 px-1 py-0.5 rounded">lib/site-config.ts</code> with your hosted MP4 or YouTube Short link.
                </p>
              </div>
            </div>
          </div>

          {/* Center/Right Column: Dominant 9:16 Video Player */}
          <div className="lg:col-span-8 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[420px] sm:max-w-[440px]">
              {/* Outer Filmic Glow */}
              <div className="absolute -inset-2 bg-gradient-to-t from-accent/20 via-accent/5 to-transparent rounded-xl blur-xl opacity-60 pointer-events-none" />

              <div className="relative rounded-lg bg-[#070709] border border-white/20 p-3 shadow-2xl shadow-black">
                {/* 9:16 Master Frame */}
                <VideoPlayer
                  src={showreel.videoUrl}
                  cloudinaryPublicId={showreel.cloudinaryPublicId}
                  type={showreel.videoType}
                  poster={showreel.posterImage}
                  title="Shefeer Master Showreel"
                  aspectRatio="9:16"
                  autoPlay={false}
                  loop={true}
                  mutedDefault={false}
                  showControls={true}
                  isDemo={!showreel.videoUrl && !showreel.cloudinaryPublicId}
                  className="rounded"
                />

                <div className="mt-3 px-2 py-1 flex items-center justify-between text-xs font-mono text-muted">
                  <span className="text-white font-medium">{showreel.title}</span>
                  <span className="text-accent">{showreel.year} CUT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
