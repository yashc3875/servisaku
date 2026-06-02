import { motion } from 'framer-motion';
import { Search, CalendarCheck, Home, Star, CheckCircle2 } from 'lucide-react';
import { safeMotion, variants } from '@/lib/design/motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "1. Find Your Service",
      desc: "Browse our wide range of services or search for exactly what you need. From cleaning to plumbing, we have experts for everything.",
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      icon: CalendarCheck,
      title: "2. Book & Pay Securely",
      desc: "Choose a convenient time, provide details, and pay securely online. Your money is held safely in escrow until the job is done.",
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    {
      icon: Home,
      title: "3. Service Delivered",
      desc: "A verified professional arrives at your doorstep to complete the job to our high-quality standards.",
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      icon: Star,
      title: "4. Review & Relax",
      desc: "Rate your experience and leave a review. We ensure 100% satisfaction on every booking.",
      color: "text-amber-500",
      bg: "bg-amber-100",
    }
  ];

  return (
    <motion.div className="min-h-screen bg-bg pt-24 pb-16 font-inter" {...safeMotion(variants.fadeUp)}>
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-4">
            How <span className="text-brand">ServisAku</span> Works
          </h1>
          <p className="text-lg text-ink-secondary max-w-2xl mx-auto font-medium">
            Getting your home sorted has never been easier. Follow these four simple steps and let our professionals handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-surface rounded-3xl p-8 border border-hairline/20 shadow-e1 hover:shadow-e2 transition-shadow flex flex-col items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step.bg} ${step.color} mb-2`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-ink">{step.title}</h3>
              <p className="text-ink-secondary leading-relaxed font-medium text-base">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-brand text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between shadow-e2 relative overflow-hidden">
          <div className="relative z-10 max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl font-extrabold mb-4">Ready to get started?</h2>
            <p className="text-brand-tint font-medium mb-6">Join thousands of satisfied customers who trust ServisAku for their daily home needs.</p>
            <ul className="space-y-3 mb-8">
              {['Verified Professionals', 'Transparent Pricing', 'Secure Payments'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  {item}
                </li>
              ))}
            </ul>
            <a href="/explore" className="inline-block bg-white text-brand px-8 py-3.5 rounded-xl font-bold hover:bg-brand-tint transition-colors shadow-sm">
              Explore Services
            </a>
          </div>
          <div className="relative z-10 w-full md:w-1/3 flex justify-center">
             <Home className="w-48 h-48 text-white/20" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
