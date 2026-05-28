import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { SERVICES } from '@/lib/services';
import { cn } from '@/lib/utils';

export default function Explore() {
  const [query, setQuery] = useState('');
  const filtered = SERVICES.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="font-inter pb-6">
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl px-5 lg:px-8 pt-12 lg:pt-4 pb-4 border-b border-border/40">
        <h1 className="text-xl font-bold mb-3">All Services</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-border rounded-2xl pl-10 pr-4 py-3 text-sm outline-none shadow-sm focus:ring-2 ring-primary/20"
          />
        </div>
      </div>

      <div className="px-5 lg:px-8 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(s => {
            const Icon = s.icon;
            return (
              <Link
                key={s.id}
                to={`/service/${s.id}`}
                className="flex items-center gap-4 bg-white rounded-3xl border border-border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-all group"
              >
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", s.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="font-bold text-sm">{s.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{s.price}</span>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{s.duration}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}