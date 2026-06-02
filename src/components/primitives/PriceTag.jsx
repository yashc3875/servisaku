import React from 'react';
import { cn } from '@/lib/utils';

export function PriceTag({ amount, prefix, className }) {
  // Simple integer check to avoid .00 if possible, or format nicely
  const formatted = Number.isInteger(amount) ? amount : amount.toFixed(2);
  
  return (
    <div className={cn("inline-flex items-baseline gap-1", className)}>
      {prefix && <span className="text-caption text-ink-secondary">{prefix}</span>}
      <div className="font-bold tabular-nums text-ink">
        <span className="text-sm align-top mr-0.5 relative top-[0.1em]">RM</span>
        <span className="text-lead">{formatted}</span>
      </div>
    </div>
  );
}
