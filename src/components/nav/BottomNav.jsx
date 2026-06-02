import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Calendar, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Compass, label: 'Explore', to: '/explore' },
  { icon: Search, label: 'Book', to: '/explore', isFab: true },
  { icon: Calendar, label: 'Bookings', to: '/bookings', auth: true },
  { icon: User, label: 'Profile', to: '/profile/edit', auth: true },
];

export function BottomNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-hairline pb-safe pt-2 px-4 shadow-float">
      <div className="max-w-md mx-auto flex justify-between items-center relative">
        {NAV_ITEMS.map((item) => {
          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={() => navigate(item.to)}
                className="relative -top-5 size-14 rounded-full bg-brand text-ink-inverse shadow-e3 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              >
                <item.icon className="size-6" />
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.auth && !user ? '/otp-login' : item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 min-w-[64px] transition-colors',
                  isActive ? 'text-brand' : 'text-ink-secondary hover:text-ink'
                )
              }
            >
              <item.icon className="size-5" />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
