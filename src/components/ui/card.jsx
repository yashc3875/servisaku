import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'bg-surface text-ink rounded-xl transition-shadow duration-200 ease-spring-out',
  {
    variants: {
      tone: {
        flat:     'shadow-none hairline',
        elevated: 'shadow-e1 hover:shadow-e2',
        floating: 'shadow-e2',
        raised:   'bg-raised shadow-none',
        ghost:    'bg-transparent shadow-none',
      },
      pad: {
        none: 'p-0',
        sm:   'p-4',
        md:   'p-5',
        lg:   'p-6',
      },
      interactive: { true: 'cursor-pointer hover:-translate-y-[1px] active:translate-y-0' },
    },
    defaultVariants: { tone: 'elevated', pad: 'md' },
  },
);

const Card = React.forwardRef(({ className, tone, pad, interactive, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ tone, pad, interactive }), className)} {...props} />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-h3 text-ink leading-snug', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-caption text-ink-secondary', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-4 flex items-center gap-3', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
