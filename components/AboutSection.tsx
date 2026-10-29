'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  Clock,
  Film,
  Layers,
  Sparkles,
  Terminal,
  Type,
  Volume2,
  Wand2,
  Zap
} from 'lucide-react';
import { siteConfig, getWhatsAppUrl } from '@/lib/site-config';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import GlassSurface from '@/components/reactbits/GlassSurface';

export default function AboutSection() {
  const directWhatsAppUrl = getWhatsAppUrl(
    'Hi Shefeer, I visited your portfolio and would like to talk about a video editing project.'
  );

  const specialties = [
    {
      icon: Sparkles,
      title: 'Short-Form Reels & Viral Retention',
      description:
        'Engineering the opening 0–3 seconds with visual curiosity, speed ramps, and audio risers to halt the scroll on Instagram Reels and Shorts.'
    },
    {
      icon: Film,
      title: 'YouTube & Long-Form Video Editing',
      description:
        'Structuring narratives, b-roll placement, multicam switching, and pacing that sustains viewer watch-time throughout full-length episodes.'
    },
    {
      icon: Volume2,
      title: 'Podcast Conversions & Hook Curation',
      description:
        'Extracting high-value segments from podcast episodes with animated kinetic captions and tight conversational trimming.'
    },
    {
      icon: Layers,
      title: 'Color Correction & Tone Balancing',
      description:
        'Natural skin tone recovery, shot-to-shot consistency, and foundational color correction using Premiere Pro and DaVinci Resolve.'
    },
    {
      icon: Type,
      title: 'Subtitles & Kinetic Captions',
      description:
        'Engaging text overlays and dynamic subtitles designed in After Effects and CapCut for viewers browsing on mute.'
    },
    {
      icon: Clock,
      title: 'Cinematic & Wedding / Event Highlights',
      description:
        'Emotionally driven aftermovies and event highlight cuts with rhythmic musical beat matching and cinematic flow.'
    }
  ];

  return (
    <section id="about" className="py-24 sm:py-32 relative bg-[#07070a] border-t border-white/10">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* Left Column: Shefeer's Real Photograph */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase">
              <Film className="w-3.5 h-3.5" />
              <span>03 // ABOUT SHEFEER</span>
            </div>

            {/* Editorial Portrait Frame */}
            <AnimatedContent direction="vertical" distance={20} duration={0.6}>
              <div className="relative group">
                {/* Filmic Ambient Glow */}
                <div className="absolute -inset-2 bg-gradient-to-b from-accent/20 via-accent/5 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500" />

                <div className="relative max-w-[420px] lg:max-w-none mx-auto lg:mx-0 aspect-[3/4] sm:aspect-[4/5] bg-gradient-to-b from-[#151522] via-[#0c0c14] to-[#050508] border border-white/15 rounded-lg overflow-hidden shadow-2xl">
                  {/* Shefeer's Real Cutout Photograph with Genuine Alpha Transparency */}
                  <Image
                    src="/assets/shefeer.png"
                    alt="Muhammed Shefeer K - Freelance Video Editor"
                    width={800}
                    height={1000}
                    priority
                    className="w-full h-full object-cover object-top filter contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />

                  {/* Cinematic gradient shading */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />

                  {/* Corner Accent Tick Marks */}
                  <div className="absolute top-3 left-3 text-white/40 font-mono text-xs pointer-events-none">
                    ┌
                  </div>
                  <div className="absolute top-3 right-3 text-white/40 font-mono text-xs pointer-events-none">
                    ┐
                  </div>
                  <div className="absolute bottom-3 left-3 text-white/40 font-mono text-xs pointer-events-none">
                    └
                  </div>
                  <div className="absolute bottom-3 right-3 text-white/40 font-mono text-xs pointer-events-none">
                    ┘
                  </div>

                  {/* Status Overlay Tag */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                    <span>OPEN FOR FREELANCE PROJECTS</span>
                  </div>

                  {/* Bottom Portrait HUD */}
                  <div className="absolute bottom-4 inset-x-4 z-10 flex items-end justify-between text-white font-mono text-[10px] bg-black/60 backdrop-blur-sm p-3 rounded border border-white/10">
                    <div>
                      <p className="text-accent font-bold tracking-wider text-xs uppercase">
                        Muhammed Shefeer K
                      </p>
                      <p className="text-white/60 text-[10px]">Freelance Video Editor · 2+ Years Exp</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                      Kochi, Kerala, IN
                    </span>
                  </div>
                </div>

                {/* Confirmed Technical Stack Card */}
                <div className="mt-4 p-4 rounded bg-white/[0.02] border border-white/10 space-y-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-accent">
                      Confirmed Editing Software Stack
                    </p>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5">
                      Accurate proficiency levels without exaggeration
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-accent/80 font-semibold block mb-1">REGULAR USE:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white/90">
                          Adobe Premiere Pro
                        </span>
                        <span className="px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white/90">
                          Adobe After Effects
                        </span>
                        <span className="px-2.5 py-1 bg-accent/15 rounded border border-accent/30 text-accent font-semibold">
                          CapCut
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block mb-1">BASIC LEVEL:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white/70">
                          DaVinci Resolve
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/50 block mb-1">ADDITIONAL TOOLS:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white/70">
                          Adobe Photoshop
                        </span>
                        <span className="px-2.5 py-1 bg-white/5 rounded border border-white/10 text-white/70">
                          Canva
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Right Column: Bio, Philosophy & Editing Specialties */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-8">
            <div>
              <p className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
                CRAFT & PHILOSOPHY
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans leading-tight">
                <ScrollReveal baseOpacity={0.3} enableBlur={true}>
                  TURNING RAW FOOTAGE
                </ScrollReveal>{' '}
                <br />
                <span className="text-accent">INTO STORIES THAT CONNECT.</span>
              </h2>
            </div>

            {/* Concise Bio Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-white/80 font-light leading-relaxed">
              <p>
                I am <span className="text-white font-medium">Muhammed Shefeer K</span>, a freelance video editor with <span className="text-white font-medium">2+ years of experience</span> based in <span className="text-white font-medium">Kochi, Kerala, India</span>, collaborating with Indian and international clients.
              </p>
              <p>
                In fast-moving feeds, attention is won in the first two seconds and sustained through rhythm, intentional cuts, and emotional connection. I treat raw footage as a canvas, shaping raw clips into cohesive, high-retention visual stories.
              </p>
              <p className="text-white/60 text-xs sm:text-sm">
                Whether cutting high-energy reels, podcast highlights, YouTube videos, or cinematic wedding and event recaps, my focus is always the same: make every frame hold feeling, clarity, and purpose.
              </p>
            </div>

            {/* Editing Specialties Grid */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Editing Specialties
                </p>
                <p className="text-xs text-white/50 font-light mt-1">
                  Core editing disciplines applied to every cut I deliver.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {specialties.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.title}
                      className="p-4 rounded bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-semibold text-white tracking-wide">
                          {spec.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-white/60 leading-relaxed font-light pl-8">
                        {spec.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-accent-hover transition shadow-lg shadow-accent/20"
              >
                <span>Work with Shefeer</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition"
              >
                <span>Direct WhatsApp Chat</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
