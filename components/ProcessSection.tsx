'use client';

import React from 'react';
import { Clapperboard } from 'lucide-react';
import Reveal from '@/components/Reveal';
import GlassSurface from '@/components/reactbits/GlassSurface';

interface ProcessStep {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  actionItem: string;
}

const steps: ProcessStep[] = [
  {
    step: '01',
    title: 'Footage Ingest & Project Alignment',
    subtitle: 'Goal review & custom quote agreement',
    description: 'You share raw footage (via Google Drive, Dropbox, or Frame.io) with your objectives. We review the clips, agree on individual timelines and commercial terms (in INR), and map out the narrative hook.',
    actionItem: 'Footage review & milestone agreement'
  },
  {
    step: '02',
    title: 'The Cut, Subtitles & Color Pass',
    subtitle: 'Pacing, motion titles & 2 revision rounds',
    description: 'Intentional pacing, kinetic subtitles in After Effects/CapCut, and foundational color correction in Premiere Pro & DaVinci Resolve. Includes 2 collaborative revision rounds to perfect the cut.',
    actionItem: 'Collaborative review with 2 revisions'
  },
  {
    step: '03',
    title: 'Master Delivery & Final Polish',
    subtitle: 'Platform-ready master files',
    description: 'Balanced audio and crisp high-definition export formatted for your platform. Final masters delivered ready to publish. Rush turnarounds accepted subject to schedule availability.',
    actionItem: 'Ready-to-post high-definition master'
  }
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 sm:py-32 relative bg-[#07070a] border-t border-white/10">
      <div className="site-container">
        {/* Header with Reveal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase mb-3">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>04 // 3-STEP PROCESS</span>
            </div>
            <Reveal>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans">
                HOW WE <br />
                <span className="text-accent">COLLABORATE.</span>
              </h2>
            </Reveal>
          </div>

          <div className="max-w-md">
            <Reveal delay={0.08}>
              <p className="text-sm text-white/70 leading-relaxed font-light">
                A transparent, friction-free three-stage workflow taking raw footage from camera cards to high-performing vertical cuts.
              </p>
            </Reveal>
          </div>
        </div>

        {/* 3-Step Process Grid with Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, index) => (
            <Reveal
              key={item.step}
              staggerIndex={index}
            >
              <GlassSurface
                intensity="subtle"
                glowOnHover
                className="p-6 sm:p-8 rounded-sm relative flex flex-col justify-between space-y-6 h-full"
              >
                <div className="space-y-4">
                  {/* Step Marker */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-accent font-mono">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                      STAGE 0{index + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-mono text-accent uppercase tracking-wider mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                {/* Action item pill */}
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[11px] font-mono text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{item.actionItem}</span>
                </div>
              </GlassSurface>
            </Reveal>
          ))}
        </div>

        {/* Revisions & Communication Note */}
        <div className="mt-12 p-6 bg-white/[0.02] border border-white/10 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>COMMUNICATION: ASYNC SLACK, WHATSAPP & CLOUD TIMESTAMP REVIEWS</span>
          </div>

          <span className="text-white/60">
            FLEXIBLE REVISION ROUNDS PER PROJECT SCOPE
          </span>
        </div>
      </div>
    </section>
  );
}
