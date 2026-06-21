// Unit tests for the dynamic pricing engine — runs with `node --test`.
// Fixtures are the worked examples from servisaku-booking-flows.md, evaluated
// against the real servisaku-services-config.json so the test doubles as a
// validation that the config encodes each pricing_type correctly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { computePrice, validateAnswers, PRICING_TYPES, QUESTION_TYPES } from '../dynamicPricing.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, '../../../prisma/data/servisaku-services-config.json'), 'utf8'),
);
const GLOBAL = config.globalConfig;

const allServices = config.categories.flatMap((c) => c.services);
const svc = (slug) => {
  const s = allServices.find((x) => x.slug === slug);
  if (!s) throw new Error(`fixture service not found: ${slug}`);
  return s;
};
const price = (slug, answers, ctx = {}) =>
  computePrice(svc(slug), answers, { globalConfig: GLOBAL, ...ctx });

// ── TIERED ───────────────────────────────────────────────────────────────────
test("TIERED — women's haircut: Long + Cut+Blow-dry = 110 → total 115", () => {
  const r = price('womens-haircut-styling', { length: 'long', service: 'cut_blow' });
  assert.equal(r.serviceTotal, 110);
  assert.equal(r.platformFee, 5);
  assert.equal(r.total, 115);
});

test('TIERED — negative modifier: Swedish 60min + back-only (−20) = 100 → 105', () => {
  const r = price('swedish-massage-men', { duration: '60', focus: 'back' });
  assert.equal(r.serviceTotal, 100);
  assert.equal(r.total, 105);
});

// ── FIXED ──────────────────────────────────────────────────────────────────--
test('FIXED — beard hot-towel shave 40 → total 45', () => {
  const r = price('beard-styling', { service: 'shave' });
  assert.equal(r.serviceTotal, 40);
  assert.equal(r.total, 45);
});

// ── BASE_PLUS_ADDONS ──────────────────────────────────────────────────────────
test('BASE_PLUS_ADDONS — facial Gold + De-tan = 155 → 160', () => {
  const r = price('facial-standard', { facial: 'gold', addons: ['detan'] });
  assert.equal(r.serviceTotal, 155);
  assert.equal(r.total, 160);
});

test('BASE_PLUS_ADDONS+QUANTITY — bridal full HD + trial + 2 members = 1340 (+visitFee 20)', () => {
  const r = price('bridal-makeup-hairdo', { package: 'full_hd', trial: 'yes', members: 2, addons: [] });
  // serviceTotal: 950 + 150 + (120×2) = 1340. Config sets visitFee:20 (deposit),
  // so the engine — config being the single source of truth — adds it: subtotal 1360.
  assert.equal(r.serviceTotal, 1340);
  assert.equal(r.visitFee, 20);
  assert.equal(r.total, 1365);
});

// ── PER_UNIT (reference example) ───────────────────────────────────────────────
test('PER_UNIT — switch/outlet ×4 switches + visit 20 = total 85', () => {
  const r = price('switch-outlet-replacement', { item: 'switch', qty: 4, material: 'customer' });
  assert.equal(r.serviceTotal, 60);
  assert.equal(r.visitFee, 20);
  assert.equal(r.total, 85);
});

test('PER_UNIT + perUnit modifier — deep sanitisation 2 bathrooms heavy = (55+20)×2 = 150 → 155', () => {
  const r = price('deep-sanitisation-bathroom', { qty: 2, condition: 'heavy' });
  assert.equal(r.serviceTotal, 150);
  assert.equal(r.total, 155);
});

// ── TIER_QUANTITY ──────────────────────────────────────────────────────────────
test('TIER_QUANTITY — AC servicing 2×1.5HP + 1×1.0HP = 307 → 312', () => {
  const r = price('ac-servicing', { units: { '1_5hp': 2, '1hp': 1 }, mount: 'wall' });
  assert.equal(r.serviceTotal, 307);
  assert.equal(r.total, 312);
});

test('TIER_QUANTITY + perUnit modifier — AC chemical 1×1.5HP overhaul = 180+60 = 240 → 245', () => {
  const r = price('ac-chemical-cleaning', { units: { '1_5hp': 1 }, type: 'overhaul' });
  assert.equal(r.serviceTotal, 240);
  assert.equal(r.total, 245);
});

test('TIER_QUANTITY mixed — AC install 1×1.5HP + new bracket + 4ft piping = 360 → 365', () => {
  const r = price('ac-installation', { units: { '1_5hp': 1 }, bracket: 'new', piping: 4, addons: [] });
  assert.equal(r.serviceTotal, 360);
  assert.equal(r.total, 365);
});

// ── PER_SQFT ───────────────────────────────────────────────────────────────────
test('PER_SQFT — interior painting 800sqft 2-coat premium = 2640 → 2645', () => {
  const r = price('interior-painting', {
    area: 800, coats: '2', grade: 'premium', prep: 'minor', material: 'included',
  });
  assert.equal(r.serviceTotal, 2640);
  assert.equal(r.total, 2645);
});

test('PER_SQFT — exterior 1200sqft + double-storey (0.70/sqft) = 4680 → 4685', () => {
  const r = price('exterior-painting', { area: 1200, height: 'double', weathershield: 'no' });
  assert.equal(r.serviceTotal, 4680);
  assert.equal(r.total, 4685);
});

// ── PER_HOUR ───────────────────────────────────────────────────────────────────
test('PER_HOUR — wiring 2 hrs ×60 + visit 20 = total 145', () => {
  const r = price('wiring-work', { scope: 'add_point', hours: 2 });
  assert.equal(r.serviceTotal, 120);
  assert.equal(r.total, 145);
});

test('PER_HOUR — enforces 1 hr minimum', () => {
  const r = price('wiring-work', { scope: 'add_point', hours: 0 });
  assert.equal(r.serviceTotal, 60);
});

// ── DIAGNOSTIC ─────────────────────────────────────────────────────────────────
test('DIAGNOSTIC — AC cooling repair: call-out only = visit 20 → total 25', () => {
  const r = price('ac-cooling-repair', { symptom: 'no_cool', qty: 1 });
  assert.equal(r.serviceTotal, 0); // on-site quote appended later, not at booking
  assert.equal(r.visitFee, 20);
  assert.equal(r.total, 25);
});

// ── Surcharges & SST ───────────────────────────────────────────────────────────
test('Surcharges — after-hours + urgent add 30 each', () => {
  const r = price('beard-styling', { service: 'shave' }, { afterHours: true, urgent: true });
  assert.equal(r.surcharges.total, 60);
  assert.equal(r.subtotal, 100); // 40 + 0 visit + 60
  assert.equal(r.total, 105);    // + platform 5
});

test('SST — when enabled, taxes (subtotal + platformFee) at 8%', () => {
  const r = price('beard-styling', { service: 'shave' }, { sstEnabled: true });
  // subtotal 40 + platform 5 = 45 → tax 3.6 → total 48.6
  assert.equal(r.tax, 3.6);
  assert.equal(r.total, 48.6);
});

// ── Validation ─────────────────────────────────────────────────────────────────
test('validateAnswers — flags missing required + bad option', () => {
  const { ok, errors } = validateAnswers(svc('womens-haircut-styling'), { service: 'bogus' });
  assert.equal(ok, false);
  assert.ok(errors.some((e) => /Hair length is required/.test(e)));
  assert.ok(errors.some((e) => /invalid option "bogus"/.test(e)));
});

test('validateAnswers — passes a valid basket', () => {
  const { ok } = validateAnswers(svc('switch-outlet-replacement'), { item: 'switch', qty: 4, material: 'customer' });
  assert.equal(ok, true);
});

// ── Config integrity — every service uses known enums and is computable ─────────
test('config integrity — all 71 services have valid pricingType & question types', () => {
  assert.equal(allServices.length, 71);
  for (const s of allServices) {
    assert.ok(PRICING_TYPES.includes(s.pricingType), `${s.slug}: bad pricingType ${s.pricingType}`);
    for (const q of s.questions || []) {
      assert.ok(QUESTION_TYPES.includes(q.type), `${s.slug}/${q.id}: bad type ${q.type}`);
    }
  }
});

test('config integrity — every service computes a finite total with default answers', () => {
  for (const s of allServices) {
    const answers = {};
    for (const q of s.questions || []) {
      if (q.type === 'TIER_SELECT' || q.type === 'SINGLE_SELECT') {
        answers[q.id] = (q.options.find((o) => o.isDefault) || q.options[0])?.id;
      } else if (q.type === 'MULTI_SELECT') answers[q.id] = [];
      else if (q.type === 'TIER_QUANTITY') answers[q.id] = { [q.options[0].id]: 1 };
      else if (q.type === 'QUANTITY') answers[q.id] = q.config?.min ?? 1;
      else if (q.type === 'AREA_INPUT') answers[q.id] = q.config?.min ?? 100;
      else if (q.type === 'HOURS_INPUT') answers[q.id] = q.config?.min ?? 1;
    }
    const r = computePrice(s, answers, { globalConfig: GLOBAL });
    assert.ok(Number.isFinite(r.total), `${s.slug}: non-finite total`);
    assert.ok(r.total >= 0, `${s.slug}: negative total ${r.total}`);
  }
});
