import React from 'react';
import { Smile, User, CheckCircle2, Star } from 'lucide-react';
import { HStack, VStack } from '@/components/primitives/Stack';

export function TrustStrip() {
  const kpis = [
    { icon: Smile, value: '10,000+', label: 'Happy Customers', color: 'text-amber-400' },
    { icon: User, value: '5,000+', label: 'Registered Professionals', color: 'text-blue-500' },
    { icon: CheckCircle2, value: '200,000+', label: 'Services Completed', color: 'text-blue-500' },
    { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-amber-400' },
  ];

  return (
    <div className="w-full bg-white dark:bg-surface rounded-3xl py-6 px-6 md:px-12 mb-12 border border-hairline/20 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <HStack key={i} gap={4} align="center">
            <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className={`size-8 ${kpi.color} fill-current`} />
            </div>
            <VStack gap={0}>
              <span className="text-xl font-extrabold text-ink leading-tight tracking-tight">{kpi.value}</span>
              <span className="text-[11px] font-semibold text-ink-secondary">{kpi.label}</span>
            </VStack>
          </HStack>
        ))}
      </div>
    </div>
  );
}
