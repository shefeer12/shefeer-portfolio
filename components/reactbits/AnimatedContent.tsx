'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

export interface AnimatedContentProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  distance?: number;
  reverse?: boolean;
  delay?: number;
  duration?: number;
  scale?: number;
  threshold?: number;
  className?: string;
}

export default function AnimatedContent({
  children,
  direction = 'vertical',
  distance = 30,
  reverse = false,
  delay = 0,
  duration = 0.6,
  scale = 1,
  threshold = 0.15,
  className = ''
}: AnimatedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const initialX = direction === 'horizontal' ? (reverse ? -distance : distance) : 0;
  const initialY = direction === 'vertical' ? (reverse ? -distance : distance) : 0;

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: initialX,
        y: initialY,
        scale: scale !== 1 ? scale : 1
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1
            }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
