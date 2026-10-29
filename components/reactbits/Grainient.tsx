'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface GrainientProps {
  className?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  opacity?: number;
}

export default function Grainient({
  className = '',
  colorA = '#070709', // Near-black canvas
  colorB = '#1c0d05', // Deep dark amber/charcoal
  colorC = '#ff5500', // Restrained vibrant orange
  opacity = 0.4
}: GrainientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for flowing ambient gradients
    let time = 0;
    const mouse = { x: width * 0.7, y: height * 0.4, targetX: width * 0.7, targetY: height * 0.4 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!prefersReducedMotion) {
        time += 0.006;
        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;
      }

      ctx.clearRect(0, 0, width, height);

      // Base background
      ctx.fillStyle = colorA;
      ctx.fillRect(0, 0, width, height);

      // Radial Blob 1: Deep Amber glow drifting
      const x1 = width * 0.3 + Math.sin(time) * 80;
      const y1 = height * 0.4 + Math.cos(time * 0.8) * 60;
      const r1 = Math.min(width, height) * 0.6;
      const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      grad1.addColorStop(0, colorB);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Radial Blob 2: Restrained Orange accent responding subtly to cursor
      const r2 = Math.min(width, height) * 0.45;
      const grad2 = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r2);
      grad2.addColorStop(0, 'rgba(255, 85, 0, 0.22)');
      grad2.addColorStop(0.5, 'rgba(255, 85, 0, 0.06)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Overlay film grain noise
      const grainSize = 120;
      const grainCanvas = document.createElement('canvas');
      grainCanvas.width = grainSize;
      grainCanvas.height = grainSize;
      const gCtx = grainCanvas.getContext('2d');
      if (gCtx) {
        const imgData = gCtx.createImageData(grainSize, grainSize);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.random() * 255;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = 14; // Subtle 5% opacity grain
        }
        gCtx.putImageData(imgData, 0, 0);
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [colorA, colorB, colorC]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 w-full h-full select-none', className)}
      style={{ opacity }}
    />
  );
}
