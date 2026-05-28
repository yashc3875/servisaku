import { Home, Droplets, Zap, Wind, Paintbrush, Bug } from 'lucide-react';

export const SERVICES = [
  {
    id: 'home-cleaning',
    name: 'Home Cleaning',
    nameMy: 'Pembersihan Rumah',
    icon: Home,
    color: 'bg-emerald-50 text-emerald-600',
    price: 'From RM89',
    description: 'Professional deep cleaning for your home',
    descriptionMy: 'Pembersihan mendalam profesional untuk rumah anda',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    priceRange: [89, 299],
    duration: '2-4 hours',
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    nameMy: 'Paip Air',
    icon: Droplets,
    color: 'bg-blue-50 text-blue-600',
    price: 'From RM69',
    description: 'Fix leaks, clogs, and installations',
    descriptionMy: 'Baiki kebocoran, tersumbat dan pemasangan',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
    priceRange: [69, 499],
    duration: '1-3 hours',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    nameMy: 'Elektrikal',
    icon: Zap,
    color: 'bg-amber-50 text-amber-600',
    price: 'From RM79',
    description: 'Wiring, repairs, and electrical installations',
    descriptionMy: 'Pendawaian, pembaikan dan pemasangan elektrik',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    priceRange: [79, 599],
    duration: '1-4 hours',
  },
  {
    id: 'ac-servicing',
    name: 'AC Servicing',
    nameMy: 'Servis Penyaman Udara',
    icon: Wind,
    color: 'bg-cyan-50 text-cyan-600',
    price: 'From RM59',
    description: 'AC cleaning, gas top-up, and repairs',
    descriptionMy: 'Pembersihan AC, tambah gas dan pembaikan',
    image: 'https://media.base44.com/images/public/6a1572582a8e67fb23e0b043/fbc9e7de4_ac.jpg',
    priceRange: [59, 399],
    duration: '1-2 hours',
  },
  {
    id: 'painting',
    name: 'Painting',
    nameMy: 'Cat Rumah',
    icon: Paintbrush,
    color: 'bg-violet-50 text-violet-600',
    price: 'From RM199',
    description: 'Interior and exterior painting services',
    descriptionMy: 'Perkhidmatan mengecat dalaman dan luaran',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
    priceRange: [199, 1999],
    duration: '1-3 days',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    nameMy: 'Kawalan Serangga',
    icon: Bug,
    color: 'bg-red-50 text-red-600',
    price: 'From RM99',
    description: 'Termite, cockroach, and mosquito control',
    descriptionMy: 'Kawalan anai-anai, lipas dan nyamuk',
    image: 'https://media.base44.com/images/public/6a1572582a8e67fb23e0b043/e20b6023f_pest.jpg',
    priceRange: [99, 699],
    duration: '1-2 hours',
  },
];

export const CITIES = [
  'Kuala Lumpur', 'Petaling Jaya', 'Shah Alam', 'Subang Jaya',
  'Ampang', 'Cheras', 'Bangsar', 'Mont Kiara'
];

export const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];