import { Link, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, User, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';

const LOGO_URL = 'https://media.base44.com/images/public/6a1572582a8e67fb23e0b043/78a64b098_ChatGPTImageMay27202612_28_08PM.png';

const NAV_ITEMS = [
  { path: '/',         icon: Home,         label: 'Home'     },
  { path: '/explore',  icon: Search,       label: 'Explore'  },
  { path: '/bookings', icon: CalendarDays, label: 'Bookings' },
  { path: '/profile',  icon: User,         label: 'Profile'  },
];

export default function SideNav() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isPartner = user?.role === 'partner';

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-border/60 z-40 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="ServisAku" className="h-10 w-10 object-contain rounded-xl" />
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">
              <span className="text-primary">Servis</span><span className="text-orange-500">Aku</span>
            </p>
            <p className="text-[9px] text-muted-foreground font-medium">Servis Rumah, Hidup Lebih Mudah</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}>
              <Icon className="h-4.5 w-4.5 shrink-0" style={{ height: '1.1rem', width: '1.1rem' }} />
              {label}
            </Link>
          );
        })}

        {isPartner && (
          <Link to="/partner"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
              pathname.startsWith('/partner')
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}>
            <Shield className="h-4.5 w-4.5 shrink-0" style={{ height: '1.1rem', width: '1.1rem' }} />
            Partner Dashboard
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
              pathname.startsWith('/admin')
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}>
            <Shield className="h-4.5 w-4.5 shrink-0" style={{ height: '1.1rem', width: '1.1rem' }} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-4 py-4 border-t border-border/40">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{user.full_name?.charAt(0) || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <button onClick={() => base44.auth.logout()}
              className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}