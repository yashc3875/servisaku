import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/useTranslation';

// Urban-Company-style reels: short, muted, looping portrait videos that autoplay
// only while in view (IntersectionObserver) and link into the catalogue.
const REELS = [
  { src: '/videos/c1.mp4', poster: '/videos/c1.jpg', label: 'Home Cleaning', to: '/catalog/cleaning' },
  { src: '/videos/w1.mp4', poster: '/videos/w1.jpg', label: 'Beauty & Wellness', to: '/catalog/beauty-wellness-women' },
  { src: '/videos/m1.mp4', poster: '/videos/m1.jpg', label: "Men's Grooming", to: '/catalog/mens-grooming-massage' },
  { src: '/videos/c2.mp4', poster: '/videos/c2.jpg', label: 'Deep Cleaning', to: '/catalog/cleaning' },
  { src: '/videos/w2.mp4', poster: '/videos/w2.jpg', label: 'Salon at Home', to: '/catalog/beauty-wellness-women' },
  { src: '/videos/m2.mp4', poster: '/videos/m2.jpg', label: 'Massage & Spa', to: '/catalog/mens-grooming-massage' },
];

export default function VideoReels() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const containerRef = useRef(null);

  useEffect(() => {
    const vids = containerRef.current?.querySelectorAll('video') || [];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.play().catch(() => {});
        else e.target.pause();
      }),
      { threshold: 0.5 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <section>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{t('See it in action')}</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">{t('ServisAku pros at work')}</h2>
      </div>

      <div ref={containerRef} className="-mx-5 flex gap-4 overflow-x-auto scrollbar-none px-5 md:mx-0 md:px-0">
        {REELS.map((r) => (
          <button
            key={r.src}
            type="button"
            onClick={() => navigate(r.to)}
            className="group relative w-[160px] shrink-0 overflow-hidden rounded-2xl border border-hairline/60 bg-ink shadow-e1 transition-transform hover:-translate-y-0.5 sm:w-[200px]"
          >
            <video
              src={r.src}
              poster={r.poster}
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-[9/16] w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 text-left">
              <span className="text-sm font-bold text-white drop-shadow">{r.label}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
