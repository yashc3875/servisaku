import { create } from 'zustand';
import type { Address } from '@/types';
import { mockAddresses } from '@/mocks';

interface LocationState {
  /** The address used for new bookings & "near you" content. */
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address) => void;
  /** Seed from the user's default saved address on login. */
  initFromAddresses: (addresses: Address[]) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  // Default to the demo home address so the home screen has a location on first paint.
  selectedAddress: mockAddresses.find((a) => a.isDefault) ?? mockAddresses[0]!,

  setSelectedAddress: (selectedAddress) => set({ selectedAddress }),

  initFromAddresses: (addresses) => {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
    set({ selectedAddress: def });
  },
}));
