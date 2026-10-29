'use client';

import React from 'react';
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { siteConfig, getWhatsAppUrl, getMailtoUrl } from '@/lib/site-config';
import InquiryForm from '@/components/InquiryForm';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import CursorGrid from '@/components/reactbits/CursorGrid';
import GlassSurface from '@/components/reactbits/GlassSurface';

export default function ContactSection() {
  const { contact } = siteConfig;
  const directWhatsAppUrl = getWhatsAppUrl('Hi Shefeer, I would like to discuss a video editing project.');
  const directMailtoUrl = getMailtoUrl('Video Editing Project Inquiry — Shefeer Portfolio');

  return (
    <section id="contact" className="py-24 sm:py-32 relative bg-[#07070a] border-t border-white/10 overflow-hidden">
      {/* React Bits: CursorGrid interactive grid in background */}
      <CursorGrid cellSize={36} highlightRadius={140} dotColor="rgba(255, 255, 255, 0.05)" highlightColor="rgba(255, 85, 0, 0.4)" />

      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-accent/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left Column: Bold Headline & Direct Channels */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-accent uppercase mb-3">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>05 // INITIATE COLLABORATION</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-sans leading-tight">
                <ScrollReveal baseOpacity={0.3} enableBlur={true}>
                  HAVE FOOTAGE?
                </ScrollReveal>{' '}
                <br />
                LET&apos;S MAKE IT <br />
                <span className="text-accent underline decoration-white/10 underline-offset-8">
                  UNFORGETTABLE.
                </span>
              </h2>
            </div>

            <p className="text-base text-white/70 font-light leading-relaxed max-w-lg">
              Whether you need high-retention vertical cuts for a product launch, a creator channel needing consistent Reels & Shorts, or a cinematic brand film — let&apos;s talk rhythm, hook, and story.
            </p>

            {/* Direct Contact Cards with GlassSurface */}
            <div className="space-y-4 pt-2">
              {/* WhatsApp Card */}
              <GlassSurface intensity="medium" glowOnHover>
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group p-5 rounded-sm flex items-center justify-between transition-all duration-300 block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
                        FASTEST RESPONSE · WHATSAPP
                      </span>
                      <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors font-mono">
                        +91 79074 36032
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-accent group-hover:text-black group-hover:border-accent transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </a>
              </GlassSurface>

              {/* Email Card */}
              <GlassSurface intensity="medium" glowOnHover>
                <a
                  href={directMailtoUrl}
                  className="group p-5 rounded-sm flex items-center justify-between transition-all duration-300 block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-accent uppercase">
                        DIRECT EMAIL
                      </span>
                      <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors font-mono">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-accent group-hover:text-black group-hover:border-accent transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </a>
              </GlassSurface>
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-xs font-mono text-muted">
              <span>SOCIAL PROFILES:</span>
              <div className="flex items-center gap-4">
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-accent transition-colors"
                  aria-label="Shefeer on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-white/70 hover:text-accent transition-colors"
                  aria-label="Shefeer on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Builder */}
          <div className="lg:col-span-6">
            <InquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
