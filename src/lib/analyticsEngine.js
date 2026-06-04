// ServisAku Analytics Engine — KPI computation & aggregation
import { servisaku } from '@/api/servisakuClient';
import moment from 'moment';

// ─── Data loader — fetches all entities needed for analytics ─────────────
export async function loadAnalyticsData() {
  const [bookings, users, payments, reviews, payouts, refunds] = await Promise.all([
    servisaku.entities.Booking.list('-created_date', 500),
    servisaku.entities.User.list('-created_date', 500),
    servisaku.entities.Payment.list('-created_date', 500),
    servisaku.entities.Review.list('-created_date', 500),
    servisaku.entities.PayoutRecord.list('-created_date', 200),
    servisaku.entities.RefundRequest.list('-created_date', 200),
  ]);
  return { bookings, users, payments, reviews, payouts, refunds };
}

// ─── Date range helpers ───────────────────────────────────────────────────
export function filterByRange(items, days, dateField = 'created_date') {
  const cutoff = moment().subtract(days, 'days').toISOString();
  return items.filter(i => i[dateField] >= cutoff);
}

export function getDateRangeCutoff(period) {
  const map = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
  return moment().subtract(map[period] || 30, 'days');
}

// ─── Core KPIs ────────────────────────────────────────────────────────────
export function computeKPIs(data, period = '30d') {
  const { bookings, users, payments, reviews } = data;
  const days = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[period] || 30;
  const cutoff = moment().subtract(days, 'days');
  const prevCutoff = moment().subtract(days * 2, 'days');

  const cur = bookings.filter(b => moment(b.created_date).isAfter(cutoff));
  const prev = bookings.filter(b => moment(b.created_date).isAfter(prevCutoff) && moment(b.created_date).isBefore(cutoff));

  const completed = cur.filter(b => b.status === 'completed');
  const prevCompleted = prev.filter(b => b.status === 'completed');

  const gmv = completed.reduce((s, b) => s + (b.price || 0), 0);
  const prevGmv = prevCompleted.reduce((s, b) => s + (b.price || 0), 0);
  const revenue = completed.reduce((s, b) => s + (b.platform_fee || 0), 0);
  const prevRevenue = prevCompleted.reduce((s, b) => s + (b.platform_fee || 0), 0);

  const consumers = users.filter(u => u.role === 'consumer' || u.role === 'user');
  const partners = users.filter(u => u.role === 'partner');
  const activePartners = partners.filter(u => u.is_online || moment(u.updated_date).isAfter(moment().subtract(7, 'days')));

  // Repeat booking rate
  const consumerBookingCount = {};
  bookings.forEach(b => { consumerBookingCount[b.consumer_email] = (consumerBookingCount[b.consumer_email] || 0) + 1; });
  const repeatConsumers = Object.values(consumerBookingCount).filter(c => c > 1).length;
  const repeatRate = consumers.length > 0 ? Math.round((repeatConsumers / consumers.length) * 100) : 0;

  const cancelled = cur.filter(b => b.status === 'cancelled');
  const cancellationRate = cur.length > 0 ? Math.round((cancelled.length / cur.length) * 100) : 0;
  const avgBookingValue = completed.length > 0 ? Math.round(gmv / completed.length) : 0;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  const growth = (base, prev) => prev > 0 ? Math.round(((base - prev) / prev) * 100) : 0;

  return {
    gmv, gmvGrowth: growth(gmv, prevGmv),
    revenue, revenueGrowth: growth(revenue, prevRevenue),
    totalBookings: cur.length, completedBookings: completed.length,
    activeConsumers: consumers.length,
    activePartners: activePartners.length, totalPartners: partners.length,
    repeatRate, cancellationRate, avgBookingValue,
    avgRating: parseFloat(avgRating),
    completionRate: cur.length > 0 ? Math.round((completed.length / cur.length) * 100) : 0,
  };
}

// ─── Booking trend by day ─────────────────────────────────────────────────
export function buildBookingTrend(bookings, days = 30) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = moment().subtract(i, 'days');
    const dayStr = day.format('YYYY-MM-DD');
    const dayBookings = bookings.filter(b => b.created_date?.startsWith(dayStr));
    result.push({
      date: day.format('D MMM'),
      bookings: dayBookings.length,
      completed: dayBookings.filter(b => b.status === 'completed').length,
      revenue: dayBookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.platform_fee || 0), 0),
    });
  }
  return result;
}

// ─── Service category performance ────────────────────────────────────────
export function buildCategoryPerformance(bookings) {
  const map = {};
  bookings.forEach(b => {
    if (!map[b.service_type]) map[b.service_type] = { service: b.service_type, bookings: 0, revenue: 0, completed: 0 };
    map[b.service_type].bookings++;
    if (b.status === 'completed') {
      map[b.service_type].completed++;
      map[b.service_type].revenue += (b.price || 0);
    }
  });
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

// ─── Peak hours analysis ──────────────────────────────────────────────────
export function buildPeakHours(bookings) {
  const SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
  return SLOTS.map(slot => ({
    slot: slot.replace(' AM', 'am').replace(' PM', 'pm'),
    count: bookings.filter(b => b.time_slot === slot).length,
  }));
}

// ─── Financial summary ────────────────────────────────────────────────────
export function buildFinancialSummary(bookings, refunds, days = 30) {
  const cutoff = moment().subtract(days, 'days');
  const cur = bookings.filter(b => moment(b.created_date).isAfter(cutoff) && b.status === 'completed');
  const weekly = [];
  for (let i = Math.ceil(days / 7) - 1; i >= 0; i--) {
    const weekStart = moment().subtract(i + 1, 'weeks').startOf('week');
    const weekEnd = moment().subtract(i, 'weeks').startOf('week');
    const weekBookings = cur.filter(b => moment(b.created_date).isBetween(weekStart, weekEnd));
    weekly.push({
      week: weekStart.format('D MMM'),
      gmv: weekBookings.reduce((s, b) => s + (b.price || 0), 0),
      revenue: weekBookings.reduce((s, b) => s + (b.platform_fee || 0), 0),
      payout: weekBookings.reduce((s, b) => s + (b.partner_payout || 0), 0),
    });
  }
  const curRefunds = refunds.filter(r => moment(r.created_date).isAfter(cutoff));
  const refundTotal = curRefunds.filter(r => r.status === 'processed').reduce((s, r) => s + (r.refund_amount || 0), 0);
  return { weekly, refundTotal, refundCount: curRefunds.length };
}

// ─── Partner performance ──────────────────────────────────────────────────
export function buildPartnerPerformance(bookings, users, reviews) {
  const partners = users.filter(u => u.role === 'partner');
  return partners.map(p => {
    const pBookings = bookings.filter(b => b.partner_email === p.email);
    const completed = pBookings.filter(b => b.status === 'completed');
    const cancelled = pBookings.filter(b => b.status === 'cancelled' && b.cancelled_by === 'partner');
    const pReviews = reviews.filter(r => r.partner_email === p.email);
    const avgRating = pReviews.length > 0
      ? (pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length).toFixed(1)
      : null;
    return {
      id: p.id, name: p.full_name, email: p.email,
      totalJobs: pBookings.length, completedJobs: completed.length,
      cancelledJobs: cancelled.length,
      completionRate: pBookings.length > 0 ? Math.round((completed.length / pBookings.length) * 100) : 0,
      earnings: completed.reduce((s, b) => s + (b.partner_payout || 0), 0),
      avgRating: avgRating ? parseFloat(avgRating) : null,
      reviewCount: pReviews.length,
      isVerified: p.partner_verified,
    };
  }).filter(p => p.totalJobs > 0).sort((a, b) => b.completedJobs - a.completedJobs);
}

// ─── Consumer analytics ───────────────────────────────────────────────────
export function buildConsumerAnalytics(bookings, users) {
  const consumers = users.filter(u => u.role === 'consumer' || u.role === 'user');
  const bookingsByConsumer = {};
  bookings.forEach(b => {
    if (!bookingsByConsumer[b.consumer_email]) bookingsByConsumer[b.consumer_email] = [];
    bookingsByConsumer[b.consumer_email].push(b);
  });
  const ltv = consumers.map(c => {
    const cb = bookingsByConsumer[c.email] || [];
    const spent = cb.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);
    return { email: c.email, name: c.full_name, bookings: cb.length, spent, lastBooking: cb[0]?.created_date };
  }).filter(c => c.bookings > 0).sort((a, b) => b.spent - a.spent);

  // City distribution
  const cityMap = {};
  bookings.forEach(b => { if (b.city) cityMap[b.city] = (cityMap[b.city] || 0) + 1; });
  const cityData = Object.entries(cityMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count);

  return { ltv, cityData };
}

// ─── CSV export ───────────────────────────────────────────────────────────
export function exportToCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}