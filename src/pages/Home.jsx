import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CircleDollarSign, Lock, ThumbsUp, MapPin, Star, Gift, ArrowRight, Tag, Heart, CheckCircle2, Users } from 'lucide-react';
import { safeMotion, variants } from '@/lib/design/motion';
import { HeroSearch } from '@/components/home/HeroSearch';
import CategoryGrid from '@/components/home/CategoryGrid';
import { TrustStrip } from '@/components/home/TrustStrip';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="min-h-screen font-inter bg-white"
      {...safeMotion(variants.fadeUp)}
    >
      {/* ── Hero Section ─────────────────────────── */}
      <section className="relative w-full bg-gradient-to-b from-[#FFF7F2] to-white pt-12 pb-20 border-b border-hairline/20">
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left: Text & Search */}
          <div className="flex-1 w-full flex flex-col text-left pt-10">
            
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold mb-8 w-max">
              <Heart className="size-4 fill-orange-600 text-orange-600" />
              Malaysia's #1 Home Services Platform
            </div>

            <h2 className="text-[48px] lg:text-[56px] font-extrabold text-ink leading-[1.1] tracking-tight mb-6 max-w-[550px]">
              Home services<br/>made easier with<br/><span className="text-brand">ServisAku</span>.
            </h2>
            
            <p className="text-lg text-ink-secondary mb-12 max-w-[450px] leading-relaxed font-medium">
              Book trusted professionals for all your home service needs. Fast, easy & secure.
            </p>

            <HeroSearch />

            {/* Trust Badges under Search (Horizontal Layout) */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                { icon: ShieldCheck, label: 'Verified Professionals', sub: 'Background Checked', color: 'text-green-600' },
                { icon: Tag, label: 'Transparent Pricing', sub: 'No Hidden Charges', color: 'text-green-600' },
                { icon: Lock, label: 'Secure Payments', sub: '100% Protection', color: 'text-amber-500' },
                { icon: ThumbsUp, label: 'Satisfaction Guarantee', sub: "We're Here for You", color: 'text-amber-500' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`${item.color}`}>
                    <item.icon className="size-6 stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-ink leading-tight">{item.label}</span>
                    <span className="text-[10px] font-medium text-ink-secondary leading-tight">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Image & Floating Card */}
          <div className="flex-1 w-full max-w-[600px] relative hidden lg:flex justify-start items-end pl-4">
            <div className="relative w-full h-[550px] flex justify-start">
              
              {/* Main Image */}
              <img 
                src="/img/hero-tech.jpg" 
                alt="Professional Technician" 
                className="w-full h-full scale-110 origin-bottom object-contain object-bottom relative z-10 mix-blend-multiply"
              />

              {/* Floating Review Card Overlay */}
              <div className="absolute left-[-280px] top-4 z-20 bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-3 border border-hairline/20 w-[220px]">
                <div className="flex -space-x-2.5 mb-1">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white bg-raised relative z-10" alt="User" style={{ zIndex: 5 - i }} />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-bold text-ink-secondary relative z-0">
                    +2K
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold text-ink">4.8/5</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
                    </div>
                  </div>
                  <p className="text-[10px] font-medium text-ink-secondary mt-0.5">Based on 2,500+ Reviews</p>
                </div>

                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1 rounded-full"><MapPin className="size-2.5 text-red-600" /></div>
                    <span className="text-[10px] font-semibold text-ink">Instant Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-1 rounded-full"><MapPin className="size-2.5 text-red-600" /></div>
                    <span className="text-[10px] font-semibold text-ink">24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="size-2.5 text-green-600" /></div>
                    <span className="text-[10px] font-semibold text-ink">Experienced Professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1 rounded-full"><ShieldCheck className="size-2.5 text-blue-600" /></div>
                    <span className="text-[10px] font-semibold text-ink">Quality Services</span>
                  </div>
                </div>

                <button className="w-full mt-1 bg-orange-50 text-orange-600 hover:bg-orange-100 py-2 rounded-lg text-xs font-bold transition-colors">
                  View Reviews
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Main Content ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col gap-12">
        
        {/* Popular Services Grid */}
        <CategoryGrid />

        {/* ── Promos (3 Banners) ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Banner 1 */}
          <div 
            onClick={() => navigate('/explore')}
            className="bg-orange-50 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10 w-3/4">
              <h3 className="text-lg font-bold text-ink mb-1">Save More with<br/><span className="text-brand">ServisAku Rewards!</span></h3>
              <button className="mt-4 bg-brand text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-brand/90 transition-colors shadow-sm w-max">
                Learn More
              </button>
            </div>
            <Gift className="absolute -right-4 -bottom-4 w-32 h-32 text-orange-200 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
          </div>

          {/* Banner 2 */}
          <div 
            onClick={() => navigate('/explore')}
            className="bg-blue-50 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10 w-3/4">
              <h3 className="text-lg font-bold text-ink mb-2">Refer Friends,<br/>Earn Rewards!</h3>
              <p className="text-[11px] text-ink-secondary font-medium leading-tight mb-4 pr-4">Get RM10 for every friend you refer.</p>
              <button className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm w-max">
                Refer Now
              </button>
            </div>
            <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-200 group-hover:scale-105 transition-transform" strokeWidth={1.5} />
          </div>

          {/* Banner 3 */}
          <div 
            onClick={() => navigate('/explore')}
            className="bg-amber-50 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10 w-3/4">
              <h3 className="text-lg font-bold text-ink mb-2">Save More with<br/>Recurring Bookings!</h3>
              <p className="text-[11px] text-ink-secondary font-medium leading-tight mb-4">Save up to 20% with a monthly service plan.</p>
              <button className="bg-amber-400 text-ink px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-amber-500 transition-colors shadow-sm w-max">
                Subscribe Now
              </button>
            </div>
            <div className="absolute -right-2 -bottom-2 w-32 h-32 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center border border-hairline/20 group-hover:scale-105 transition-transform rotate-3">
              <div className="w-full bg-red-500 h-6 rounded-t-2xl flex items-center justify-center gap-2 absolute top-0">
                <div className="w-1.5 h-3 bg-white rounded-full"></div>
                <div className="w-1.5 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-3xl font-extrabold text-red-500 mt-4">20%</span>
            </div>
          </div>
        </div>

        {/* Full-width KPI Banner */}
        <TrustStrip />

      </div>
    </motion.div>
  );
}