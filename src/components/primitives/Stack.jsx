import React from 'react';
import { cn } from '@/lib/utils';

export function VStack({ gap = 4, align = 'stretch', justify = 'start', className, children, ...props }) {
  const gapMap = {
    1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 
    6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12'
  };
  
  const alignMap = {
    start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch'
  };
  
  const justifyMap = {
    start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between'
  };

  return (
    <div className={cn('flex flex-col', gapMap[gap], alignMap[align], justifyMap[justify], className)} {...props}>
      {children}
    </div>
  );
}

export function HStack({ gap = 4, align = 'center', justify = 'start', className, wrap = false, children, ...props }) {
  const gapMap = {
    1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4', 
    6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12'
  };
  
  const alignMap = {
    start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch'
  };
  
  const justifyMap = {
    start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between'
  };

  return (
    <div className={cn('flex flex-row', gapMap[gap], alignMap[align], justifyMap[justify], wrap ? 'flex-wrap' : '', className)} {...props}>
      {children}
    </div>
  );
}
