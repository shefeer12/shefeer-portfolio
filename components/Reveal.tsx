'use client';

import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  staggerIndex?: number;
  className?: string;
  width?: 'fit-content' | '100%';
  margin?: string;
}

// Unified timing requested in Prompt 10: translateY ~16px + opacity, 0.8s, expo/power4 out (ease: [0.16, 1, 0.3, 1])
export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
export const REVEAL_DURATION = 0.8;
export const REVEAL_STAGGER = 0.05;

export default function Reveal({
  children,
  delay = 0,
  staggerIndex = 0,
  className = '',
  width = '100%',
  margin = '180px 0px -20px 0px'
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    // Positive margin so reveal triggers smoothly before/as element approaches viewport
    margin: margin as any
  });
  const prefersReducedMotion = useReducedMotion();

  const computedDelay = delay + staggerIndex * REVEAL_STAGGER;

  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{ width: width === 'fit-content' ? 'fit-content' : undefined }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: REVEAL_DURATION,
        delay: computedDelay,
        ease: REVEAL_EASE
      }}
      className={className}
      style={{ width: width === 'fit-content' ? 'fit-content' : undefined }}
    >
      {children}
    </motion.div>
  );
}
