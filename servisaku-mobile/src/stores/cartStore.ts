import { create } from 'zustand';
import type { BookingLineItem, Service, ServicePackage } from '@/types';
import { cartSubtotal } from '@/utils/pricing';

interface CartState {
  items: BookingLineItem[];
  /** Add a service+package to the cart (or bump quantity if identical). */
  addItem: (
    service: Service,
    pkg: ServicePackage,
    addOnIds: string[],
    quantity: number,
  ) => void;
  removeItem: (index: number) => void;
  setQuantity: (index: number, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (service, pkg, addOnIds, quantity) => {
    const addOns = service.addOns
      .filter((a) => addOnIds.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name.en, price: a.price, quantity: 1 }));

    const lineItem: BookingLineItem = {
      serviceId: service.id,
      serviceName: service.name.en,
      packageId: pkg.id,
      packageName: pkg.name.en,
      quantity,
      unitPrice: pkg.price,
      addOns,
    };

    set((state) => {
      // Merge with an identical existing line (same package + add-ons).
      const idx = state.items.findIndex(
        (it) =>
          it.packageId === pkg.id &&
          it.addOns.map((a) => a.id).sort().join() ===
            addOns.map((a) => a.id).sort().join(),
      );
      if (idx >= 0) {
        const next = [...state.items];
        next[idx] = {
          ...next[idx]!,
          quantity: next[idx]!.quantity + quantity,
        };
        return { items: next };
      }
      return { items: [...state.items, lineItem] };
    });
  },

  removeItem: (index) =>
    set((state) => ({ items: state.items.filter((_, i) => i !== index) })),

  setQuantity: (index, quantity) =>
    set((state) => {
      if (quantity < 1) return { items: state.items.filter((_, i) => i !== index) };
      const next = [...state.items];
      const item = next[index];
      if (!item) return state;
      next[index] = { ...item, quantity };
      return { items: next };
    }),

  clear: () => set({ items: [] }),

  subtotal: () => cartSubtotal(get().items),

  count: () => get().items.reduce((sum, it) => sum + it.quantity, 0),
}));
