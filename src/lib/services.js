// Reference data shared by profile/onboarding/booking forms.
// The service catalogue itself is now 100% dynamic — see the DB-backed
// `servisaku.catalog.*` API (GET /categories, /services). No static catalogue
// lives here any more.

export const CITIES = [
  'Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya',
  'Ampang', 'Cheras', 'Bangsar', 'Mont Kiara',
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];
