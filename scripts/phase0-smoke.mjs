/**
 * Phase 0 security smoke test.
 * Run: node scripts/phase0-smoke.mjs   (server must be running on :3001, DB seeded)
 *
 * Exercises authentication, authorization, ownership scoping, input validation,
 * and server-side pricing against a live server.
 */
const BASE = process.env.API_URL || 'http://localhost:3001/api';

let passed = 0, failed = 0;
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.error(`  ✗ ${name} ${extra}`); }
}

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }
  return { status: res.status, json };
}

async function login(email, password) {
  const r = await call('POST', '/auth/login', { body: { email, password } });
  if (r.status !== 200) throw new Error(`login failed for ${email}: ${JSON.stringify(r.json)}`);
  return r.json.access_token;
}

const futureDate = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);

console.log('— Unauthenticated access is rejected —');
for (const [method, path] of [
  ['GET', '/bookings'], ['GET', '/escrow'], ['GET', '/refunds'], ['GET', '/payouts'],
  ['GET', '/notifications'], ['GET', '/users'], ['GET', '/chat?booking_id=bk-seed-1'],
  ['PATCH', '/escrow/any-id'], ['DELETE', '/bookings/any-id'],
]) {
  const r = await call(method, path, method.startsWith('P') ? { body: { status: 'released' } } : {});
  check(`${method} ${path} → 401`, r.status === 401, `got ${r.status}`);
}
{
  const r = await call('GET', '/reviews');
  check('GET /reviews stays public → 200', r.status === 200, `got ${r.status}`);
}

console.log('— Privilege escalation is blocked —');
{
  const r = await call('POST', '/auth/register', {
    body: { email: `evil${Date.now()}@test.com`, password: 'password123', fullName: 'Evil', role: 'admin' },
  });
  check('register with role=admin → 400', r.status === 400, `got ${r.status}`);
}

const consumer = await login('user@servisaku.my', 'user123');
const partnerAli = await login('ali@servisaku.my', 'partner123');
const partnerRaj = await login('raj@servisaku.my', 'partner123');
const admin = await login('admin@servisaku.my', 'admin123');

{
  const r = await call('PATCH', '/auth/me', {
    token: consumer,
    body: { role: 'admin', partnerVerified: true, partnerRating: 5, bio: 'legit bio edit' },
  });
  check('PATCH /auth/me strips role/partnerVerified', r.status === 200 && r.json.role === 'consumer' && r.json.partnerVerified === false, JSON.stringify(r.json));
  check('PATCH /auth/me applies whitelisted field', r.json?.bio === 'legit bio edit');
}

console.log('— Ownership scoping —');
{
  const r = await call('GET', '/bookings', { token: consumer });
  check('consumer sees only own bookings', r.status === 200 && r.json.every((b) => b.consumer_email === 'user@servisaku.my'), JSON.stringify(r.json?.length));
  const r2 = await call('GET', '/bookings?consumer_email=someoneelse@x.com', { token: consumer });
  check('consumer cannot filter into others\' bookings', r2.status === 200 && r2.json.every((b) => b.consumer_email === 'user@servisaku.my'));
}
{
  const mine = await call('GET', '/bookings/bk-seed-1', { token: partnerAli });
  const notMine = await call('GET', '/bookings/bk-seed-1', { token: partnerRaj });
  check('assigned partner can read booking', mine.status === 200);
  check('other partner gets 403', notMine.status === 403, `got ${notMine.status}`);
}
{
  const r = await call('GET', '/users', { token: consumer });
  const ok = r.status === 200
    && r.json.every((u) => u.role === 'partner' && u.partner_verified)
    && r.json.every((u) => !('bank_account' in u));
  check('consumer user-list = verified partners only, no bank details', ok);
}

console.log('— Server-side pricing —');
let bookingId;
{
  // Client claims RM1; server must compute deep-clean(299) ×3BR(1.3) + window addon(40) = 429
  const r = await call('POST', '/bookings', {
    token: consumer,
    body: {
      service_id: 'cleaning', package_id: 'deep', addon_ids: ['window'], bedrooms: '3br',
      date: futureDate, time_slot: '10:00 AM', address: '1 Test St', city: 'Kuala Lumpur',
      payment_method: 'fpx',
      price: 1, platform_fee: 0.1, partner_payout: 0.1, payment_status: 'paid', status: 'completed',
    },
  });
  bookingId = r.json?.id;
  check('booking created', r.status === 201, JSON.stringify(r.json));
  check('client price ignored, server computes RM429', r.json?.price === 429, `got ${r.json?.price}`);
  check('payment_status forced to pending', r.json?.payment_status === 'pending', r.json?.payment_status);
  check('status forced to pending', r.json?.status === 'pending', r.json?.status);
  const esc = await call('GET', `/escrow?booking_id=${bookingId}`, { token: admin });
  check('escrow split computed server-side (fee 86)', esc.json?.[0]?.platform_fee === 86, JSON.stringify(esc.json?.[0]));
}
{
  const r = await call('POST', '/bookings', {
    token: consumer,
    body: { service_id: 'cleaning', package_id: 'deep', bedrooms: '3br', date: futureDate, coupon_code: 'WELCOME20' },
  });
  check('coupon applied server-side (cap RM50 → total 339)', r.json?.price === 339 && r.json?.discount_amount === 50, `got ${r.json?.price}/${r.json?.discount_amount}`);
}
{
  const r = await call('POST', '/bookings', {
    token: consumer,
    body: { service_id: 'cleaning', package_id: 'nonexistent', date: futureDate },
  });
  check('unknown package rejected', r.status === 400, `got ${r.status}`);
  const r2 = await call('POST', '/bookings', {
    token: consumer,
    body: { service_id: 'cleaning', package_id: 'deep', date: '2020-01-01' },
  });
  check('past date rejected', r2.status === 400, `got ${r2.status}`);
}

console.log('— Status transitions —');
{
  const r = await call('PATCH', `/bookings/${bookingId}`, { token: consumer, body: { status: 'completed' } });
  check('consumer cannot mark booking completed', r.status === 403, `got ${r.status}`);
  const r2 = await call('PATCH', `/bookings/${bookingId}`, { token: consumer, body: { payment_status: 'paid' } });
  check('consumer cannot mark booking paid', r2.status === 400 || r2.status === 403, `got ${r2.status}`);
  const r3 = await call('PATCH', `/bookings/${bookingId}`, { token: partnerRaj, body: { status: 'accepted' } });
  check('unassigned partner cannot touch booking', r3.status === 403, `got ${r3.status}`);
  const r4 = await call('PATCH', `/bookings/${bookingId}`, { token: consumer, body: { status: 'cancelled' } });
  check('consumer can cancel own pending booking', r4.status === 200 && r4.json.status === 'cancelled', `got ${r4.status}`);
}

console.log('— Money endpoints —');
{
  const esc = await call('GET', '/escrow', { token: admin });
  const escId = esc.json?.[0]?.id;
  const r = await call('PATCH', `/escrow/${escId}`, { token: consumer, body: { status: 'released' } });
  check('consumer cannot release escrow', r.status === 403, `got ${r.status}`);
  const r2 = await call('PATCH', `/escrow/${escId}`, { token: admin, body: { status: 'released' } });
  check('admin can release escrow', r2.status === 200 && r2.json.status === 'released');
}
{
  const r = await call('POST', '/refunds', {
    token: consumer,
    body: { booking_id: 'bk-seed-1', refund_type: 'partial', refund_amount: 99999, reason: 'testing clamp behaviour' },
  });
  check('refund amount clamped to booking price', r.status === 201 && r.json.refund_amount <= 120, JSON.stringify(r.json));
  const r2 = await call('PATCH', `/refunds/${r.json?.id}`, { token: consumer, body: { status: 'approved' } });
  check('consumer cannot approve refunds', r2.status === 403, `got ${r2.status}`);
}
{
  const r = await call('POST', '/coupons', {
    token: consumer,
    body: { code: 'HACK100', discount_type: 'percentage', discount_value: 100 },
  });
  check('consumer cannot create coupons', r.status === 403, `got ${r.status}`);
}

console.log('— Chat & notifications —');
{
  const r = await call('POST', '/chat', { token: partnerRaj, body: { booking_id: 'bk-seed-1', message: 'hi' } });
  check('non-participant cannot post chat', r.status === 403, `got ${r.status}`);
  const r2 = await call('POST', '/chat', { token: partnerAli, body: { booking_id: 'bk-seed-1', message: 'On my way', sender_email: 'spoof@x.com', sender_name: 'Spoofed' } });
  check('participant chat ok, sender from token', r2.status === 201 && r2.json.sender_email === 'ali@servisaku.my', JSON.stringify(r2.json));
}
{
  await call('POST', '/notifications', { token: consumer, body: { user_email: 'ali@servisaku.my', title: 'For Ali', body: 'x' } });
  const aliSees = await call('GET', '/notifications', { token: partnerAli });
  const consumerPeek = await call('GET', '/notifications?user_email=ali@servisaku.my', { token: consumer });
  check('targeted notification reaches recipient', aliSees.json?.some((n) => n.title === 'For Ali'));
  check('cannot read others\' notifications via query param', !consumerPeek.json?.some((n) => n.title === 'For Ali'));
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
