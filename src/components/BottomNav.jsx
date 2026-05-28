import { Link, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/',         icon: Home,         label: 'Home'     },
  { path: '/explore',  icon: Search,       label: 'Explore'  },
  { path: '/bookings', icon: CalendarDays, label: 'Bookings' },
  { path: '/profile',  icon: User,         label: 'Profile'  },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Frosted glass bar */}
        <div
          className="bg-white/90 backdrop-blur-2xl mx-3 mb-2 rounded-2xl"
          style={{ boxShadow: '0 8px 40px -4px rgb(0 0 0 / 0.14), 0 0 0 1px rgb(0 0 0 / 0.05)' }}
        >
          <div className="flex items-center justify-around px-2" style={{ height: '3.75rem' }}>
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 tap-sm',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                    active ? 'bg-primary/10 scale-105' : 'scale-100',
                  )}>
                    <Icon className={cn('h-[1.1rem] w-[1.1rem]', active ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
                  </div>
                  <span className={cn('text-[9.5px] tracking-wide', active ? 'font-700 text-primary' : 'font-500')}
                    style={{ fontWeight: active ? 700 : 500 }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}