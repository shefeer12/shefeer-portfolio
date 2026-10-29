'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface TiltedCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  scaleOnHover?: number;
  glare?: boolean;
  glareOpacity?: number;
  onClick?: () => void;
  className?: string;
}

export default function TiltedCard({
  children,
  maxTilt = 8,
  scaleOnHover = 1.02,
  glare = true,
  glareOpacity = 0.2,
  onClick,
  className = ''
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsPointerFine(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPointerFine || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scaleOnHover})`
    );

    if (glare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: glareOpacity
      });
    }
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative transition-transform duration-200 ease-out will-change-transform', className)}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d'
      }}
    >
      {children}

      {/* Glare Sheen Overlay */}
      {glare && isPointerFine && (
        <div
          className="pointer-events-none absolute inset-0 rounded-sm overflow-hidden transition-opacity duration-300"
          style={{ opacity: glarePosition.opacity }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
            style={{
              transform: `translate(${glarePosition.x - 50}%, ${glarePosition.y - 50}%)`,
              mixBlendMode: 'overlay'
            }}
          />
        </div>
      )}
    </div>
  );
}
