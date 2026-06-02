import React from 'react';
import { ServiceCard } from '@/components/service/ServiceCard';
import { SERVICES_DISPLAY } from '@/lib/services';
import { Section, SeeAllLink } from '@/components/primitives/Section';

export function TrendingRail() {
  const trending = SERVICES_DISPLAY.slice(0, 3);

  return (
    <Section 
      title="Trending in Klang Valley" 
      action={<SeeAllLink to="/explore" />}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar pl-4 -ml-4 pr-4">
        {trending.map((service, i) => (
          <div key={service.id} className="min-w-[280px] snap-center">
            <ServiceCard service={service} variant="feature" delay={i * 0.1} />
          </div>
        ))}
      </div>
    </Section>
  );
}
