// Partner matching / dispatch eligibility.
// A partner is eligible for a service when: their account is admin-verified
// (User.partnerVerified) AND they hold an active, admin-verified specialization
// (PartnerSpecialization) for that service. Optional city filter narrows by area.
import { prisma } from '../db.js';
import { resolveService } from './catalog.js';
import { ApiError } from './access.js';

export async function findEligiblePartners(serviceIdOrSlug, { city } = {}) {
  const service = await resolveService(serviceIdOrSlug);
  if (!service) throw new ApiError(404, `Service not found: ${serviceIdOrSlug}`);

  const specs = await prisma.partnerSpecialization.findMany({
    where: {
      serviceId: service.id,
      verifiedByAdmin: true,
      isActive: true,
      partner: { role: 'partner', partnerVerified: true, ...(city ? { city } : {}) },
    },
    include: { partner: true },
    orderBy: { partner: { partnerRating: 'desc' } },
  });

  const partners = specs.map((s) => ({ ...s.partner, yearsExperience: s.yearsExperience }));
  return { service, partners };
}

// Used at booking time to reject assigning a partner who isn't vetted for the service.
export async function isPartnerEligible(partnerId, serviceId) {
  const spec = await prisma.partnerSpecialization.findUnique({
    where: { partnerId_serviceId: { partnerId, serviceId } },
  });
  return !!(spec && spec.verifiedByAdmin && spec.isActive);
}
