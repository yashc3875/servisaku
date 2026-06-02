import React from 'react';
import { RotateCcw, AlertTriangle, Crown, Share } from 'lucide-react';
import { HStack, VStack } from '@/components/primitives/Stack';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { id: 'rebook', icon: RotateCcw, label: 'Rebook', to: '/bookings', color: 'text-brand' },
  { id: 'emergency', icon: AlertTriangle, label: 'Emergency', to: '/explore', color: 'text-danger' },
  { id: 'subscription', icon: Crown, label: 'Plus', to: '/explore', color: 'text-accent' },
  { id: 'refer', icon: Share, label: 'Refer', to: '/profile/edit', color: 'text-info' },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <HStack gap={3} justify="between" className="px-4">
      {ACTIONS.map(action => (
        <button
          key={action.id}
          onClick={() => navigate(action.to)}
          className="flex-1 flex justify-center py-3 bg-surface rounded-2xl border border-hairline shadow-e1 hover:shadow-e2 transition-all active:scale-95"
        >
          <VStack gap={1} align="center">
            <action.icon className={`size-5 ${action.color}`} />
            <span className="text-[11px] font-semibold text-ink tracking-wide">{action.label}</span>
          </VStack>
        </button>
      ))}
    </HStack>
  );
}
