// Surcharge triggers derived from the chosen slot/date (booking-flows.md §1.6).
// Shared by Step C (badges) and the wizard (live quote + create payload).

// After-hours = before 9am or 7pm onward. Slot labels look like "8:00 AM".
export function isAfterHours(slotLabel) {
  if (!slotLabel) return false;
  const m = String(slotLabel).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return false;
  let hour = Number(m[1]) % 12;
  if (/PM/i.test(m[3])) hour += 12;
  return hour < 9 || hour >= 19;
}

// Urgent = booked for today (local date).
export function isUrgent(dateStr) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().slice(0, 10);
}
