import * as React from 'react';
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * <TrustChip icon="ShieldCheck" label="Insured RM2M" tone="success" />
 */
export function TrustChip({ icon, label, tone = 'neutral', className }) {
  const Icon = (icon && Lucide[icon]) || Lucide.ShieldCheck;
  const toneCls = {
    neutral: 'bg-raised text-ink',
    brand:   'bg-brand-tint text-brand-ink',
    success: 'bg-success-tint text-success',
    info:    'bg-info-tint text-info',
  }[tone];
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-micro font-semibold', toneCls, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
