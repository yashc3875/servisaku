import React from 'react';
import { cn } from '@/lib/utils';

export function Chip({ selected, tone = 'neutral', className, children, onClick }) {
  const tones = {
    neutral: selected ? 'bg-ink text-ink-inverse' : 'bg-surface border border-hairline text-ink-secondary hover:bg-raised hover:text-ink',
    brand: selected ? 'bg-brand text-brand-ink' : 'bg-surface border border-hairline text-ink-secondary hover:bg-brand-tint hover:text-brand',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold transition-colors active:scale-95 whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {children}
    </button>
  );
}
