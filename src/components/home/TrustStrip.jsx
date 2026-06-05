import React from 'react';
import { Smile, Users, ShieldCheck, Star } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

export function TrustStrip() {
  const { t } = useTranslation();

  const kpis = [
    { icon: Smile, value: '10,000+', label: t('Happy Customers'), color: 'text-brand', bg: 'bg-brand-tint' },
    { icon: Users, value: '5,000+', label: t('Registered Pros'), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: ShieldCheck, value: '200k+', label: t('Services Done'), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Star, value: '4.8/5', label: t('Average Rating'), color: 'text-amber-500', bg: 'bg-amber-50', fill: true },
  ];

  return (
    <div className="w-full bg-surface rounded-[2rem] p-8 md:p-10 border border-hairline/20 shadow-e1 relative overflow-hidden mb-12">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 relative z-10 lg:divide-x divide-hairline/40">
        {kpis.map((kpi, i) => (
          <div key={i} className={`flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 ${i !== 0 ? 'lg:pl-10 xl:pl-12' : ''} ${i !== 3 ? 'lg:pr-4' : ''}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color} shadow-sm border border-white/50`}>
              <kpi.icon className={`w-7 h-7 ${kpi.fill ? 'fill-current' : ''}`} strokeWidth={kpi.fill ? 1.5 : 2} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-3xl font-extrabold text-ink leading-none tracking-tight mb-1.5">{kpi.value}</span>
              <span className="text-sm font-bold text-ink-secondary">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
