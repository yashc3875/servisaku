import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Plus, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/',              icon: Home,          label: 'Home'    },
  { path: '/bookings',      icon: CalendarDays,  label: 'Trips'   },
  { path: '/explore',       icon: Plus,          label: 'Book',   isFab: true },
  { path: '/notifications', icon: MessageCircle, label: 'Inbox'   },
  { path: '/profile',       icon: User,          label: 'Account' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Frosted glass bar */}
      <div
        className="bg-white/90 backdrop-blur-2xl mx-4 mb-2 rounded-2xl"
        style={{ boxShadow: '0 8px 40px -4px rgb(0 0 0 / 0.14), 0 0 0 1px rgb(0 0 0 / 0.05)' }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {NAV_ITEMS.map(({ path, icon: Icon, label, isFab }) => {
            const active = path === '/' ? pathname === '/' : pathname.startsWith(path);

            /* ── Center FAB ── */
            if (isFab) {
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full bg-brand text-ink-inverse shadow-e3 -mt-5 flex items-center justify-center transition-transform duration-200 active:scale-95">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-medium text-ink-tertiary mt-0.5">{label}</span>
                </Link>
              );
            }

            /* ── Standard tab ── */
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors duration-200 tap-sm',
                  active ? 'text-brand' : 'text-ink-tertiary',
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'stroke-[2.2]' : 'stroke-[1.6]')} />
                <span className="text-[10px] font-medium">{label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-brand mt-0.5" />}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}