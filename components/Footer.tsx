'use client';

import React from 'react';
import { ArrowUp, Instagram, Linkedin, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050508] border-t border-white/10 py-12 text-xs font-mono text-muted">
      <div className="site-container space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="space-y-1 text-center md:text-left">
            <a
              href="#home"
              className="text-2xl font-black tracking-tighter text-white font-sans inline-block hover:opacity-90 transition-opacity"
            >
              {siteConfig.brandName}
              <span className="text-accent">.</span>
            </a>
            <p className="text-[11px] text-white/50 tracking-wider">
              {siteConfig.fullName} · {siteConfig.profession} · Kochi, Kerala, India
            </p>
          </div>

          {/* Quick Nav Anchor Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-white/70">
            <a href="#work" className="hover:text-accent transition-colors">
              Work
            </a>
            <a href="#services" className="hover:text-accent transition-colors">
              Services
            </a>
            <a href="#about" className="hover:text-accent transition-colors">
              About
            </a>
            <a href="#process" className="hover:text-accent transition-colors">
              Process
            </a>
            <a href="#contact" className="hover:text-accent transition-colors">
              Contact
            </a>
          </nav>

          {/* Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:border-accent hover:text-white transition"
            aria-label="Back to top of page"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-accent" />
          </button>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/40">
          <p>© {currentYear} {siteConfig.brandName}. ALL RIGHTS RESERVED. STORIES THAT CONNECT.</p>

          <div className="flex items-center gap-4">
            <a
              href={siteConfig.contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={siteConfig.contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="hover:text-accent transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
