import * as React from 'react';
import { cn } from '@/lib/utils';

const GAP = {
  0: 'gap-0',  1: 'gap-1',  2: 'gap-2',  3: 'gap-3',  4: 'gap-4',
  5: 'gap-5',  6: 'gap-6',  7: 'gap-7',  8: 'gap-8',  10: 'gap-10',
  12: 'gap-12', 16: 'gap-16', 20: 'gap-20',
};

const ALIGN = {
  start: 'items-start', center: 'items-center', end: 'items-end',
  baseline: 'items-baseline', stretch: 'items-stretch',
};

const JUSTIFY = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
};

export const VStack = React.forwardRef(
  ({ as: Tag = 'div', gap = 4, align, justify, className, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        'flex flex-col',
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...props}
    />
  ),
);
VStack.displayName = 'VStack';

export const HStack = React.forwardRef(
  ({ as: Tag = 'div', gap = 3, align = 'center', justify, wrap, className, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        'flex',
        wrap ? 'flex-wrap' : '',
        GAP[gap],
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      {...props}
    />
  ),
);
HStack.displayName = 'HStack';

export const Inline = HStack;
