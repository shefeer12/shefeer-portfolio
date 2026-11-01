'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export default function Magnetic({
  children,
  strength = 0.3,
  className = ''
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring return physics
  const springX = useSpring(x, { stiffness: 350, damping: 25, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 350, damping: 25, mass: 0.5 });

  useEffect(() => {
    // Strictly desktop-only with fine pointer & no reduced motion
    const pointerFineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateCapability = () => {
      setCanAnimate(pointerFineQuery.matches && !motionQuery.matches);
    };

    updateCapability();

    pointerFineQuery.addEventListener('change', updateCapability);
    motionQuery.addEventListener('change', updateCapability);

    return () => {
      pointerFineQuery.removeEventListener('change', updateCapability);
      motionQuery.removeEventListener('change', updateCapability);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canAnimate || prefersReducedMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Displace button smoothly toward cursor within a safe max displacement (~12px)
    const maxDisplacement = 14;
    const targetX = Math.max(-maxDisplacement, Math.min(maxDisplacement, distanceX * strength));
    const targetY = Math.max(-maxDisplacement, Math.min(maxDisplacement, distanceY * strength));

    x.set(targetX);
    y.set(targetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!canAnimate || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
