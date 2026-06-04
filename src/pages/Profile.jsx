import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield, LogOut, ChevronRight, Star, Wrench, Users, Edit3, Bell } from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import { motion } from 'framer-motion';
import { variants, safeMotion } from '@/lib/design/motion';
import ThemeToggle from '@/components/ThemeToggle';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => { servisaku.auth.me().then(setUser); }, []);

  if (!user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-6 h-6 border-2 border-raised border-t-brand rounded-full animate-spin" />
    </div>
  );

  const menuGroups = [
    {
      title: 'Account',
      items: [
        { icon: Edit3, label: 'Edit Profile', sub: 'Name, phone, preferences', to: '/profile/edit' },
        { icon: Bell,   label: 'Notifications', sub: 'Push, email, SMS settings', to: '/notifications' },
        { icon: Shield, label: 'Privacy & Security', sub: 'Password, data, sessions', to: '#' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: Star, label: 'My Reviews', sub: 'Ratings you\'ve submitted', to: '/bookings' },
        { icon: Settings, label: 'App Settings', sub: 'Language, region', to: '#' },
      ],
    },
  ];

  if (user.role === 'partner') {
    menuGroups.unshift({
      title: 'Partner',
      items: [
        { icon: Wrench, label: 'Partner Dashboard', sub: 'Jobs, earnings, status', to: '/partner' },
      ],
    });
  }
  if (user.role === 'admin' || user.role === 'super_admin') {
    menuGroups.unshift({
      title: 'Administration',
      items: [
        { icon: Settings, label: 'Admin Dashboard', sub: 'Overview & KPIs', to: '/admin' },
        { icon: Users, label: 'User Management', sub: 'Manage partners & consumers', to: '/admin/users' },
      ],
    });
  }

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <motion.div {...safeMotion(variants.fadeUp)} className="font-inter min-h-screen bg-bg pb-8">

      {/* Hero header — clean neutral card */}
      <div className="bg-bg pt-14 lg:pt-6 pb-8 px-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-tint flex items-center justify-center ring-4 ring-brand/10 mb-4">
            <span className="text-2xl font-bold text-brand-ink">{initials}</span>
          </div>
          <h2 className="text-xl font-bold text-ink tracking-tight">{user.full_name}</h2>
          <p className="text-ink-tertiary text-sm mt-1">{user.email}</p>
          {user.role !== 'consumer' && (
            <span className="mt-3 inline-flex items-center bg-brand-tint text-brand-ink text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full capitalize">
              {user.role.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Menu groups */}
      <div className="px-5 space-y-5">
        {menuGroups.map((group, gi) => (
          <div key={gi}>
            <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest mb-2 px-1">{group.title}</p>
            <div className="bg-surface rounded-2xl border border-hairline/10 shadow-e1 overflow-hidden">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link key={i} to={item.to}
                    className="flex items-center gap-4 px-5 py-4 border-b border-hairline/10 last:border-0 hover:bg-raised/60 active:bg-raised/80 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-ink/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{item.label}</p>
                      {item.sub && <p className="text-xs text-ink-secondary mt-0.5">{item.sub}</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-secondary shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Appearance */}
        <div>
          <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-widest mb-2 px-1">Appearance</p>
          <div className="bg-surface rounded-2xl border border-hairline/10 shadow-e1 p-2">
             <ThemeToggle />
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-surface rounded-2xl border border-hairline/10 shadow-e1 overflow-hidden">
          <button
            onClick={() => servisaku.auth.logout()}
            className="flex items-center gap-4 px-5 py-4 w-full hover:bg-red-50 active:bg-red-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-semibold text-destructive flex-1 text-left">Sign Out</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-ink-tertiary pt-2">
          ServisAku v1.0 &nbsp;·&nbsp; Klang Valley, Malaysia
        </p>
      </div>
    </motion.div>
  );
}