import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  [
    'inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-caption font-medium',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-spring-out',
    'active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-ring',
    '[&_svg]:size-3.5 [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      tone: {
        neutral: 'bg-raised text-ink hover:bg-raised/70',
        brand:   'bg-brand-tint text-brand-ink hover:bg-brand-tint/80',
        accent:  'bg-accent-tint text-accent hover:bg-accent-tint/80',
        outline: 'hairline text-ink hover:bg-raised',
      },
      selected: { true: 'ring-2 ring-brand/40' },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export const Chip = React.forwardRef(
  ({ className, tone, selected, as: Tag = 'button', leftIcon, children, ...props }, ref) => (
    <Tag
      ref={ref}
      type={Tag === 'button' ? 'button' : undefined}
      className={cn(chipVariants({ tone, selected }), className)}
      data-selected={selected || undefined}
      {...props}
    >
      {leftIcon}
      {children}
    </Tag>
  ),
);
Chip.displayName = 'Chip';
