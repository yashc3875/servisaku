import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, Scissors, Bug, Wind, Wrench, Zap, Droplet, Hammer,
  PaintRoller, Drill, Clock, Home, Loader2, ChevronRight,
} from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import { formatMYR } from '@/lib/utils';

// category.icon_key (seeded) → lucide component, with a safe fallback.
const ICONS = { Sparkles, Scissors, Bug, Wind, Wrench, Zap, Droplet, Hammer, PaintRoller, Drill, Clock, Home };

export default function Catalog() {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => servisaku.catalog.getCategories(),
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-brand" /></div>;
  }

  if (!categories?.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-ink-secondary">
        <p>The live catalogue isn’t available yet.</p>
        <p className="mt-1 text-sm">Seed the booking engine (<code>npm run db:seed:booking-engine</code>) to populate it.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">All services</h1>
      <p className="mt-1 text-ink-secondary">{categories.length} categories · book any service in a few taps</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = ICONS[c.icon_key] || Home;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/catalog/${c.slug}`)}
              className="group flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-e2"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{c.name}</span>
                <span className="block text-sm text-ink-secondary">
                  {c.service_count != null ? `${c.service_count} services` : 'Services'}
                  {c.price_from > 0 && ` · from ${formatMYR(c.price_from)}`}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-tertiary transition group-hover:text-brand" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
