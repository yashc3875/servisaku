import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-raised text-ink',
        brand:   'bg-brand-tint text-brand-ink',
        accent:  'bg-accent-tint text-accent',
        success: 'bg-success-tint text-success',
        warning: 'bg-warning-tint text-warning',
        danger:  'bg-danger-tint  text-danger',
        info:    'bg-info-tint    text-info',
        outline: 'hairline text-ink',
        /* shadcn back-compat */
        default:     'bg-brand-tint text-brand-ink',
        secondary:   'bg-raised text-ink',
        destructive: 'bg-danger-tint text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

function Badge({ className, tone, variant, ...props }) {
  // accept legacy `variant` prop transparently
  const t = tone ?? variant;
  return <div className={cn(badgeVariants({ tone: t }), className)} {...props} />;
}

export { Badge, badgeVariants };
