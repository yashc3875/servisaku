import type { BookingLineItem, PriceBreakdown, MoneySen } from '@/types';

/** Flat platform service fee (sen). */
export const SERVICE_FEE_SEN = 500;

/** Malaysian SST rate applied to taxable subtotal. */
export const SST_RATE = 0.06;

/** Total price for a single line item including its add-ons. */
export function lineItemTotal(item: BookingLineItem): MoneySen {
  const base = item.unitPrice * item.quantity;
  const addOns = item.addOns.reduce(
    (sum, a) => sum + a.price * a.quantity,
    0,
  );
  return base + addOns;
}

/** Subtotal across all line items, before fees/discount/tax. */
export function cartSubtotal(items: BookingLineItem[]): MoneySen {
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}

/**
 * Compute the full price breakdown. Tax is applied after discount, on
 * (subtotal − discount + serviceFee), matching the server-side contract.
 */
export function computePricing(
  items: BookingLineItem[],
  discountSen = 0,
): PriceBreakdown {
  const subtotal = cartSubtotal(items);
  const discount = Math.min(discountSen, subtotal);
  const serviceFee = items.length > 0 ? SERVICE_FEE_SEN : 0;
  const taxable = Math.max(0, subtotal - discount + serviceFee);
  const tax = Math.round(taxable * SST_RATE);
  const total = taxable + tax;
  return {
    subtotal,
    serviceFee,
    discount,
    tax,
    total,
    currency: 'MYR',
  };
}
