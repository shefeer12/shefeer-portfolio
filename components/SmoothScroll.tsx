'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollProps {
  isPaused?: boolean;
}

export default function SmoothScroll({ isPaused = false }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Check prefers-reduced-motion: if user prefers reduced motion, do not initialize smooth scroll
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      return;
    }

    // 2. Initialize Lenis: wheel only, native touch preserved
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // Touch gestures stay completely native
      touchMultiplier: 1,
      wheelMultiplier: 0.9,
      autoRaf: true
    });

    lenisRef.current = lenis;

    // Expose lenis globally on window for programmatic access if needed
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // 3. Smooth anchor scrolling for navigation and CTA buttons
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const id = href.slice(1);
        const element = document.getElementById(id) || document.querySelector(href);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, {
            offset: -40,
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.destroy();
        lenisRef.current = null;
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // 4. Pause / resume Lenis when modal is opened / closed
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isPaused) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isPaused]);

  return null;
}
