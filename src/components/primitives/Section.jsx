import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * <Section title="Trending in KL" subtitle="This week" action={<SeeAllLink to="/explore" />}>
 *   ...children
 * </Section>
 */
export function Section({
  title,
  subtitle,
  action,
  gap = 4,
  className,
  headerClassName,
  children,
}) {
  const gapCls =
    { 3: 'mt-3', 4: 'mt-4', 5: 'mt-5', 6: 'mt-6', 8: 'mt-8' }[gap] ?? 'mt-4';
  return (
    <section className={cn('w-full', className)}>
      {(title || action) && (
        <div className={cn('flex items-end justify-between gap-4', headerClassName)}>
          <div className="min-w-0">
            {title && <h2 className="text-h2 text-ink truncate">{title}</h2>}
            {subtitle && <p className="text-caption text-ink-secondary mt-1">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(title ? gapCls : '')}>{children}</div>
    </section>
  );
}

export function SeeAllLink({ to, children = 'See all' }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-caption font-semibold text-brand hover:text-brand-ink transition-colors"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
