// ServisAku booking status state machine + post-booking shared constants.
// (Pricing/quoting now lives entirely in the dynamic engine: server-side
// `dynamicPricing.js` via POST /api/bookings/calculate.)

export const STATUS_TRANSITIONS = {
  pending:    ['assigned', 'cancelled'],
  assigned:   ['accepted', 'cancelled'],
  accepted:   ['en_route', 'cancelled'],
  en_route:   ['arrived', 'cancelled'],
  arrived:    ['started', 'disputed'],
  started:    ['completed', 'disputed'],
  completed:  ['disputed'],
  cancelled:  [],
  disputed:   ['completed', 'cancelled'],
};

export const STATUS_META = {
  pending:   { label: 'Pending',     icon: '⏳', color: 'amber',   step: 0 },
  assigned:  { label: 'Assigned',    icon: '👷', color: 'blue',    step: 1 },
  accepted:  { label: 'Accepted',    icon: '✅', color: 'indigo',  step: 2 },
  en_route:  { label: 'En Route',    icon: '🚗', color: 'violet',  step: 3 },
  arrived:   { label: 'Arrived',     icon: '📍', color: 'primary', step: 4 },
  started:   { label: 'In Progress', icon: '🔧', color: 'primary', step: 5 },
  completed: { label: 'Completed',   icon: '🎉', color: 'emerald', step: 6 },
  cancelled: { label: 'Cancelled',   icon: '❌', color: 'red',     step: -1 },
  disputed:  { label: 'Disputed',    icon: '⚠️', color: 'orange',  step: -1 },
};

export const SLOT_GROUPS = {
  Morning:   { label: 'Morning',   sub: '8 AM – 12 PM', emoji: '🌅', slots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'] },
  Afternoon: { label: 'Afternoon', sub: '12 PM – 4 PM', emoji: '☀️', slots: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'] },
  Evening:   { label: 'Evening',   sub: '4 PM – 7 PM',  emoji: '🌇', slots: ['4:00 PM', '5:00 PM', '6:00 PM'] },
};

export function canTransition(from, to) {
  return STATUS_TRANSITIONS[from]?.includes(to) || false;
}

export function isTerminal(status) {
  return ['completed', 'cancelled'].includes(status);
}

export function isRefundEligible(booking) {
  if (booking.status === 'cancelled' && booking.payment_status === 'paid') return true;
  const hoursUntilService = (new Date(booking.date) - new Date()) / 3600000;
  if (['pending', 'assigned'].includes(booking.status) && hoursUntilService > 4) return true;
  return false;
}

export function getNextStatuses(status) {
  return STATUS_TRANSITIONS[status] || [];
}

export function formatBookingRef(id) {
  return `FM-${new Date().getFullYear()}-${id?.slice(-6).toUpperCase() || 'XXXXXX'}`;
}

export const PAYMENT_METHODS = [
  { id: 'fpx', label: 'FPX Online Banking', icon: '🏦', sub: 'Maybank, CIMB, Public Bank' },
  { id: 'tng', label: 'Touch n Go eWallet', icon: '💚', sub: 'Instant payment' },
  { id: 'grabpay', label: 'GrabPay', icon: '🟢', sub: 'Pay with Grab credits' },
  { id: 'boost', label: 'Boost', icon: '🔵', sub: 'Cashback rewards' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard' },
  { id: 'cash', label: 'Cash on Service', icon: '💵', sub: 'Pay at completion' },
];