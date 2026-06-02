import React from 'react';
import { Section, SeeAllLink } from '@/components/primitives/Section';
import { Sparkles, Wind, Droplets, Zap, Paintbrush, Bug, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_CATEGORIES = [
  { id: 1, slug: 'home-cleaning', title: 'Home Cleaning', price: '35', rating: '4.8', reviews: '1.2K', img: '/img/cleaning-new.jpg', Icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500' },
  { id: 2, slug: 'ac-servicing', title: 'AC Service & Repair', price: '60', rating: '4.9', reviews: '980', img: '/img/ac-new.jpg', Icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500' },
  { id: 3, slug: 'plumbing', title: 'Plumbing', price: '50', rating: '4.7', reviews: '850', img: '/img/plumbing-new.jpg', Icon: Droplets, color: 'text-green-500', bg: 'bg-green-500' },
  { id: 4, slug: 'electrical', title: 'Electrical Services', price: '60', rating: '4.8', reviews: '760', img: '/img/electrical-new.jpg', Icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  { id: 5, slug: 'painting', title: 'Painting', price: '150', rating: '4.7', reviews: '620', img: '/img/painting-new.jpg', Icon: Paintbrush, color: 'text-purple-500', bg: 'bg-purple-500' },
  { id: 6, slug: 'pest-control', title: 'Pest Control', price: '80', rating: '4.8', reviews: '540', img: '/img/pest-new.jpg', Icon: Bug, color: 'text-red-500', bg: 'bg-red-500' }
];

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <Section 
      title="Popular Services" 
      action={<SeeAllLink to="/explore" label="View All Services" />}
      className="px-0"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {MOCK_CATEGORIES.map((cat) => (
          <div 
            key={cat.id} 
            onClick={() => navigate(`/service/${cat.slug}`)}
            className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-hairline/20 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
          >
            <div className="relative h-48 md:h-56 overflow-hidden">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 md:p-6 flex-1 flex flex-col relative pt-10 md:pt-12">
              <div className={`absolute -top-7 md:-top-8 left-5 md:left-6 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center ${cat.bg} border-4 border-white shadow-md`}>
                <cat.Icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="font-extrabold text-ink text-lg md:text-xl leading-tight mb-2 line-clamp-2">{cat.title}</h3>
              <div className="mt-auto flex items-center justify-between text-xs md:text-sm font-semibold text-ink-secondary">
                <span>Starting from RM{cat.price}</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-ink font-bold">{cat.rating}</span>
                  <span className="text-ink-tertiary">({cat.reviews})</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
