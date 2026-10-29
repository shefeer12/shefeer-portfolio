'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface CursorGridProps {
  className?: string;
  cellSize?: number;
  highlightRadius?: number;
  dotColor?: string;
  highlightColor?: string;
}

export default function CursorGrid({
  className = '',
  cellSize = 32,
  highlightRadius = 120,
  dotColor = 'rgba(255, 255, 255, 0.06)',
  highlightColor = 'rgba(255, 85, 0, 0.35)'
}: CursorGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove, { passive: true });
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.floor(width / cellSize) + 1;
      const rows = Math.floor(height / cellSize) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * cellSize;
          const y = j * cellSize;

          const dist = Math.hypot(x - mouse.x, y - mouse.y);

          if (dist < highlightRadius) {
            const intensity = 1 - dist / highlightRadius;
            ctx.fillStyle = highlightColor;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + intensity * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [cellSize, highlightRadius, dotColor, highlightColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 w-full h-full select-none opacity-60', className)}
    />
  );
}
