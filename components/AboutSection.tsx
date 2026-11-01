'use client';

import React from 'react';
import {
  ArrowUpRight,
  Film,
  Heart,
  Mic,
  Palette,
  Sparkles,
  Tv,
  Wand2
} from 'lucide-react';
import { siteConfig, getWhatsAppUrl } from '@/lib/site-config';
import Reveal from '@/components/Reveal';
import VariableProximity from '@/components/reactbits/VariableProximity';
import ProfileCard from '@/components/reactbits/ProfileCard';
import Magnetic from '@/components/Magnetic';

export default function AboutSection() {
  const directWhatsAppUrl = getWhatsAppUrl(
    'Hi Shefeer, I visited your portfolio and would like to talk about a video editing project.'
  );

  const specialties = [
    {
      icon: Sparkles,
      title: 'Short-Form Reels & Shorts',
      description:
        'Engaging edits with thoughtful pacing, clean transitions, and platform-friendly vertical formatting.'
    },
    {
      icon: Film,
      title: 'YouTube Video Editing',
      description:
        'Structured edits with clear storytelling, well-paced cuts, and supporting visuals.'
    },
    {
      icon: Mic,
      title: 'Podcast Highlights',
      description:
        'Focused clips that bring key moments and conversations to the forefront.'
    },
    {
      icon: Palette,
      title: 'Color Correction & Grading',
      description:
        'Consistent color, balanced exposure, and a polished visual finish.'
    },
    {
      icon: Tv,
      title: 'Promotional Videos',
      description:
        'Video edits designed to communicate a brand, product, or service clearly.'
    },
    {
      icon: Heart,
      title: 'Wedding & Event Highlights',
      description:
        'Memorable edits that bring important moments together through visual storytelling.'
    }
  ];

  return (
    <section id="about" className="py-24 sm:py-32 relative bg-[#07070a] border-t border-white/10">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
          {/* Left Column: Interactive React Bits ProfileCard */}
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase">
              <Film className="w-3.5 h-3.5" />
              <span>03 // ABOUT SHEFEER</span>
            </div>

            {/* Interactive 3D Holographic ProfileCard */}
            <Reveal>
              <div className="relative group flex flex-col items-center lg:items-start">
                {/* Filmic Ambient Glow behind card */}
                <div className="absolute -inset-2 bg-gradient-to-b from-accent/25 via-accent/5 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none" />

                <ProfileCard
                  name="Muhammed Shefeer K"
                  title="Freelance Video Editor"
                  handle="reefehs_"
                  status="Open for Projects"
                  statusColor="#22c55e"
                  contactText="Connect"
                  avatarUrl="/assets/shefeer.png"
                  holo={0.7}
                  glare={0.4}
                  tiltStrength={10}
                  parallax={6}
                  radius={16}
                  enableTilt={true}
                  intro={true}
                  showUserInfo={true}
                  theme="dark"
                  backdropColor="#0e0e13"
                  onContactClick={() => {
                    const el = document.getElementById('contact');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.open(directWhatsAppUrl, '_blank');
                    }
                  }}
                  className="mx-auto lg:mx-0 shadow-2xl"
                />

                {/* Confirmed Technical Stack Card */}
                <div className="w-full max-w-[420px] mt-4 p-4 rounded bg-white/[0.02] border border-white/10 space-y-3">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-accent">
                      Confirmed Editing Software Stack
                    </p>
                    <p className="text-[11px] text-white/50 font-mono mt-0.5">
                      Accurate tools and working proficiency levels
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
            </Reveal>
          </div>

          {/* Right Column: Bio, Philosophy & Editing Specialties */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-8">
            <div>
              <p className="text-xs font-mono tracking-widest text-accent uppercase mb-2">
                CRAFT & PHILOSOPHY
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase font-sans leading-tight">
                <div className="flex flex-col items-start">
                  <VariableProximity
                    label="TURNING RAW FOOTAGE"
                    fromFontWeight={800}
                    toFontWeight={950}
                    radius={90}
                    className="text-white tracking-tight cursor-default"
                  />
                  <div className="mt-1">
                    <VariableProximity
                      label="INTO STORIES THAT CONNECT."
                      fromFontWeight={800}
                      toFontWeight={950}
                      radius={90}
                      hoverColor="#ffffff"
                      className="text-accent tracking-tight cursor-default"
                    />
                  </div>
                </div>
              </h2>
            </div>

            {/* Authentic, Client-Focused Bio Copy with Reveal */}
            <Reveal delay={0.08}>
              <div className="space-y-4 text-sm sm:text-base text-white/80 font-light leading-relaxed">
                <p>
                  I’m <span className="text-white font-medium">Muhammed Shefeer K</span>, a freelance video editor based in <span className="text-white font-medium">Kochi, Kerala, India</span>. I help creators and businesses turn raw footage into polished, engaging videos for digital platforms.
                </p>
                <p>
                  From short-form reels to longer videos, I focus on strong pacing, thoughtful cuts, clean visuals, and storytelling that keeps the audience interested.
                </p>
                <p className="text-white/70">
                  Every project has its own story. My goal is to understand your vision and shape the footage into a video that feels clear, intentional, and true to your message.
                </p>
              </div>
            </Reveal>

            {/* Editing Specialties Grid */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Editing Specialties
                </p>
                <p className="text-xs text-white/50 font-light mt-1">
                  Core editing disciplines tailored to your project requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {specialties.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.title}
                      className="p-4 rounded-sm bg-white/[0.02] border border-white/10 hover:border-accent/40 transition-colors space-y-2 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-accent/10 border border-accent/20 text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-semibold text-white tracking-wide">
                          {spec.title}
                        </h4>
                      </div>
                      <p className="text-[12px] text-white/65 leading-relaxed font-light pl-9.5">
                        {spec.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Row with Magnetic Effect */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.3}>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-accent text-black font-semibold text-xs uppercase tracking-wider hover:bg-accent-hover transition shadow-lg shadow-accent/20"
                >
                  <span>Work with Shefeer</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </Magnetic>

              <Magnetic strength={0.25}>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition"
                >
                  <span>Direct WhatsApp Chat</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
