import { cn } from '@/lib/utils';

/**
 * Reusable empty/error/offline state component.
 * Usage:
 *   <EmptyState icon="📋" title="No bookings yet" desc="Your bookings will appear here" />
 *   <EmptyState type="error" onRetry={refetch} />
 *   <EmptyState type="offline" />
 */
export default function EmptyState({
  type = 'empty',      // 'empty' | 'error' | 'offline' | 'search'
  icon,
  title,
  desc,
  action,
  onAction,
  onRetry,
  className,
}) {
  const presets = {
    empty:   { icon: icon || '📭', title: title || 'Nothing here yet',        desc: desc || 'Items will appear here once available.' },
    error:   { icon: '⚠️',        title: title || 'Something went wrong',     desc: desc || 'We had trouble loading this data.',  action: 'Try Again',   handler: onRetry },
    offline: { icon: '📡',        title: title || 'You\'re offline',           desc: desc || 'Check your connection and try again.', action: 'Retry',     handler: onRetry || (() => window.location.reload()) },
    search:  { icon: '🔍',        title: title || 'No results found',         desc: desc || 'Try adjusting your search or filters.' },
  };

  const p = presets[type] || presets.empty;
  const btnLabel = action || p.action;
  const btnHandler = onAction || p.handler;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-3xl">
        {p.icon}
      </div>
      <p className="text-sm font-bold mb-1">{p.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">{p.desc}</p>
      {btnLabel && btnHandler && (
        <button
          onClick={btnHandler}
          className="mt-4 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
}