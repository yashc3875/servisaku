import React from 'react';
import { cn } from '@/lib/utils';
import { HStack, VStack } from './Stack';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Section({ title, subtitle, action, children, className }) {
  return (
    <VStack gap={4} className={cn("w-full", className)}>
      {(title || action) && (
        <HStack justify="between" align="center" className="px-5">
          <VStack gap={1}>
            {title && <h2 className="text-h2 text-ink">{title}</h2>}
            {subtitle && <p className="text-caption text-ink-secondary">{subtitle}</p>}
          </VStack>
          {action && <div>{action}</div>}
        </HStack>
      )}
      <div className="w-full">
        {children}
      </div>
    </VStack>
  );
}

export function SeeAllLink({ to, label = "See All" }) {
  return (
    <Link to={to} className="flex items-center gap-1 text-brand font-semibold text-caption group">
      {label} <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
