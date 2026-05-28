import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Shield, LogOut, ChevronRight, Star, Wrench, Users, Edit3, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  if (!user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
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
    <div className="font-inter min-h-screen bg-background pb-8">

      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-[#0a3d28] to-[#1a6644] px-5 pt-14 pb-10 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mb-4 ring-4 ring-white/20">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{user.full_name}</h2>
          <p className="text-white/50 text-sm mt-1">{user.email}</p>
          {user.role !== 'consumer' && (
            <span className="mt-3 inline-flex items-center bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full capitalize">
              {user.role.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Menu groups */}
      <div className="px-5 -mt-4 space-y-5">
        {menuGroups.map((group, gi) => (
          <div key={gi}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">{group.title}</p>
            <div className="bg-white rounded-2xl border border-border/60 shadow-xs overflow-hidden">
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link key={i} to={item.to}
                    className="flex items-center gap-4 px-5 py-4 border-b border-border/40 last:border-0 hover:bg-muted/30 active:bg-muted/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-foreground/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.sub && <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-xs overflow-hidden">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-4 px-5 py-4 w-full hover:bg-red-50 active:bg-red-100 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm font-semibold text-destructive flex-1 text-left">Sign Out</span>
          </button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 pt-2">
          ServisAku v1.0 &nbsp;·&nbsp; Klang Valley, Malaysia
        </p>
      </div>
    </div>
  );
}