import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/primitives/Stack';
import { Sparkles } from 'lucide-react';

export function PromoCard() {
  return (
    <Card className="mx-4 overflow-hidden bg-brand border-0 relative" pad="none" interactive>
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Sparkles className="size-24 text-white" />
      </div>
      <div className="relative z-10 p-6 flex flex-col justify-between h-full">
        <VStack gap={2} className="mb-6">
          <span className="text-accent font-bold tracking-wider uppercase text-[11px]">Limited Time</span>
          <h3 className="text-h2 text-white leading-tight">Get RM50 off<br/>your first cleaning</h3>
          <p className="text-white/80 text-caption mt-1">Use code <span className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">WELCOME50</span></p>
        </VStack>
        <div>
          <Button variant="accent" size="sm" className="font-bold">Book Now</Button>
        </div>
      </div>
    </Card>
  );
}
