import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, ArrowRight, Star, Shield, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { base44 } from '@/api/base44Client';
import ServiceCard from '../components/ServiceCard';
import BookingCard from '../components/BookingCard';
import { SERVICES } from '@/lib/services';

/* ── Promo banners ─────────────────────────────────────────────────────── */
const PROMOS = [
  {
    title: 'First booking?',
    subtitle: 'Get 20% off with code FIXMATE20',
    gradient: 'from-[#0f4c35] via-[#166a48] to-[#1a7a52]',
    badge: 'New User Offer',
    emoji: '✨',
  },
  {
    title: 'Refer a friend',
    subtitle: 'Earn RM30 credit for every referral',
    gradient: 'from-amber-600 via-amber-500 to-orange-400',
    badge: 'Referral Program',
    emoji: '🎁',
  },
];

/* ── Trust pillars ─────────────────────────────────────────────────────── */
const TRUST = [
  { icon: Shield, label: 'Vetted Pros',     sub: 'Background checked' },
  { icon: Star,   label: '4.9 Stars',       sub: '10k+ reviews'       },
  { icon: Zap,    label: 'Guaranteed',      sub: '100% satisfaction'  },
];

function GreetingSkeleton() {
  return (
    <div className="animate-pulse space-y-2 pt-14 pb-4 px-5">
      <div className="h-3 w-24 bg-muted rounded-full" />
      <div className="h-6 w-36 bg-muted rounded-full" />
    </div>
  );
}

export default function Home() {
  const [user, setUser]                   = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const bookings = await base44.entities.Booking.filter(
          { consumer_email: me.email }, '-created_date', 3,
        );
        setRecentBookings(bookings);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  };

  const filteredServices = SERVICES.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="font-inter bg-background min-h-screen">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-2xl border-b border-border/30">
        <div className="px-5 lg:px-8 pt-12 lg:pt-6 pb-4">
          {loading ? <GreetingSkeleton /> : (
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{greeting()} 👋</p>
                <h1 className="text-2xl font-bold tracking-tight mt-0.5">
                  {user?.full_name?.split(' ')[0] || 'Welcome'}
                </h1>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-1.5 bg-white border border-border shadow-xs text-xs font-medium text-muted-foreground px-3 py-2 rounded-xl">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {user?.city || 'Klang Valley'}
                </button>
                <NotificationBell userEmail={user?.email} />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search services…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none
                         shadow-xs placeholder:text-muted-foreground/70
                         focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="px-5 lg:px-8 xl:px-10 pt-6 space-y-10">

        {/* Search results */}
        {searchQuery !== '' && (
          <div className="page-enter">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2.5">
              {filteredServices.map(s => {
                const Icon = s.icon;
                return (
                  <Link key={s.id} to={`/service/${s.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl border border-border/60 p-4 shadow-xs
                               hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.price}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-semibold text-sm">No services found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        )}

        {searchQuery === '' && (
          <>
            {/* ── Hero card ──────────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#0a3d28] via-[#0f4c35] to-[#1a6644] rounded-3xl p-6 overflow-hidden shadow-float">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute top-4 right-16 w-1.5 h-1.5 rounded-full bg-emerald-300/50" />
              <div className="absolute top-10 right-10 w-2.5 h-2.5 rounded-full bg-emerald-400/30" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-[10px] font-bold
                                 uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
                  ⭐ Most Popular
                </span>
                <h2 className="text-white text-2xl font-bold tracking-tight leading-tight mb-1.5">
                  Home Cleaning<br/>from <span className="text-emerald-300">RM89</span>
                </h2>
                <p className="text-white/55 text-sm mb-5">Insured professionals · Same-day available</p>
                <Link to="/service/home-cleaning"
                  className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold
                             px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02]
                             active:scale-[0.98] transition-all duration-200">
                  Book Now <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* ── Services ────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Our Services</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Professional home care</p>
                </div>
                <Link to="/explore"
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                  See all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {SERVICES.map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            </section>

            {/* ── Popular carousel ────────────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Popular in KL</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Trending this week
                  </p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
                {SERVICES.map(s => <ServiceCard key={s.id} service={s} size="lg" />)}
              </div>
            </section>

            {/* ── Trust strip ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {TRUST.map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-border/60 py-4 px-2 shadow-xs text-center">
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.08)' }}>
                    <t.icon className="h-4.5 w-4.5 text-primary" style={{ height: '1.125rem', width: '1.125rem' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{t.label}</p>
                    <p className="text-[9.5px] text-muted-foreground leading-tight mt-0.5">{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Promos ──────────────────────────────────────────────── */}
            <section>
              <h2 className="text-lg font-bold tracking-tight mb-4">Offers for You</h2>
              <div className="space-y-3">
                {PROMOS.map((p, i) => (
                  <div key={i}
                    className={`relative bg-gradient-to-r ${p.gradient} rounded-2xl p-5 overflow-hidden shadow-md
                                hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`}>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-25">{p.emoji}</div>
                    <span className="inline-block bg-white/20 text-white/90 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                      {p.badge}
                    </span>
                    <p className="text-white font-bold text-base">{p.title}</p>
                    <p className="text-white/70 text-xs mt-0.5">{p.subtitle}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Recent Bookings ─────────────────────────────────────── */}
            {recentBookings.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold tracking-tight">Recent Bookings</h2>
                  <Link to="/bookings"
                    className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* Bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}