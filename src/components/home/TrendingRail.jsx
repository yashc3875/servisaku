import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceCard } from '@/components/service/ServiceCard';
import { servisaku } from '@/api/servisakuClient';
import { serviceImageFor } from '@/lib/serviceImages';
import { Section, SeeAllLink } from '@/components/primitives/Section';

// Live "trending" picks — first few services from the dynamic catalogue.
function toCard(s) {
  const from = s.price_from > 0 ? s.price_from : s.visit_fee;
  return {
    slug: s.slug,
    name: s.name,
    description: s.description || '',
    image: serviceImageFor(s.slug) || null,
    priceRange: from > 0 ? [Math.round(from)] : undefined,
  };
}

export function TrendingRail() {
  const { data: services } = useQuery({
    queryKey: ['trending-services'],
    queryFn: () => servisaku.catalog.getServices(),
    staleTime: 5 * 60 * 1000,
  });

  const trending = (services || []).slice(0, 3).map(toCard);
  if (!trending.length) return null;

  return (
    <Section
      title="Trending in Klang Valley"
      action={<SeeAllLink to="/explore" />}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar pl-4 -ml-4 pr-4">
        {trending.map((service, i) => (
          <div key={service.slug} className="min-w-[280px] snap-center">
            <ServiceCard service={service} variant="feature" delay={i * 0.1} />
          </div>
        ))}
      </div>
    </Section>
  );
}
