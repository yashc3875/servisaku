// Demo accounts + a few partner specializations + coupons — WITHOUT touching the
// catalog (the dynamic booking engine owns that via bookingEngineSeed.js).
// Run: node prisma/seedUsers.js   (or: npm run db:seed:users)
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPw = await bcrypt.hash('admin123', 10);
  const partnerPw = await bcrypt.hash('partner123', 10);
  const userPw = await bcrypt.hash('user123', 10);

  const users = [
    { email: 'admin@servisaku.my', passwordHash: adminPw, fullName: 'Admin User', role: 'admin' },
    { email: 'user@servisaku.my', passwordHash: userPw, fullName: 'Demo User', role: 'consumer', city: 'Kuala Lumpur' },
    { email: 'ali@servisaku.my', passwordHash: partnerPw, fullName: 'Ali Ahmad', role: 'partner', partnerVerified: true, partnerRating: 4.9, city: 'Kuala Lumpur', bio: 'Expert home cleaner.' },
    { email: 'raj@servisaku.my', passwordHash: partnerPw, fullName: 'Raj Kumar', role: 'partner', partnerVerified: true, partnerRating: 4.7, city: 'Petaling Jaya', bio: 'AC servicing specialist.' },
    { email: 'siti@servisaku.my', passwordHash: partnerPw, fullName: 'Siti Nurhaliza', role: 'partner', partnerVerified: true, partnerRating: 4.8, city: 'Kuala Lumpur', bio: 'Plumbing & repair expert.' },
    { email: 'chong@servisaku.my', passwordHash: partnerPw, fullName: 'David Chong', role: 'partner', partnerVerified: true, partnerRating: 5.0, city: 'Subang Jaya', bio: 'Pest control specialist.' },
  ];

  const byEmail = {};
  for (const u of users) {
    byEmail[u.email] = await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
  }

  // Verify a few partners on real booking-engine services (for dispatch/matching demos).
  const specs = [
    ['ali@servisaku.my', 'full-house-cleaning'],
    ['raj@servisaku.my', 'ac-servicing'],
    ['siti@servisaku.my', 'tap-repair-replacement'],
    ['chong@servisaku.my', 'cockroach-control'],
  ];
  for (const [email, slug] of specs) {
    const svc = await prisma.service.findUnique({ where: { slug } });
    if (!svc) continue;
    await prisma.partnerSpecialization.upsert({
      where: { partnerId_serviceId: { partnerId: byEmail[email].id, serviceId: svc.id } },
      update: { verifiedByAdmin: true, isActive: true },
      create: { partnerId: byEmail[email].id, serviceId: svc.id, verifiedByAdmin: true, isActive: true, yearsExperience: 4 },
    });
  }

  // Handy demo coupons.
  await prisma.coupon.upsert({ where: { code: 'WELCOME20' }, update: {}, create: { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, maxDiscountCap: 50, minOrderAmount: 100, isActive: true } });
  await prisma.coupon.upsert({ where: { code: 'RM50OFF' }, update: {}, create: { code: 'RM50OFF', discountType: 'fixed', discountValue: 50, minOrderAmount: 200, isActive: true } });

  console.log(`✅ Seeded ${users.length} demo accounts.`);
  console.log('   Admin:   admin@servisaku.my / admin123');
  console.log('   User:    user@servisaku.my  / user123');
  console.log('   Partner: ali@servisaku.my   / partner123');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
