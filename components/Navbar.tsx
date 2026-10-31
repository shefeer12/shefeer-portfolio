'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import VariableProximity from '@/components/reactbits/VariableProximity';
import GlassSurface from '@/components/reactbits/GlassSurface';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY <= 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY + 12) {
        // Scrolling down -> hide navbar to focus on video content
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 12) {
        // Scrolling up -> restore navbar for effortless navigation
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-transform duration-300 ease-out ${
        isVisible || isOpen ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-[#070709]/85 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="site-container flex items-center justify-between">
        {/* Brand Wordmark positioned near left responsive gutter */}
        <a
          href="#home"
          className="group flex items-center gap-2 focus:outline-none flex-shrink-0"
          aria-label="Shefeer portfolio home"
        >
          <div className="flex items-baseline">
            <VariableProximity
              label={siteConfig.brandName}
              fromFontWeight={800}
              toFontWeight={900}
              radius={70}
              className="text-2xl sm:text-3xl font-black tracking-tighter text-white font-sans"
            />
            <span className="text-2xl sm:text-3xl font-black text-accent">.</span>
          </div>
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-widest font-mono text-muted pl-2 border-l border-white/15">
            Video Editor
          </span>
        </a>

        {/* Desktop Navigation Links horizontally balanced */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-10 text-xs font-mono tracking-wider uppercase">
          <a
            href="#work"
            className="text-white/70 hover:text-accent transition-colors py-1 flex items-center gap-1.5"
          >
            Work <span className="text-[9px] text-white/30">01</span>
          </a>
          <a
            href="#services"
            className="text-white/70 hover:text-accent transition-colors py-1 flex items-center gap-1.5"
          >
            Services <span className="text-[9px] text-white/30">02</span>
          </a>
          <a
            href="#about"
            className="text-white/70 hover:text-accent transition-colors py-1 flex items-center gap-1.5"
          >
            About <span className="text-[9px] text-white/30">03</span>
          </a>
          <a
            href="#process"
            className="text-white/70 hover:text-accent transition-colors py-1 flex items-center gap-1.5"
          >
            Process <span className="text-[9px] text-white/30">04</span>
          </a>
          <a
            href="#contact"
            className="text-white/70 hover:text-accent transition-colors py-1 flex items-center gap-1.5"
          >
            Contact <span className="text-[9px] text-white/30">05</span>
          </a>
        </nav>

        {/* Right CTA positioned near right responsive gutter */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          <GlassSurface intensity="subtle" glowOnHover>
            <a
              href="#contact"
              className="group flex items-center gap-2 px-5 py-2.5 text-white hover:text-black hover:bg-accent text-xs font-mono tracking-wider uppercase transition-all duration-200"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </GlassSurface>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <a
            href="#contact"
            className="px-3 py-1.5 rounded-sm bg-accent text-black text-[11px] font-mono tracking-wider font-semibold uppercase"
          >
            Let&apos;s Talk
          </a>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white/80 hover:text-white rounded-md bg-white/5 border border-white/10"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#070709]/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 text-sm font-mono tracking-wider uppercase">
            <a
              href="#work"
              onClick={closeMenu}
              className="py-2.5 border-b border-white/5 flex items-center justify-between text-white hover:text-accent"
            >
              <span>Work</span>
              <span className="text-xs text-muted">01</span>
            </a>
            <a
              href="#services"
              onClick={closeMenu}
              className="py-2.5 border-b border-white/5 flex items-center justify-between text-white hover:text-accent"
            >
              <span>Services</span>
              <span className="text-xs text-muted">02</span>
            </a>
            <a
              href="#about"
              onClick={closeMenu}
              className="py-2.5 border-b border-white/5 flex items-center justify-between text-white hover:text-accent"
            >
              <span>About</span>
              <span className="text-xs text-muted">03</span>
            </a>
            <a
              href="#process"
              onClick={closeMenu}
              className="py-2.5 border-b border-white/5 flex items-center justify-between text-white hover:text-accent"
            >
              <span>Process</span>
              <span className="text-xs text-muted">04</span>
            </a>
            <a
              href="#contact"
              onClick={closeMenu}
              className="py-2.5 border-b border-white/5 flex items-center justify-between text-white hover:text-accent"
            >
              <span>Contact</span>
              <span className="text-xs text-muted">05</span>
            </a>

            <div className="pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{siteConfig.bio.availability}</span>
              </div>
              <a
                href="#contact"
                onClick={closeMenu}
                className="w-full text-center py-3 bg-accent text-black font-semibold text-xs tracking-wider uppercase rounded-sm"
              >
                Start a Project
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
