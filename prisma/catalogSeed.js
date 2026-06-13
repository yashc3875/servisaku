// Catalog seed — Phase 1 service abstraction.
// Seeds 3 fully-configured services (Cleaning, Plumbing, Electrical) into the
// DB-driven catalog tables, sourced from the legacy JS catalog so pricing stays
// identical to Phase 0 (the smoke test books cleaning/deep/3br + window = RM429).
//
// Each ServiceCategory carries a fully-populated workflowConfig JSON: booking
// steps, required fields, pricing model, cancellation policy, and arrival window.
// One Service per category holds the packages + add-ons and the pricing model.
import { CATEGORY_PACKAGES, CATEGORY_ADDONS } from '../src/lib/packageData.js';
import { BEDROOM_OPTIONS, PROPERTY_TYPES } from '../src/lib/bookingEngine.js';

// Shared job lifecycle (mirrors STATUS_TRANSITIONS happy path in bookingEngine.js).
const JOB_LIFECYCLE = ['assigned', 'accepted', 'en_route', 'arrived', 'started', 'completed'];

// area_based pricing tiers come straight from BEDROOM_OPTIONS so the DB-driven
// engine reproduces getSizeMultiplier() exactly.
const SIZE_TIERS = BEDROOM_OPTIONS.map((b) => ({
  id: b.value,
  label: b.label,
  multiplier: b.multiplier,
}));

// ── Workflow configs ─────────────────────────────────────────────────────────

const cleaningWorkflow = {
  pricingModel: 'area_based',
  bookingSteps: [
    { type: 'service_select', title: 'Choose a package', titleMy: 'Pilih pakej' },
    {
      type: 'params',
      title: 'Property details',
      titleMy: 'Butiran hartanah',
      fields: [
        { id: 'propertySize', widget: 'tier_select', label: 'Property size', labelMy: 'Saiz hartanah', required: true, bindsTo: 'pricing', optionsFrom: 'pricingTiers' },
        { id: 'propertyType', widget: 'select', label: 'Property type', labelMy: 'Jenis hartanah', required: true, options: PROPERTY_TYPES },
        { id: 'hasPets', widget: 'toggle', label: 'Any pets at home?', labelMy: 'Ada haiwan peliharaan?', required: false },
        { id: 'specialInstructions', widget: 'textarea', label: 'Special instructions', labelMy: 'Arahan khas', required: false, maxLength: 500 },
      ],
    },
    { type: 'addons', title: 'Add-ons', titleMy: 'Tambahan' },
    { type: 'schedule', title: 'Date & time', titleMy: 'Tarikh & masa', slotGranularityMin: 60, leadTimeHours: 3, emergencyAvailable: false },
    { type: 'address', title: 'Service address', titleMy: 'Alamat perkhidmatan' },
    { type: 'review_pay', title: 'Review & confirm', titleMy: 'Semak & sahkan' },
  ],
  requiredParams: ['propertySize'],
  partnerPreferences: { genderMatch: 'optional' },
  jobLifecycle: JOB_LIFECYCLE,
  completionRequirements: {
    qaPhotos: { min: 2, stages: ['before', 'after'] },
    checklist: ['areas_done', 'customer_walkthrough'],
  },
  cancellationPolicy: { freeUntilHours: 24, partialRefundPercent: 50, partialUntilHours: 4, noRefundWithinHours: 4 },
  arrivalWindowMin: 60,
  warrantyDays: 7,
  quoteFlow: false,
};

const plumbingWorkflow = {
  pricingModel: 'flat',
  bookingSteps: [
    { type: 'service_select', title: 'Choose a service', titleMy: 'Pilih perkhidmatan' },
    {
      type: 'params',
      title: 'Describe the issue',
      titleMy: 'Terangkan masalah',
      fields: [
        { id: 'problemType', widget: 'select', label: 'Problem type', labelMy: 'Jenis masalah', required: true, options: ['Leak', 'Clog / Blockage', 'Installation', 'No water', 'Water heater', 'Other'] },
        { id: 'urgency', widget: 'select', label: 'Urgency', labelMy: 'Kesegeraan', required: true, options: ['Standard', 'Emergency'] },
        { id: 'description', widget: 'textarea', label: 'Describe the problem', labelMy: 'Terangkan masalah', required: true, maxLength: 1000 },
        { id: 'photos', widget: 'photo_upload', label: 'Photos (optional)', labelMy: 'Gambar (pilihan)', required: false, max: 4 },
      ],
    },
    { type: 'addons', title: 'Add-ons', titleMy: 'Tambahan' },
    { type: 'schedule', title: 'Date & time', titleMy: 'Tarikh & masa', slotGranularityMin: 60, leadTimeHours: 2, emergencyAvailable: true },
    { type: 'address', title: 'Service address', titleMy: 'Alamat perkhidmatan' },
    { type: 'review_pay', title: 'Review & confirm', titleMy: 'Semak & sahkan' },
  ],
  requiredParams: ['problemType', 'urgency', 'description'],
  partnerPreferences: { genderMatch: 'optional' },
  jobLifecycle: JOB_LIFECYCLE,
  completionRequirements: {
    qaPhotos: { min: 1, stages: ['after'] },
    checklist: ['issue_resolved', 'tested_with_customer'],
  },
  cancellationPolicy: { freeUntilHours: 12, partialRefundPercent: 50, partialUntilHours: 2, noRefundWithinHours: 2 },
  arrivalWindowMin: 90,
  warrantyDays: 30,
  quoteFlow: false,
};

const electricalWorkflow = {
  pricingModel: 'flat',
  bookingSteps: [
    { type: 'service_select', title: 'Choose a service', titleMy: 'Pilih perkhidmatan' },
    {
      type: 'params',
      title: 'Describe the issue',
      titleMy: 'Terangkan masalah',
      fields: [
        { id: 'problemType', widget: 'select', label: 'Problem type', labelMy: 'Jenis masalah', required: true, options: ['Power trip', 'Wiring fault', 'Socket / Switch', 'Lighting', 'DB board', 'No power', 'Other'] },
        { id: 'urgency', widget: 'select', label: 'Urgency', labelMy: 'Kesegeraan', required: true, options: ['Standard', 'Emergency'] },
        { id: 'description', widget: 'textarea', label: 'Describe the problem', labelMy: 'Terangkan masalah', required: true, maxLength: 1000 },
        { id: 'photos', widget: 'photo_upload', label: 'Photos (optional)', labelMy: 'Gambar (pilihan)', required: false, max: 4 },
      ],
    },
    { type: 'addons', title: 'Add-ons', titleMy: 'Tambahan' },
    { type: 'schedule', title: 'Date & time', titleMy: 'Tarikh & masa', slotGranularityMin: 60, leadTimeHours: 2, emergencyAvailable: true },
    { type: 'address', title: 'Service address', titleMy: 'Alamat perkhidmatan' },
    { type: 'review_pay', title: 'Review & confirm', titleMy: 'Semak & sahkan' },
  ],
  requiredParams: ['problemType', 'urgency', 'description'],
  partnerPreferences: { genderMatch: 'optional' },
  jobLifecycle: JOB_LIFECYCLE,
  completionRequirements: {
    qaPhotos: { min: 1, stages: ['after'] },
    checklist: ['safety_tested', 'issue_resolved'],
  },
  cancellationPolicy: { freeUntilHours: 12, partialRefundPercent: 50, partialUntilHours: 2, noRefundWithinHours: 2 },
  arrivalWindowMin: 90,
  warrantyDays: 30,
  quoteFlow: false,
};

// ── Category/service definitions ─────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: 'cleaning',
    name: 'Home Cleaning',
    nameMy: 'Pembersihan Rumah',
    tagline: 'Spotless homes, on demand',
    taglineMy: 'Rumah berkilat, ikut permintaan',
    iconKey: 'Sparkles',
    accent: 'emerald',
    emergencySupported: false,
    recurringSupported: true,
    pricingModel: 'area_based',
    pricingConfig: { tiers: SIZE_TIERS },
    workflowConfig: cleaningWorkflow,
    packageKey: 'cleaning',
    service: {
      slug: 'cleaning',
      name: 'Home Cleaning',
      nameMy: 'Pembersihan Rumah',
      description: 'Professional home cleaning — basic upkeep to deep and move-out cleans.',
      descriptionMy: 'Pembersihan rumah profesional — penyelenggaraan asas hingga pembersihan mendalam dan pindah keluar.',
      durationMin: 120,
      durationMax: 480,
    },
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    nameMy: 'Paip',
    tagline: 'Leaks, clogs & installs, fixed fast',
    taglineMy: 'Bocor, sumbat & pemasangan, cepat dibaiki',
    iconKey: 'Droplets',
    accent: 'sky',
    emergencySupported: true,
    recurringSupported: false,
    pricingModel: 'flat',
    pricingConfig: {},
    workflowConfig: plumbingWorkflow,
    packageKey: 'plumbing',
    service: {
      slug: 'plumbing',
      name: 'Plumbing Service',
      nameMy: 'Servis Paip',
      description: 'Licensed plumbers for leaks, blockages, installations and emergencies.',
      descriptionMy: 'Tukang paip berlesen untuk kebocoran, sumbatan, pemasangan dan kecemasan.',
      durationMin: 45,
      durationMax: 240,
    },
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    nameMy: 'Elektrik',
    tagline: 'Safe, certified electrical work',
    taglineMy: 'Kerja elektrik selamat & bertauliah',
    iconKey: 'Zap',
    accent: 'amber',
    emergencySupported: true,
    recurringSupported: false,
    pricingModel: 'flat',
    pricingConfig: {},
    workflowConfig: electricalWorkflow,
    packageKey: 'electrical',
    service: {
      slug: 'electrical',
      name: 'Electrical Service',
      nameMy: 'Servis Elektrik',
      description: 'Certified electricians for sockets, lighting, wiring, DB boards and faults.',
      descriptionMy: 'Juruelektrik bertauliah untuk soket, lampu, pendawaian, DB board dan kerosakan.',
      durationMin: 45,
      durationMax: 300,
    },
  },
];

export async function seedCatalog(prisma) {
  console.log('🗂️  Seeding catalog (cleaning, plumbing, electrical)...');

  for (const cat of CATEGORIES) {
    const packages = CATEGORY_PACKAGES[cat.packageKey] || [];
    const addons = CATEGORY_ADDONS[cat.packageKey] || [];
    const minPrice = packages.reduce((m, p) => Math.min(m, p.price), Infinity);
    const priceFrom = Number.isFinite(minPrice) ? minPrice : 0;

    const category = await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name, nameMy: cat.nameMy, tagline: cat.tagline, taglineMy: cat.taglineMy,
        iconKey: cat.iconKey, accent: cat.accent, emergencySupported: cat.emergencySupported,
        recurringSupported: cat.recurringSupported, priceFrom, workflowConfig: cat.workflowConfig,
        isActive: true,
      },
      create: {
        slug: cat.slug, name: cat.name, nameMy: cat.nameMy, tagline: cat.tagline, taglineMy: cat.taglineMy,
        iconKey: cat.iconKey, accent: cat.accent, emergencySupported: cat.emergencySupported,
        recurringSupported: cat.recurringSupported, priceFrom, workflowConfig: cat.workflowConfig,
      },
    });

    const service = await prisma.service.upsert({
      where: { slug: cat.service.slug },
      update: {
        categoryId: category.id, name: cat.service.name, nameMy: cat.service.nameMy,
        description: cat.service.description, descriptionMy: cat.service.descriptionMy,
        basePrice: priceFrom, pricingModel: cat.pricingModel, pricingConfig: cat.pricingConfig,
        durationMin: cat.service.durationMin, durationMax: cat.service.durationMax, isActive: true,
      },
      create: {
        slug: cat.service.slug, categoryId: category.id, name: cat.service.name, nameMy: cat.service.nameMy,
        description: cat.service.description, descriptionMy: cat.service.descriptionMy,
        basePrice: priceFrom, pricingModel: cat.pricingModel, pricingConfig: cat.pricingConfig,
        durationMin: cat.service.durationMin, durationMax: cat.service.durationMax,
      },
    });

    for (let i = 0; i < packages.length; i++) {
      const p = packages[i];
      const data = {
        serviceId: service.id, tier: p.id, name: p.name, nameMy: p.nameMy,
        description: p.desc || '', descriptionMy: p.descMy || '',
        price: p.price, multiplier: null,
        inclusions: p.inclusions || [], inclusionsMy: p.inclusionsMy || [],
        isPopular: !!p.isPopular, sortOrder: i,
      };
      await prisma.servicePackage.upsert({
        where: { serviceId_tier: { serviceId: service.id, tier: p.id } },
        update: data,
        create: data,
      });
    }

    for (const a of addons) {
      const data = {
        serviceId: service.id, slug: a.id, name: a.label, nameMy: a.labelMy,
        price: a.price, isActive: true,
      };
      await prisma.serviceAddon.upsert({
        where: { serviceId_slug: { serviceId: service.id, slug: a.id } },
        update: data,
        create: data,
      });
    }

    console.log(`   ✓ ${cat.name}: ${packages.length} packages, ${addons.length} add-ons`);
  }
}
