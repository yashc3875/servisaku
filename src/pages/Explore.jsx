import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, LayoutGrid, List, MapPin, ShieldCheck, SlidersHorizontal, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES_DISPLAY } from '@/lib/services';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/primitives/Chip';
import { variants, safeMotion } from '@/lib/design/motion';
import { useTranslation } from '@/lib/useTranslation';

const CATEGORIES = [
  { label: 'All', match: 'all' },
  { label: 'Cleaning', match: 'cleaning' },
  { label: 'AC', match: 'ac' },
  { label: 'Plumbing', match: 'plumbing' },
  { label: 'Electrical', match: 'electrical' },
  { label: 'Painting', match: 'painting' },
  { label: 'Pest Control', match: 'pest' },
];

export default function Explore() {
  const { t, tField, lang } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('loc') || 'Kuala Lumpur';
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
    const loc = searchParams.get('loc');
    if (loc !== null) {
      setLocation(loc);
    }
  }, [searchParams]);

  // Update URL when query changes (optional, but good UX)
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    const params = {};
    if (newQuery) params.q = newQuery;
    if (location) params.loc = location;
    setSearchParams(params);
  };

  const handleLocationChange = (e) => {
    const nextLocation = e.target.value;
    setLocation(nextLocation);
    const params = {};
    if (query) params.q = query;
    if (nextLocation) params.loc = nextLocation;
    setSearchParams(params);
  };

  const filtered = SERVICES_DISPLAY.filter(s => {
    const searchable = `${s.name} ${s.description || ''} ${s.nameMy || ''} ${s.descriptionMy || ''}`.toLowerCase();
    const matchesQuery = searchable.includes(query.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' ||
      searchable.includes(activeCategory);
    return matchesQuery && matchesCategory;
  });

  const stagger = safeMotion(variants.stagger);
  const staggerItem = safeMotion(variants.staggerItem);

  return (
    <div className="font-inter pb-6 bg-[#fbfaf7] min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-hairline/60 bg-[#fbfaf7]/90 px-5 pb-4 pt-7 backdrop-blur-xl lg:px-8 lg:pt-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t('Explore')}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">{t('Book a home service')}</h1>
          </div>
          <button
            type="button"
            onClick={() => setViewMode(v => (v === 'list' ? 'grid' : 'list'))}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline/60 bg-white text-ink-secondary shadow-e1 transition-colors hover:bg-raised"
            aria-label={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
          >
            {viewMode === 'list' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1fr_280px_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
            <input
              type="text"
              placeholder={lang === 'ms' ? 'Cari pembersihan, AC, paip...' : 'Search cleaning, AC, plumber...'}
              value={query}
              onChange={handleQueryChange}
              className="w-full rounded-lg border border-hairline/60 bg-white py-3.5 pl-10 pr-4 text-sm font-semibold text-ink shadow-e1 outline-none ring-brand/20 placeholder:text-ink-tertiary focus:ring-2"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              className="w-full rounded-lg border border-hairline/60 bg-white py-3.5 pl-10 pr-4 text-sm font-semibold text-ink shadow-e1 outline-none ring-brand/20 placeholder:text-ink-tertiary focus:ring-2"
              placeholder="Kuala Lumpur"
            />
          </div>
          <button className="hidden h-full items-center justify-center gap-2 rounded-lg border border-hairline/60 bg-white px-4 text-sm font-bold text-ink-secondary shadow-e1 lg:flex">
            <SlidersHorizontal className="h-4 w-4" />
            {t('Filters')}
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 mt-3">
          {CATEGORIES.map(cat => (
            <Chip
              key={cat.match}
              tone={activeCategory === cat.match ? 'brand' : 'neutral'}
              selected={activeCategory === cat.match}
              onClick={() => setActiveCategory(cat.match)}
              className="shrink-0"
            >
              {t(cat.label)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 lg:px-8 pt-5">
        {viewMode === 'list' ? (
          /* ─── List View ─── */
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            {...stagger}
            initial="initial"
            animate="animate"
            key="list"
          >
            {filtered.map(s => {
              const Icon = s.icon;
              return (
                <motion.div key={s.id} variants={staggerItem} whileHover={variants.pressable.whileHover} whileTap={variants.pressable.whileTap}>
                  <Link
                    to={`/service/${s.id}`}
                    className="group flex items-center gap-4 rounded-lg border border-hairline/70 bg-white p-4 shadow-e1 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-e3"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', s.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="font-bold text-base text-ink">{tField(s, 'name')}</h3>
                      </div>
                      <p className="text-sm text-ink-secondary mb-3 line-clamp-2">
                        {tField(s, 'description')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brand">{s.price}</span>
                        <div className="flex items-center gap-2">
                          <span className="hidden items-center gap-1 text-xs font-bold text-success sm:inline-flex">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {t('Verified')}
                          </span>
                          <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-ink-tertiary">{s.duration}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-ink-secondary group-hover:text-brand transition-colors shrink-0 ml-2" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ─── Grid View ─── */
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            {...stagger}
            initial="initial"
            animate="animate"
            key="grid"
          >
            {filtered.map(s => {
              const Icon = s.icon;
              return (
                <motion.div key={s.id} variants={staggerItem} whileHover={variants.pressable.whileHover} whileTap={variants.pressable.whileTap} className="h-full">
                  <Link
                    to={`/service/${s.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-hairline/70 bg-white shadow-e1 transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-e3"
                  >
                    {s.image ? (
                      <div className="w-full aspect-[4/3] bg-raised overflow-hidden relative">
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className={cn('w-full aspect-[4/3] flex items-center justify-center', s.color)}>
                        <Icon className="h-10 w-10 opacity-50" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col items-start gap-1.5 flex-1">
                      <h3 className="font-bold text-base text-ink group-hover:text-brand transition-colors line-clamp-2">{tField(s, 'name')}</h3>
                      <p className="text-xs text-ink-secondary mb-1 line-clamp-1">{tField(s, 'description')}</p>
                      <div className="mt-auto flex w-full items-center justify-between pt-3">
                        <span className="text-sm font-bold text-brand">{s.price}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          4.8
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-ink-tertiary">
            <Search className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">{lang === 'ms' ? 'Tiada perkhidmatan dijumpai' : 'No services found'}</p>
            <p className="text-xs mt-1">{lang === 'ms' ? 'Cuba carian atau kategori lain' : 'Try a different search or category'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
