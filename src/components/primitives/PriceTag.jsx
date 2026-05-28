import * as React from 'react';
import { cn, formatMYR } from '@/lib/utils';

/**
 * <PriceTag amount={89} from />        → "From RM89"
 * <PriceTag amount={129} decimals />   → "RM129.00"
 * <PriceTag amount={89} size="lg" />   → larger numeric weight
 */
export function PriceTag({
  amount,
  from = false,
  decimals = false,
  size = 'md',
  tone = 'ink',
  className,
  suffix,
}) {
  const sizeCls = {
    sm: 'text-caption',
    md: 'text-body',
    lg: 'text-lead font-semibold',
    xl: 'text-h2',
  }[size];

  const toneCls = {
    ink:    'text-ink',
    brand:  'text-brand-ink',
    accent: 'text-accent',
    muted:  'text-ink-secondary',
  }[tone];

  return (
    <span className={cn('inline-flex items-baseline gap-1 tabular-nums', sizeCls, toneCls, className)}>
      {from && <span className="text-caption text-ink-tertiary font-medium">From</span>}
      <span className="font-semibold">{formatMYR(amount, { decimals })}</span>
      {suffix && <span className="text-caption text-ink-tertiary font-normal">{suffix}</span>}
    </span>
  );
}
