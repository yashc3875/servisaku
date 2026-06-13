import { Sparkles, Wind, Droplets, Zap, Paintbrush, Bug, Star, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/useTranslation';

const categories = [
  {
    id: 1,
    slug: 'home-cleaning',
    titleKey: 'Home Cleaning',
    price: '35',
    rating: '4.8',
    reviews: '12K',
    img: '/img/cleaning-new.jpg',
    Icon: Sparkles,
    tone: 'bg-orange-50 text-brand border-orange-100',
    tag: 'Daily, deep, move-in',
  },
  {
    id: 2,
    slug: 'ac-servicing',
    titleKey: 'AC Service & Repair',
    price: '60',
    rating: '4.9',
    reviews: '9.8K',
    img: '/img/ac-new.jpg',
    Icon: Wind,
    tone: 'bg-blue-50 text-blue-600 border-blue-100',
    tag: 'Service, repair, gas top-up',
  },
  {
    id: 3,
    slug: 'plumbing',
    titleKey: 'Plumbing',
    price: '50',
    rating: '4.7',
    reviews: '8.5K',
    img: '/img/plumbing-new.jpg',
    Icon: Droplets,
    tone: 'bg-emerald-50 text-success border-emerald-100',
    tag: 'Leaks, taps, bathroom',
  },
  {
    id: 4,
    slug: 'electrical',
    titleKey: 'Electrical Services',
    price: '79',
    rating: '4.8',
    reviews: '7.6K',
    img: '/img/electrical-new.jpg',
    Icon: Zap,
    tone: 'bg-amber-50 text-warning border-amber-100',
    tag: 'Sockets, fans, wiring',
  },
  {
    id: 5,
    slug: 'painting',
    titleKey: 'Painting',
    price: '199',
    rating: '4.7',
    reviews: '6.2K',
    img: '/img/painting-new.jpg',
    Icon: Paintbrush,
    tone: 'bg-violet-50 text-violet-600 border-violet-100',
    tag: 'Room, condo, exterior',
  },
  {
    id: 6,
    slug: 'pest-control',
    titleKey: 'Pest Control',
    price: '99',
    rating: '4.8',
    reviews: '5.4K',
    img: '/img/pest-new.jpg',
    Icon: Bug,
    tone: 'bg-red-50 text-danger border-red-100',
    tag: 'Termites, roaches, ants',
  },
];

export default function CategoryGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t('Book by category')}</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">{t('Services for Malaysian homes')}</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="hidden text-sm font-bold text-brand transition-colors hover:text-brand-ink sm:block"
        >
          {t('View All Services')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => navigate(`/service/${cat.slug}`)}
            className="group overflow-hidden rounded-lg border border-hairline/70 bg-white text-left shadow-e1 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-e3"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-raised">
              <img
                src={cat.img}
                alt={t(cat.titleKey)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-extrabold text-ink shadow-e1">
                RM{cat.price}+
              </div>
            </div>

            <div className="p-3">
              <div className={`mb-3 flex size-9 items-center justify-center rounded-lg border ${cat.tone}`}>
                <cat.Icon className="h-4 w-4" />
              </div>
              <h3 className="min-h-10 text-sm font-extrabold leading-tight text-ink">{t(cat.titleKey)}</h3>
              <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-ink-tertiary">{t(cat.tag)}</p>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-ink-secondary">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {cat.rating}
                </span>
                <span className="inline-flex items-center gap-1 text-success">
                  <ShieldCheck className="size-3" />
                  {cat.reviews}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
