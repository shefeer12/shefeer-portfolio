'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps {
  children: React.ReactNode;
  baseOpacity?: number;
  enableBlur?: boolean;
  blurStrength?: number;
  baseRotation?: number;
  staggerDuration?: number;
  className?: string;
  textClassName?: string;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0.15,
  enableBlur = true,
  blurStrength = 4,
  baseRotation = 2,
  staggerDuration = 0.04,
  className = '',
  textClassName = ''
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10% 0px -10% 0px' });

  // If children is a string, split into words
  if (typeof children === 'string') {
    const words = children.split(' ');

    return (
      <div ref={containerRef} className={cn('inline-block leading-tight', className)}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{
              opacity: baseOpacity,
              filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
              rotateX: baseRotation,
              y: 8
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    filter: 'blur(0px)',
                    rotateX: 0,
                    y: 0
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: index * staggerDuration,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className={cn('inline-block mr-[0.28em] origin-bottom', textClassName)}
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  // Non-string fallback
  return (
    <motion.div
      ref={containerRef}
      initial={{
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
        y: 12
      }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(className, textClassName)}
    >
      {children}
    </motion.div>
  );
}
