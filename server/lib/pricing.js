// Server-authoritative pricing. The client may display its own estimate, but the
// amounts persisted on a booking are always recomputed here from the shared catalog
// data (single source of truth until the Phase 1 DB-driven catalog replaces it).
import { calculatePrice, getSizeMultiplier, isAreaScaled } from '../../src/lib/bookingEngine.js';
import { CATEGORY_PACKAGES, CATEGORY_ADDONS } from '../../src/lib/packageData.js';
import { ApiError } from './access.js';

// Legacy route slugs → catalog keys (mirrors getPackages/getAddons normalization,
// but strict: unknown service ids are rejected instead of falling back to cleaning).
function normalizeServiceId(serviceId) {
  const norm = serviceId === 'home-cleaning' ? 'cleaning'
    : serviceId === 'ac-servicing' ? 'ac'
    : serviceId;
  if (!CATEGORY_PACKAGES[norm]) throw new ApiError(400, `Unknown service: ${serviceId}`);
  return norm;
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

/**
 * Compute the authoritative price for a booking request.
 * @returns {{ subtotal, discount, total, platformFee, partnerPayout,
 *             packageName, addons, couponId }}
 */
export async function priceBooking(prisma, { serviceId, packageId, addonIds = [], bedrooms, couponCode }) {
  const serviceKey = normalizeServiceId(serviceId);

  const pkg = CATEGORY_PACKAGES[serviceKey].find((p) => p.id === packageId);
  if (!pkg) throw new ApiError(400, `Unknown package "${packageId}" for service "${serviceKey}"`);

  const available = CATEGORY_ADDONS[serviceKey] || [];
  const addons = addonIds.map((id) => {
    const addon = available.find((a) => a.id === id);
    if (!addon) throw new ApiError(400, `Unknown addon "${id}" for service "${serviceKey}"`);
    return addon;
  });

  const sizeMultiplier = isAreaScaled(serviceKey) ? getSizeMultiplier(bedrooms) : 1.0;

  // Pass 1 without coupon to get the subtotal coupon rules are checked against.
  const base = calculatePrice(pkg.price, 1.0, addons, null, 1, sizeMultiplier);

  let coupon = null;
  if (couponCode) {
    coupon = await resolveCoupon(prisma, couponCode, base.subtotal, serviceKey);
  }

  const pricing = calculatePrice(
    pkg.price, 1.0, addons,
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
    packageName: pkg.name,
    addons,
    couponId: coupon?.id ?? null,
    couponCode: coupon?.code ?? null,
  };
}
