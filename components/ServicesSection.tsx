'use client';

import React from 'react';
import { ArrowUpRight, Zap } from 'lucide-react';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import GlassSurface from '@/components/reactbits/GlassSurface';
import { getWhatsAppUrl } from '@/lib/site-config';

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

/**
 * 8 Confirmed Services from SHEFEER_BRIEF.md (Section 10):
 * 1. Short-form reels and social videos
 * 2. YouTube editing
 * 3. Podcast editing and highlights
 * 4. Color correction and grading
 * 5. Subtitles and captions
 * 6. Cinematic edits
 * 7. Wedding and event highlights
 * 8. Commercials and promotional videos
 */
const services: ServiceItem[] = [
  {
    number: '01',
    title: 'Short-Form Reels & Social Videos',
    description: 'Hook-driven cuts for Instagram Reels, YouTube Shorts, and TikTok. Engineered with punchy pacing, thoughtful match cuts, and audio sync designed to hold viewer retention.',
    deliverables: [
      'Hook optimization (0–3s viewer retention)',
      'Dynamic speed ramps & beat-synced cuts',
      'Tactile sound effects & audio balance',
      'Native 9:16 vertical delivery'
    ]
  },
  {
    number: '02',
    title: 'YouTube Editing',
    description: 'Transforming raw A-roll into engaging, well-paced YouTube videos with structured narrative flow, b-roll placement, and visual rhythm that sustains watch time.',
    deliverables: [
      'Narrative structure & retention trimming',
      'Multicam switching & visual punch-ins',
      'B-roll integration & graphic support',
      'End-screen flow & chapter markers'
    ]
  },
  {
    number: '03',
    title: 'Podcast Editing & Highlights',
    description: 'Trimming pauses and dead air from full-length podcast recordings, and extracting high-impact 30–60 second highlight clips tailored for social feeds.',
    deliverables: [
      'Dialogue cleanup & conversational flow',
      'Key golden-moment extraction',
      'Word-by-word animated subtitles',
      'Batch exports for multi-platform distribution'
    ]
  },
  {
    number: '04',
    title: 'Color Correction & Grading',
    description: 'Shot-to-shot exposure correction, natural skin tone recovery, and foundational color grading using Premiere Pro and DaVinci Resolve for a cohesive visual look.',
    deliverables: [
      'Exposure leveling & white balance matching',
      'Natural skin tone protection',
      'Contrast balance & shadow depth tuning',
      'Consistent look across multiple camera angles'
    ]
  },
  {
    number: '05',
    title: 'Subtitles & Captions',
    description: 'Kinetic word-by-word captions, graphic callouts, and clean animated lower-thirds so videos communicate clearly with or without sound.',
    deliverables: [
      'Synchronized kinetic word captions',
      'Custom fonts & brand styling',
      'Animated lower-thirds & titles',
      'Visual emphasis for silent feeds'
    ]
  },
  {
    number: '06',
    title: 'Cinematic Edits',
    description: 'Atmospheric narrative cuts driven by sound design, visual pacing, and careful music selection for travel films, brand stories, and cinematic showcases.',
    deliverables: [
      'Music-driven pacing & emotional flow',
      'Cinematic slow-motion & match cuts',
      'Soundscape design & ambient audio mixing',
      'High-bitrate master exports'
    ]
  },
  {
    number: '07',
    title: 'Wedding & Event Highlights',
    description: 'Memorable highlight films, recap aftermovies, and event cutdowns that capture genuine atmosphere, energy, and emotion through thoughtful editing.',
    deliverables: [
      'Atmospheric event recap films',
      'Emotional crescendo & music alignment',
      'Live audio & speech integration',
      'Social cutdowns & full recap versions'
    ]
  },
  {
    number: '08',
    title: 'Commercials & Promotional Videos',
    description: 'Promotional videos for brands, products, restaurants, real estate, and lifestyle launches structured with strong visual presentation and clear calls to action.',
    deliverables: [
      'Product details & atmospheric framing',
      'Feature callout titles & brand badges',
      'Upbeat commercial pacing & sound design',
      'Cross-platform delivery (9:16 and 16:9)'
    ]
  }
];

export default function ServicesSection() {
  const quoteWhatsAppUrl = getWhatsAppUrl('Hi Shefeer, I would like to request a quote for video editing.');

  return (
    <section id="services" className="py-24 sm:py-32 relative border-t border-white/10">
      <div className="site-container">
        {/* Section Heading with ScrollReveal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>02 // SERVICES & CAPABILITIES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans">
              <ScrollReveal baseOpacity={0.3} enableBlur={true}>
                SERVICES
              </ScrollReveal>{' '}
              <br />
              <span className="text-accent">& CAPABILITIES.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-white/70 leading-relaxed font-light">
              Tailored video editing for creators and businesses in India and internationally. Every cut is intentional, platform-native, and crafted to connect.
            </p>
          </div>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <AnimatedContent
              key={service.number}
              direction="vertical"
              distance={20}
              delay={index * 0.04}
              duration={0.4}
            >
              <GlassSurface
                intensity="subtle"
                glowOnHover
                className="group p-6 sm:p-7 rounded-sm h-full flex flex-col justify-between border border-white/8 hover:border-accent/40 transition-colors"
              >
                <div className="space-y-4">
                  {/* Service Number & Title */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-accent font-mono text-xs font-bold tracking-widest">
                      {service.number} //
                    </span>
                    <a
                      href="#contact"
                      className="text-white/40 group-hover:text-accent transition-colors"
                      aria-label={`Inquire about ${service.title}`}
                    >
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    {service.description}
                  </p>

                  {/* Deliverables List */}
                  <div className="pt-2">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-2">
                      INCLUDED IN CUT
                    </p>
                    <ul className="space-y-1.5">
                      {service.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-[11px] font-mono text-white/70"
                        >
                          <span className="w-1 h-1 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-accent hover:text-white font-semibold transition"
                  >
                    <span>Request Quote</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </GlassSurface>
            </AnimatedContent>
          ))}
        </div>

        {/* 
          Approved Pricing Notice:
          "Pricing is based on a quotation. Contact for a quote."
          Unconfirmed revision, timeline, and rush policies omitted per brief rules until Shefeer approves.
        */}
        <div className="mt-12 p-6 sm:p-8 rounded-sm bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold block">
              PRICING & COMMERCIAL TERMS
            </span>
            <p className="text-base sm:text-lg font-medium text-white tracking-tight">
              Pricing is based on a quotation. Contact for a quote.
            </p>
            <p className="text-xs text-white/60 font-light font-mono">
              Every edit is scoped individually based on footage length, turnaround, and narrative complexity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <a
              href="#contact"
              className="px-5 py-2.5 bg-accent text-black font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-accent-hover transition shadow-lg shadow-accent/20"
            >
              Contact for a quote
            </a>
            <a
              href={quoteWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono uppercase tracking-wider rounded transition"
            >
              WhatsApp Quote
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
