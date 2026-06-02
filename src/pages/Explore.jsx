import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES_DISPLAY } from '@/lib/services';
import { cn } from '@/lib/utils';
import { Chip } from '@/components/primitives/Chip';
import { variants, safeMotion } from '@/lib/design/motion';
import { useTranslation } from '@/lib/useTranslation';

const CATEGORIES = ['All', 'Cleaning', 'AC', 'Plumbing', 'Electrical', 'Painting', 'Pest Control'];

export default function Explore() {
  const { t, tField, lang } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setQuery(q);
    }
  }, [searchParams]);

  // Update URL when query changes (optional, but good UX)
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  };

  const filtered = SERVICES_DISPLAY.filter(s => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      s.name.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  const stagger = safeMotion(variants.stagger);
  const staggerItem = safeMotion(variants.staggerItem);

  return (
    <div className="font-inter pb-6 bg-bg min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-bg/90 backdrop-blur-xl px-5 lg:px-8 pt-12 lg:pt-4 pb-4 border-b border-hairline/10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-ink">{t('Explore')}</h1>
          <button
            type="button"
            onClick={() => setViewMode(v => (v === 'list' ? 'grid' : 'list'))}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface border border-hairline/10 text-ink-secondary hover:bg-raised transition-colors"
            aria-label={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
          >
            {viewMode === 'list' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
          <input
            type="text"
            placeholder={lang === 'ms' ? 'Cari perkhidmatan...' : 'Search services...'}
            value={query}
            onChange={handleQueryChange}
            className="w-full bg-surface border border-hairline/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-ink outline-none shadow-e1 focus:ring-2 ring-brand/20"
          />
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 mt-3">
          {CATEGORIES.map(cat => (
            <Chip
              key={cat}
              tone={activeCategory === cat ? 'brand' : 'neutral'}
              selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Chip>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 lg:px-8 pt-5">
        {viewMode === 'list' ? (
          /* ─── List View ─── */
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
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
                    className="flex items-center gap-4 bg-surface rounded-3xl border border-hairline/10 p-4 shadow-e1 hover:shadow-e2 transition-all group"
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            'w-6 h-6 rounded-lg flex items-center justify-center',
                            s.color
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <h3 className="font-bold text-sm text-ink">{tField(s, 'name')}</h3>
                      </div>
                      <p className="text-xs text-ink-secondary mb-2 line-clamp-1">
                        {tField(s, 'description')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand">{s.price}</span>
                        <span className="text-[10px] text-ink-tertiary bg-raised px-2 py-0.5 rounded-full">
                          {s.duration}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink-secondary group-hover:text-brand transition-colors shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* ─── Grid View ─── */
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
                    className="flex flex-col h-full bg-surface rounded-2xl border border-hairline/10 overflow-hidden shadow-e1 hover:shadow-e2 hover:border-brand/30 transition-all group"
                  >
                    {s.image ? (
                      <div className="w-full aspect-[4/3] bg-raised overflow-hidden relative">
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className={cn('w-full aspect-[4/3] flex items-center justify-center', s.color)}>
                        <Icon className="h-8 w-8 opacity-50" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col items-start gap-1 flex-1">
                      <h3 className="font-bold text-sm text-ink group-hover:text-brand transition-colors line-clamp-2">{tField(s, 'name')}</h3>
                      <span className="text-xs font-bold text-brand mt-auto pt-2">{s.price}</span>
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