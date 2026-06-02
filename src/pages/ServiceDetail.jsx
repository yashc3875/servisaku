import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Shield, Check, ChevronDown, ChevronUp, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/services';
import { useTranslation } from '@/lib/useTranslation';
import { getPackages, getAddons } from '@/lib/packageData';
import { formatMYR, cn } from '@/lib/utils';
import { safeMotion, variants } from '@/lib/design/motion';

const FAQS = [
  { q: 'What should I do before the team arrives?', a: 'Clear walkways and secure valuables. No need to provide cleaning supplies — we bring everything.' },
  { q: 'Are your professionals insured?', a: 'Yes, all ServisAku partners are fully insured and bonded. Any accidental damage is covered.' },
  { q: 'Can I request the same partner again?', a: 'Absolutely! After your first booking, you can set a partner as your favourite and request them directly.' },
  { q: 'What if I am not satisfied?', a: 'We offer a free rework within 48 hours, no questions asked. Customer satisfaction is our priority.' },
];

const REVIEWS = [
  { name: 'Nurul Ain', rating: 5, comment: 'Aisyah was amazing! Very thorough and professional. My apartment is spotless.', date: '2 days ago' },
  { name: 'David Lim', rating: 5, comment: 'Punctual, efficient, and friendly. Will definitely book again.', date: '1 week ago' },
  { name: 'Siti Rahimah', rating: 4, comment: 'Good service overall. Bathroom could have been a bit more thorough.', date: '2 weeks ago' },
];

export default function ServiceDetail() {
  const { t, tField } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = SERVICES.find(s => s.id === serviceId);
  const [pkgIdx, setPkgIdx] = useState(0);
  const [addons, setAddons] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  const packages = getPackages(serviceId);
  const availableAddons = getAddons(serviceId);

  if (!service || !packages || packages.length === 0) return <div className="flex justify-center pt-32"><div className="w-6 h-6 border-2 border-hairline/10 border-t-brand rounded-full animate-spin" /></div>;

  const Icon = service.icon;
  const pkgPrice = packages[pkgIdx].price;
  const addonTotal = addons.reduce((sum, id) => sum + (availableAddons.find(a => a.id === id)?.price || 0), 0);
  const totalPrice = pkgPrice + addonTotal;

  const toggleAddon = (id) => setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  return (
    <motion.div {...safeMotion(variants.fadeUp)} className="font-inter pb-32 bg-bg min-h-screen">
      {/* Hero Image */}
      <div className="relative h-80">
        <img src={service.headerImage || service.image} alt={tField(service, 'name')} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-10 h-10 bg-surface/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-e1">
          <ArrowLeft className="h-4 w-4 text-ink" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">{tField(service, 'name')}</h1>
              <p className="text-white/80 text-sm mt-0.5">{tField(service, 'description')}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shadow-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-7">

        {/* Stats Bar */}
        <div className="flex items-center gap-4 py-3 px-4 bg-surface rounded-2xl border border-hairline/10 shadow-e1">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="font-bold text-sm text-ink">4.8</span>
            <span className="text-xs text-ink-secondary">(2.4k reviews)</span>
          </div>
          <div className="w-px h-5 bg-hairline/10" />
          <div className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Clock className="h-3.5 w-3.5" />{service.duration}
          </div>
          <div className="w-px h-5 bg-hairline/10" />
          <div className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Shield className="h-3.5 w-3.5 text-brand" />
            <span className="text-xs font-medium text-brand">Insured</span>
          </div>
        </div>

        {/* Package Selector */}
        <div>
          <h3 className="text-base font-bold mb-3 text-ink">Choose Package</h3>
          <div className="space-y-2.5">
            {packages.map((pkg, i) => {
              const active = pkgIdx === i;
              return (
                <button key={i} onClick={() => setPkgIdx(i)}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 p-4 transition-all duration-200",
                    active ? "border-brand bg-brand-tint shadow-e1" : "border-hairline/10 bg-surface shadow-sm hover:border-brand/40"
                  )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        active ? "border-brand bg-brand" : "border-hairline/10"
                      )}>
                        {active && <Check className="h-3 w-3 text-ink-inverse" />}
                      </div>
                      <span className="font-bold text-sm text-ink">{pkg.name}</span>
                      {pkg.isPopular && <span className="text-[9px] bg-accent text-ink-inverse px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                    </div>
                    <span className="font-bold text-brand">{formatMYR(pkg.price)}</span>
                  </div>
                  <p className="text-xs text-ink-secondary mb-2 pl-7">{pkg.desc}</p>
                  {active && (
                    <ul className="pl-7 space-y-1">
                      {pkg.inclusions.map((item, j) => (
                        <li key={j} className="flex items-center gap-1.5 text-xs text-ink">
                          <Check className="h-3 w-3 text-brand shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add-ons */}
        {availableAddons.length > 0 && (
          <div>
            <h3 className="text-base font-bold mb-3 text-ink">Add-ons</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableAddons.map(addon => {
                const active = addons.includes(addon.id);
                return (
                  <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 rounded-2xl border-2 text-left transition-all",
                      active ? "border-brand bg-brand-tint" : "border-hairline/10 bg-surface"
                    )}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-ink">{addon.label}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                        active ? "bg-brand" : "bg-raised"
                      )}>
                        {active ? <Check className="h-3 w-3 text-ink-inverse" /> : <Plus className="h-3 w-3 text-ink-secondary" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand">+{formatMYR(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-ink">Reviews</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-sm text-ink">4.8</span>
            </div>
          </div>
          <div className="space-y-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-hairline/10 p-4 shadow-e1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-tint flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-ink">{r.name.charAt(0)}</span>
                    </div>
                    <p className="font-semibold text-sm text-ink">{r.name}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(r.rating)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-ink-tertiary mt-2">{r.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-base font-bold mb-3 text-ink">FAQs</h3>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-hairline/10 overflow-hidden shadow-e1">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <span className="text-sm font-medium pr-3 text-ink">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-brand shrink-0" /> : <ChevronDown className="h-4 w-4 text-ink-secondary shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-xs text-ink-secondary leading-relaxed border-t border-hairline/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto bg-surface/95 backdrop-blur-xl border-t border-hairline/10 px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-ink-secondary">{packages[pkgIdx].name} package{addons.length > 0 ? ` + ${addons.length} add-on${addons.length > 1 ? 's' : ''}` : ''}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-brand">{formatMYR(totalPrice)}</span>
                <span className="text-xs text-ink-secondary">total</span>
              </div>
            </div>
            <Link to={`/book/${service.id}?package=${pkgIdx}&addons=${addons.join(',')}`}
              className="bg-accent text-ink-inverse rounded-xl px-6 h-12 shadow-e2 font-semibold inline-flex items-center gap-2 transition-transform active:scale-95">
              {t('Book Now')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}