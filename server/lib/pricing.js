// Server-authoritative pricing — Phase 1, DB-driven.
// Reads ServicePackage + ServiceAddon + pricingConfig from the catalog tables
// (seeded from the legacy JS catalog), so the catalog is the single source of
// truth. The arithmetic still goes through calculatePrice() in the shared
// bookingEngine so web/server/(future) mobile agree on the formula.
import { calculatePrice } from '../../src/lib/bookingEngine.js';
import { ApiError } from './access.js';
import { resolveService } from './catalog.js';

// area_based services carry pricingConfig.tiers = [{ id, label, multiplier }].
function sizeMultiplierFor(service, sizeId) {
  const tiers = service.pricingConfig?.tiers;
  if (!Array.isArray(tiers) || tiers.length === 0) return 1.0;
  if (!sizeId) return 1.0; // no size chosen → base (2BR-equivalent) price
  const tier = tiers.find((t) => t.id === sizeId);
  if (!tier) throw new ApiError(400, `Unknown property size "${sizeId}" for ${service.slug}`);
  return tier.multiplier ?? 1.0;
}

async function resolveCoupon(prisma, couponCode, subtotal, serviceKey) {
  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!coupon || !coupon.isActive) throw new ApiError(400, 'Invalid coupon');
  if (coupon.validUntil && coupon.validUntil < new Date()) throw new ApiError(400, 'Coupon expired');
  if (coupon.maxUsage != null && coupon.usageCount >= coupon.maxUsage) throw new ApiError(400, 'Coupon usage limit reached');
  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Coupon requires a minimum order of RM${coupon.minOrderAmount}`);
  }
  if (Array.isArray(coupon.applicableServices) && coupon.applicableServices.length) {
    const allowed = coupon.applicableServices.map((s) => String(s).trim());
    if (!allowed.includes(serviceKey)) throw new ApiError(400, 'Coupon not valid for this service');
  }
  return coupon;
}

// Absolute package price wins; otherwise multiplier × service.basePrice (catalog style).
function packageBasePrice(service, pkg) {
  if (pkg.price != null) return pkg.price;
  return Math.round(service.basePrice * (pkg.multiplier ?? 1));
}

function buildLineItems(pkg, addons, pricing, coupon, discount) {
  const items = [
    { kind: 'package', refId: pkg.id, label: pkg.name, labelMy: pkg.nameMy, qty: 1, unitPrice: pricing.sizedBasePrice, total: pricing.sizedBasePrice },
    ...addons.map((a) => ({ kind: 'addon', refId: a.id, label: a.name, labelMy: a.nameMy, qty: 1, unitPrice: a.price, total: a.price })),
  ];
  if (coupon && discount > 0) {
    items.push({ kind: 'discount', refId: coupon.id, label: `Coupon ${coupon.code}`, labelMy: `Kupon ${coupon.code}`, qty: 1, unitPrice: -discount, total: -discount });
  }
  return items;
}

/**
 * Compute the authoritative price for a booking / quote.
 * @param {object} prisma
 * @param {object} args
 * @param {string} args.serviceId   service slug or id ("cleaning")
 * @param {string} args.packageId   package tier or id ("deep")
 * @param {string[]} [args.addonIds] addon slugs or ids
 * @param {string} [args.bedrooms]  legacy area-tier id (mapped to propertySize)
 * @param {object} [args.serviceSpecificData] workflow param answers
 * @param {string} [args.couponCode]
 * @returns full pricing breakdown + resolved catalog ids + line items
 */
export async function priceBooking(prisma, { serviceId, packageId, addonIds = [], bedrooms, serviceSpecificData, couponCode }) {
  const service = await resolveService(serviceId);
  if (!service) throw new ApiError(400, `Unknown service: ${serviceId}`);
  const serviceKey = service.slug;

  const pkg = service.packages.find((p) => p.tier === packageId || p.id === packageId);
  if (!pkg) throw new ApiError(400, `Unknown package "${packageId}" for service "${serviceKey}"`);

  const addons = addonIds.map((id) => {
    const addon = service.addons.find((a) => a.slug === id || a.id === id);
    if (!addon) throw new ApiError(400, `Unknown addon "${id}" for service "${serviceKey}"`);
    return addon;
  });

  const sizeId = bedrooms || serviceSpecificData?.propertySize || serviceSpecificData?.bedrooms || null;
  const sizeMultiplier = service.pricingModel === 'area_based' ? sizeMultiplierFor(service, sizeId) : 1.0;
  const basePrice = packageBasePrice(service, pkg);

  // Pass 1 (no coupon) yields the subtotal coupon rules are validated against.
  const base = calculatePrice(basePrice, 1.0, addons, null, 1, sizeMultiplier);

  let coupon = null;
  if (couponCode) {
    coupon = await resolveCoupon(prisma, couponCode, base.subtotal, serviceKey);
  }

  const pricing = calculatePrice(
    basePrice, 1.0, addons,
    coupon && {
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      max_discount_cap: coupon.maxDiscountCap,
    },
    1, sizeMultiplier,
  );

  return {
    ...pricing,
    serviceKey,
    serviceId: service.id,
    serviceSlug: service.slug,
    categoryId: service.categoryId,
    pricingModel: service.pricingModel,
    sizeId: service.pricingModel === 'area_based' ? sizeId : null,
    sizeMultiplier,
    packageId: pkg.id,
    packageTier: pkg.tier,
    packageName: pkg.name,
    packageNameMy: pkg.nameMy,
    addons,
    lineItems: buildLineItems(pkg, addons, pricing, coupon, pricing.discount),
    couponId: coupon?.id ?? null,
    couponCode: coupon?.code ?? null,
  };
}
