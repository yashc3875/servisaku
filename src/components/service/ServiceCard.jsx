import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ArrowRight, Clock } from 'lucide-react';
import { VStack, HStack } from '@/components/primitives/Stack';
import * as motion from '@/lib/design/motion';
import { motion as m } from 'framer-motion';

export function ServiceCard({
  service,
  variant = 'tile',
  className,
  delay = 0,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (service.subcategories) {
      navigate(`/category/${service.slug}`);
    } else {
      navigate(`/service/${service.id || service.slug}`);
    }
  };

  if (variant === 'tile') {
    return (
      <m.div variants={motion.safeMotion(motion.variants.staggerItem)} custom={delay} className="h-full">
        <Card
          interactive
          pad="none"
          className="h-full flex flex-col justify-between border-hairline hover:border-brand/20 group overflow-hidden"
          onClick={handleClick}
        >
          {service.image ? (
            <div className="w-full aspect-[4/3] relative overflow-hidden bg-raised">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-brand-tint flex items-center justify-center">
              {service.icon && React.createElement(service.icon, { className: 'size-12 opacity-20 text-brand' })}
            </div>
          )}
          
          <VStack gap={2} className="p-4 md:p-5 flex-1">
            <h3 className="text-body font-bold text-ink group-hover:text-brand transition-colors">
              {service.name}
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
              {service.description || `Professional ${service.name.toLowerCase()} services`}
            </p>
            
            <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-brand group-hover:text-brand-ink transition-colors">
              <span>From RM {service.priceRange?.[0] || '35'}</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </VStack>
        </Card>
      </m.div>
    );
  }

  if (variant === 'feature') {
    // Feature variant unchanged for other pages that use it
    return (
      <m.div variants={motion.safeMotion(motion.variants.staggerItem)} custom={delay}>
        <Card interactive pad="none" className="h-full overflow-hidden group" onClick={handleClick}>
          <div className="aspect-[4/3] bg-raised relative overflow-hidden">
            {service.image ? (
              <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="absolute inset-0 bg-brand-tint flex items-center justify-center">
                {service.icon && React.createElement(service.icon, { className: 'size-12 opacity-20 text-brand' })}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-semibold text-lead">{service.name}</h3>
            </div>
          </div>
        </Card>
      </m.div>
    );
  }

  // Row variant unchanged
  return (
    <Card interactive pad="md" className="w-full group" onClick={handleClick}>
      <HStack gap={4} align="center">
        <div className="size-16 rounded-lg bg-raised flex-shrink-0 overflow-hidden">
          {service.image ? (
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-tint text-brand">
              {service.icon && React.createElement(service.icon, { className: 'size-7' })}
            </div>
          )}
        </div>
        <VStack gap={1} className="flex-1">
          <h3 className="font-semibold text-ink">{service.name}</h3>
          <HStack gap={3} className="text-caption text-ink-secondary">
            {service.priceRange && <span>From RM{service.priceRange[0]}</span>}
            {service.duration && (
              <HStack gap={1}><Clock className="size-3" /><span>{service.duration}</span></HStack>
            )}
          </HStack>
        </VStack>
        <ArrowRight className="size-5 text-ink-tertiary group-hover:text-ink transition-colors" />
      </HStack>
    </Card>
  );
}
