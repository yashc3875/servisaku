import { Star } from 'lucide-react';
import { getRatingDistribution } from '@/lib/qualityEngine';

export default function RatingBreakdown({ reviews = [], compact = false }) {
  const dist = getRatingDistribution(reviews);
  const total = reviews.length;
  const avg = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;

  return (
    <div className={`flex ${compact ? 'gap-3 items-center' : 'gap-4'}`}>
      {/* Big average */}
      <div className="text-center shrink-0">
        <p className={`font-bold ${compact ? 'text-2xl' : 'text-4xl'} leading-none`}>
          {avg > 0 ? avg.toFixed(1) : '—'}
        </p>
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`${compact ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} ${i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{total} reviews</p>
      </div>
      {/* Bars */}
      <div className={`flex-1 space-y-${compact ? '1' : '1.5'}`}>
        {[5,4,3,2,1].map(star => {
          const count = dist[star] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground w-3 text-right`}>{star}</span>
              <div className={`flex-1 bg-muted rounded-full overflow-hidden ${compact ? 'h-1.5' : 'h-2'}`}>
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-muted-foreground w-5`}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}