'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface MasonryProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export default function Masonry<T extends { id: string | number }>({
  items,
  renderItem,
  columns = { default: 1, sm: 2, md: 3, lg: 3 },
  gap = 24,
  className = ''
}: MasonryProps<T>) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start',
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.id} className="w-full">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
