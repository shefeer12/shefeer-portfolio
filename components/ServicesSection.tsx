'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Clapperboard, Film, Sparkles, Wand2, Zap } from 'lucide-react';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import GlassSurface from '@/components/reactbits/GlassSurface';

interface ServiceItem {
  number: string;
  title: string;
  headline: string;
  description: string;
  deliverables: string[];
  idealFor: string;
}

const services: ServiceItem[] = [
  {
    number: '01',
    title: 'Short-Form Reels & Viral Edits',
    headline: 'High-Retention 9:16 Vertical Video',
    description: 'Hook-driven editing for Instagram Reels, YouTube Shorts, and TikTok. Engineered with punchy pacing, fast match cuts, and audio sync designed to hold viewer attention.',
    deliverables: [
      'Thumb-stopping 0–3s hook optimization',
      'Dynamic speed ramps & beat-sync cutting',
      'Tactile sound effects & audio balance',
      'Native 9:16 vertical exports'
    ],
    idealFor: 'Creators, personal brands, founders & agency social channels'
  },
  {
    number: '02',
    title: 'YouTube & Long-Form Video Editing',
    headline: 'Structured Storytelling & High Watch Time',
    description: 'Transforming raw A-roll into engaging, well-paced YouTube episodes and long-form content with seamless chapter flow, b-roll placement, and visual graphic support.',
    deliverables: [
      'Narrative structure & retention trimming',
      'Multicam switching & visual punch-ins',
      'Engaging b-roll & illustration cut-ins',
      'Optimized chapter breaks & end-screen flow'
    ],
    idealFor: 'YouTubers, educators, founders & long-form creators'
  },
  {
    number: '03',
    title: 'Podcast Editing & Golden Moments',
    headline: 'Conversational Flow & Social Repurposing',
    description: 'Trimming pauses and dead air from interview recordings, and extracting high-impact 30–60 second golden moments tailored specifically for vertical feeds.',
    deliverables: [
      'Dialogue trimming & conversational flow cleanup',
      'High-impact hook curation from full episodes',
      'Word-by-word animated subtitles',
      'Weekly short-form podcast cut batches'
    ],
    idealFor: 'Podcasters, interviewers, keynote speakers & educators'
  },
  {
    number: '04',
    title: 'Color Correction & Tone Balancing',
    headline: 'Clean Skin Tones & Visual Consistency',
    description: 'Shot-to-shot exposure correction, natural skin tone recovery, and foundational color grading using Premiere Pro and DaVinci Resolve for a cohesive, professional look.',
    deliverables: [
      'Exposure leveling & white balance matching',
      'Natural skin tone recovery & protection',
      'Contrast balance & shadow depth tuning',
      'Consistent look across multiple camera angles'
    ],
    idealFor: 'Filmmakers, creators, brands & event videographers'
  },
  {
    number: '05',
    title: 'Subtitles, Captions & Motion Graphics',
    headline: 'Engaging Typography for Silent Feeds',
    description: 'Kinetic word-by-word subtitles, graphic callouts, animated lower-thirds, and title cards designed in After Effects and CapCut so videos communicate clearly with or without sound.',
    deliverables: [
      'Synchronized kinetic word-by-word captions',
      'Custom fonts, brand colors & highlight styling',
      'Animated lower-thirds & graphic callouts',
      'Visual punch-ins & emoji accents'
    ],
    idealFor: 'Shorts, reels, ads, and talking-head videos'
  },
  {
    number: '06',
    title: 'Cinematic Edits, Events & Weddings',
    headline: 'Emotionally Driven Highlights & Recaps',
    description: 'Crafting memorable, rhythmic aftermovies, wedding highlight recaps, and festival recap films that capture live atmosphere and emotion through music and visual pacing.',
    deliverables: [
      'Music-driven pacing & emotional crescendo',
      'Cinematic slow-motion & match cutting',
      'Ambient event audio mixing & crowd sync',
      'Social cutdowns & full highlight reels'
    ],
    idealFor: 'Couples, event organizers, festivals, college fests & videographers'
  },
  {
    number: '07',
    title: 'Promotional & Commercial Videos',
    headline: 'Punchy Visual Showcases That Drive Action',
    description: 'Commercial promos for stores, restaurants, real estate, and lifestyle products. Structured with strong branding, feature callouts, and clean visual presentation.',
    deliverables: [
      'Product macro details & atmosphere cuts',
      'Feature callout titles & price/date badges',
      'Upbeat commercial pacing & sound design',
      'Cross-platform delivery (9:16 vertical & 16:9 widescreen)'
    ],
    idealFor: 'Retail brands, restaurants, real estate & business launches'
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 sm:py-32 relative">
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
              <span className="text-accent">& OFFERINGS.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-white/70 leading-relaxed font-light">
              Tailored video editing for creators, brands, and agencies in India and internationally. Every cut is intentional, platform-native, and crafted to connect.
            </p>
          </div>
        </div>

        {/* Services List with AnimatedContent */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <AnimatedContent
              key={service.number}
              direction="vertical"
              distance={24}
              delay={index * 0.06}
              duration={0.5}
            >
              <GlassSurface
                intensity="subtle"
                glowOnHover
                className="group p-6 sm:p-8 rounded-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Number & Headline */}
                  <div className="lg:col-span-4 space-y-2">
                    <span className="text-accent font-mono text-sm font-bold">
                      {service.number} //
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs font-mono text-white/60 uppercase tracking-wider">
                      {service.headline}
                    </p>
                  </div>

                  {/* Description & Deliverables */}
                  <div className="lg:col-span-8 space-y-4">
                    <p className="text-sm text-white/80 leading-relaxed font-light">
                      {service.description}
                    </p>

                    <div className="pt-2">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
                        CORE DELIVERABLES
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.deliverables.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 text-xs font-mono text-white/70"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-muted">
                        IDEAL FOR: <span className="text-white/80">{service.idealFor}</span>
                      </span>

                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-accent hover:text-white font-semibold transition"
                      >
                        <span>Inquire for this service</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </GlassSurface>
            </AnimatedContent>
          ))}
        </div>

        {/* Commercial Terms & Collaboration Guidelines */}
        <div className="mt-12 p-6 sm:p-8 rounded-sm bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-accent">
                COMMERCIAL TERMS & COLLABORATION
              </p>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                Transparent Working Guidelines
              </h3>
            </div>
            <span className="text-xs font-mono text-white/50 px-2.5 py-1 bg-white/5 rounded border border-white/10 self-start sm:self-auto">
              Currency: INR (₹)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">CUSTOM QUOTES</span>
              <p className="text-white/70 font-light leading-relaxed">
                No rigid fixed pricing. Every project receives a tailored quote based on footage volume, turnaround, and creative complexity.
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">2 REVISION ROUNDS</span>
              <p className="text-white/70 font-light leading-relaxed">
                Two rounds of revisions are included with every edit to fine-tune pacing, titles, music sync, and color adjustments.
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">INDIVIDUAL TIMELINES</span>
              <p className="text-white/70 font-light leading-relaxed">
                Delivery schedules are agreed individually after reviewing your raw footage and project scope.
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">RUSH PROJECTS</span>
              <p className="text-white/70 font-light leading-relaxed">
                Accelerated turnaround edits are accepted subject to current schedule and availability.
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">PAYMENT TERMS</span>
              <p className="text-white/70 font-light leading-relaxed">
                Payment milestones are agreed with each client prior to starting post-production.
              </p>
            </div>

            <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded space-y-1">
              <span className="text-accent font-semibold block">INDIAN & GLOBAL CLIENTS</span>
              <p className="text-white/70 font-light leading-relaxed">
                Seamless remote workflow using Google Drive, Dropbox, or Frame.io for effortless footage handoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
