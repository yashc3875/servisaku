import React from 'react';
import { ShieldCheck, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustChip({ type, label, className }) {
  const types = {
    verified: { icon: ShieldCheck, color: 'text-brand', bg: 'bg-brand-tint' },
    speed: { icon: Clock, color: 'text-info', bg: 'bg-info-tint' },
    guarantee: { icon: Award, color: 'text-warning', bg: 'bg-warning-tint' },
  };
  
  const config = types[type] || types.verified;
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md", config.bg, className)}>
      <Icon className={cn("size-3.5", config.color)} />
      <span className={cn("text-[10px] font-bold uppercase tracking-wider", config.color)}>
        {label}
      </span>
    </div>
  );
}
