import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80';

function ServiceImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {/* Skeleton shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={errored ? FALLBACK : src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

export default function ServiceCard({ service, size = 'sm' }) {
  const Icon = service.icon;

  if (size === 'lg') {
    return (
      <Link
        to={`/service/${service.id}`}
        className="relative rounded-2xl overflow-hidden shadow-card hover:shadow-md hover:-translate-y-0.5
                   active:scale-[0.98] transition-all duration-200 block shrink-0 w-44 h-28"
      >
        <ServiceImage src={service.image} alt={service.name} className="w-full h-full" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-tight drop-shadow">{service.name}</p>
          <p className="text-white/70 text-[10px] mt-0.5 font-medium">{service.price}</p>
        </div>
      </Link>
    );
  }

  // Small grid card — icon based (no image)
  return (
    <Link to={`/service/${service.id}`} className="flex flex-col items-center gap-2 group tap-sm">
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200',
        'shadow-xs group-hover:scale-105 group-hover:shadow-md active:scale-95',
        service.color,
      )}>
        <Icon className="h-7 w-7" />
      </div>
      <span className="text-xs font-semibold text-foreground text-center leading-tight px-1">
        {service.name}
      </span>
    </Link>
  );
}