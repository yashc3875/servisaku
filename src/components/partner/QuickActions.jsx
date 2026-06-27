import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Grid of quick-action shortcuts. Each action: { icon, label, to?, onClick?, badge? }.
export function QuickActions({ actions, className }) {
  return (
    <div className={cn('grid grid-cols-4 gap-3', className)}>
      {actions.map((a) => {
        const inner = (
          <>
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-tint text-brand transition-colors group-hover:bg-brand group-hover:text-white">
              <a.icon className="h-5 w-5" />
              {a.badge ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                  {a.badge}
                </span>
              ) : null}
            </div>
            <span className="mt-2 block text-center text-[11px] font-semibold text-ink-secondary">{a.label}</span>
          </>
        );

        const cls = 'group';
        if (a.to) {
          return <Link key={a.label} to={a.to} className={cls}>{inner}</Link>;
        }
        return (
          <button key={a.label} type="button" onClick={a.onClick} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
