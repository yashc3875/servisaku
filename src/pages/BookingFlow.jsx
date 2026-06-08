import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, safeMotion } from '@/lib/design/motion';
import {
  ArrowLeft, ArrowRight, Camera, X, CheckCircle2,
  User, Users, MapPin, Home, ChevronRight, Star, BadgeCheck, Tag,
  Clock, Maximize
} from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import { SERVICES, CITIES } from '@/lib/services';
import {
  SLOT_GROUPS, PROPERTY_TYPES, BEDROOM_OPTIONS,
  calculatePrice, PAYMENT_METHODS, formatBookingRef,
  getSizeMultiplier, isAreaScaled
} from '@/lib/bookingEngine';
import { getPackages, getAddons } from '@/lib/packageData';
import CouponInput from '../components/CouponInput';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/useTranslation';

const STEPS = ['Package', 'Property', 'Location', 'Schedule', 'Partner', 'Extras', 'Payment'];

export default function BookingFlow() {
  const { t, tField, lang } = useTranslation();
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = SERVICES.find(s => s.id === serviceId);
  const packages = getPackages(serviceId);
  const availableAddons = getAddons(serviceId);

  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [partners, setPartners] = useState([]);
  const [pkgIdx, setPkgIdx] = useState(0);
  const [addons, setAddons] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [bedrooms, setBedrooms] = useState('2br');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [slotGroup, setSlotGroup] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [partnerMode, setPartnerMode] = useState('any');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('fpx');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    servisaku.auth.me().then(me => { setUser(me); if (me.city) setCity(me.city); });
    servisaku.entities.User.filter({ role: 'partner', partner_verified: true }).then((ps) => {
      if (ps.length === 0) {
        // Fallback to hardcoded demo partners to avoid permission errors when unauthenticated
        setPartners([
          { id: 'demo1', email: 'ali@demo.com', full_name: 'Ali Ahmad', role: 'partner', partner_verified: true, partner_rating: 4.9, phone_number: '0123456789', city: 'Kuala Lumpur', bio: 'Expert cleaner with 5+ years experience.' },
          { id: 'demo2', email: 'raj@demo.com', full_name: 'Raj Kumar', role: 'partner', partner_verified: true, partner_rating: 4.7, phone_number: '0123456788', city: 'Petaling Jaya', bio: 'Specialist in deep cleaning and disinfection.' },
          { id: 'demo3', email: 'david@demo.com', full_name: 'David Lee', role: 'partner', partner_verified: true, partner_rating: 4.8, phone_number: '0123456787', city: 'Subang Jaya', bio: 'Quick, efficient and highly reliable.' }
        ]);
      } else {
        setPartners(ps);
      }
    }).catch(e => {
      console.error(e);
      setPartners([]);
    });
  }, []);

  if (!service || !packages || packages.length === 0) return null;

  const Icon = service.icon;
  const sizeMultiplier = isAreaScaled(serviceId) ? getSizeMultiplier(bedrooms) : 1.0;
  const pricing = calculatePrice(
    packages[pkgIdx].price, 1.0,
    availableAddons.filter(a => addons.includes(a.id)), coupon, 1, sizeMultiplier
  );

  const toggleAddon = id => setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);

  const handlePhotoUpload = async (files) => {
    if (photos.length >= 3) { toast.error('Max 3 photos allowed'); return; }
    for (const file of Array.from(files).slice(0, 3 - photos.length)) {
      const { file_url } = await servisaku.integrations.Core.UploadFile({ file });
      setPhotos(prev => [...prev, file_url]);
      toast.success('Photo uploaded');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to complete your booking.');
      return;
    }
    setSubmitting(true);
    try {
      const booking = await servisaku.entities.Booking.create({
        service_type: service.name,
        consumer_email: user.email,
        consumer_name: user.full_name || 'Guest',
        partner_email: selectedPartner?.email || null,
        partner_name: selectedPartner?.full_name || null,
        date, time_slot: timeSlot,
        address: `${address}, ${city}`,
        city, package_name: packages[pkgIdx].name,
        price: pricing.total,
        platform_fee: pricing.platformFee,
        partner_payout: pricing.partnerPayout,
        coupon_code: coupon?.code || null,
        discount_amount: pricing.discount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        notes, status: 'pending',
      });
      setBookingResult(booking);
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return propertyType && bedrooms;
    if (step === 2) return address && city;
    if (step === 3) return date && timeSlot;
    if (step === 4) return partnerMode === 'any' || selectedPartner;
    return true;
  };

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center font-inter">
        <div className="w-24 h-24 bg-brand-tint rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="h-12 w-12 text-brand" />
        </div>
        <h2 className="text-2xl font-bold mb-1">{t('Booking Confirmed!')}</h2>
        <p className="text-sm text-ink-secondary mb-1">{formatBookingRef(bookingResult.id)}</p>
        <p className="text-xs text-ink-secondary mb-2">
          {service.name} on {new Date(date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' })} at {timeSlot}
        </p>
        <p className="text-sm font-bold text-brand mb-6">Total: RM{pricing.total}</p>
        <div className="bg-brand-tint rounded-2xl p-3 text-xs text-ink-secondary mb-6 w-full max-w-xs text-left space-y-1">
          <p>{"📱 " + t('SMS confirmation sent')}</p>
          <p>{"🔍 " + t('Partner being assigned...')}</p>
          <p>{"⏱ " + t("You'll be notified within 15 minutes")}</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Button onClick={() => navigate(`/booking/${bookingResult.id}`)} className="flex-1 rounded-2xl bg-ink text-ink-inverse">{t('Track Booking')}</Button>
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1 rounded-2xl">{t('Home')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-inter pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-xl border-b border-hairline/10 px-5 lg:px-8 pt-12 lg:pt-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            className="w-9 h-9 rounded-xl bg-surface border border-hairline/10 flex items-center justify-center shadow-e1">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-ink-secondary">{tField(service, 'name')}</p>
            <p className="text-sm font-bold">{t(STEPS[step])}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-400 ${i <= step ? 'bg-brand' : 'bg-raised'}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[9px] text-ink-secondary">{t('Step')} {step + 1} {t('of')} {STEPS.length}</span>
          <span className="text-[9px] text-brand font-semibold">{Math.round(((step + 1) / STEPS.length) * 100)}% {t('complete')}</span>
        </div>
      </div>

      <div className="px-5 lg:px-8 pt-5 pb-32 space-y-5 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...safeMotion(variants.slide)} className="col-span-1 lg:col-span-2 space-y-5">
        {/* Step 0: Package */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">{t('Choose Package')}</h2>
            <div className="space-y-4">
              {packages.map((pkg, i) => {
                const active = pkgIdx === i;
                return (
                  <button key={i} onClick={() => setPkgIdx(i)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all shadow-e1 ${active ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface hover:border-brand/50 hover:shadow-e2'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-brand text-ink-inverse' : 'bg-raised text-ink-secondary'}`}>
                        {pkg.icon && <pkg.icon className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-ink">{tField(pkg, 'name')}</span>
                            {pkg.isPopular && (
                              <span className="bg-accent text-ink-inverse px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {t('Most Popular')}
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-brand text-base">RM{pkg.price}</span>
                        </div>
                        <p className="text-sm text-ink-secondary mb-3">{tField(pkg, 'desc')}</p>
                        
                        {(pkg.duration || pkg.recommendedSize) && (
                          <div className="flex items-center gap-4 mb-3">
                            {pkg.duration && (
                              <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{tField(pkg, 'duration') || pkg.duration}</span>
                              </div>
                            )}
                            {pkg.recommendedSize && (
                              <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                                <Maximize className="h-3.5 w-3.5" />
                                <span>{tField(pkg, 'recommendedSize') || pkg.recommendedSize}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-hairline/10">
                            {(tField(pkg, 'inclusions') || pkg.inclusions).map((inc, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                                <span className="text-xs text-ink-secondary">{inc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3 mt-6">{t('Add-ons')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableAddons.map(a => (
                  <button key={a.id} onClick={() => toggleAddon(a.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${addons.includes(a.id) ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface hover:border-brand/50 hover:shadow-e2'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold">{tField(a, 'label')}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${addons.includes(a.id) ? 'bg-brand border-brand' : 'border-hairline/10 bg-surface'}`}>
                        {addons.includes(a.id) && <CheckCircle2 className="h-2.5 w-2.5 text-ink-inverse" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand">+RM{a.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Property */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">{t('Property Details')}</h2>
            <div>
              <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <Home className="h-4 w-4 text-brand" /> {t('Property Type')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map(pt => (
                  <button key={pt} onClick={() => setPropertyType(pt)}
                    className={`py-3 px-3 text-xs rounded-2xl border-2 font-medium transition-all text-left ${propertyType === pt ? 'border-brand bg-brand-tint text-brand font-bold' : 'border-hairline/10 bg-surface text-ink-secondary'}`}>
                    {pt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">{t('Bedrooms')}</label>
              {isAreaScaled(serviceId) && (
                <p className="text-xs text-ink-secondary mb-3">{t('Price adjusts based on your home size')}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {BEDROOM_OPTIONS.map(b => {
                  const active = bedrooms === b.value;
                  const showMultiplier = isAreaScaled(serviceId);
                  const adjustedPrice = showMultiplier ? Math.round(packages[pkgIdx].price * b.multiplier) : null;
                  return (
                    <button key={b.value} onClick={() => setBedrooms(b.value)}
                      className={`py-3 px-2 rounded-2xl border-2 font-medium transition-all flex flex-col items-center gap-1 ${active ? 'border-brand bg-brand-tint text-brand font-bold' : 'border-hairline/10 bg-surface text-ink-secondary'}`}>
                      <span className="text-[11px]">{b.label}</span>
                      {showMultiplier && (
                        <span className={`text-[10px] font-bold ${active ? 'text-brand' : 'text-ink-tertiary'}`}>
                          RM{adjustedPrice}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">{t('Service Location')}</h2>
            <div>
              <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" /> {t('Area')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCity(c)}
                    className={`text-xs py-3 px-3 rounded-2xl border-2 text-left font-medium transition-all ${city === c ? 'border-brand bg-brand-tint text-brand font-bold' : 'border-hairline/10 bg-surface text-ink-secondary'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">{t('Full Address')}</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                placeholder="Unit, building, street, landmark..."
                className="w-full bg-surface border border-hairline/10 rounded-2xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 ring-brand/20 shadow-e1" />
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">{t('Date & Time')}</h2>
            <div>
              <label className="text-sm font-bold mb-2 block">{t('Choose Date')}</label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
                onChange={e => { setDate(e.target.value); setTimeSlot(''); setSlotGroup(''); }}
                className="w-full bg-surface border border-hairline/10 rounded-2xl px-4 py-3.5 text-sm outline-none shadow-e1 focus:ring-2 ring-brand/20" />
            </div>
            {date && (
              <div className="space-y-2.5">
                <label className="text-sm font-bold block">{t('Choose Time')}</label>
                {Object.entries(SLOT_GROUPS).map(([key, group]) => (
                  <div key={key}>
                    <button onClick={() => setSlotGroup(slotGroup === key ? '' : key)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 mb-2 transition-all ${slotGroup === key ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{group.emoji}</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold">{group.label}</p>
                          <p className="text-xs text-ink-secondary">{group.sub}</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-ink-secondary transition-transform ${slotGroup === key ? 'rotate-90' : ''}`} />
                    </button>
                    {slotGroup === key && (
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {group.slots.map(t => (
                          <button key={t} onClick={() => setTimeSlot(t)}
                            className={`py-2.5 text-xs rounded-xl border-2 font-medium transition-all ${timeSlot === t ? 'border-brand bg-brand-tint text-brand font-bold' : 'border-hairline/10 bg-surface text-ink-secondary'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Partner */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">{t('Partner Preference')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'any', icon: Users, label: t('Best Available'), sub: t('Auto-matched by rating') },
                { id: 'specific', icon: User, label: t('Choose Partner'), sub: t('Pick your preferred pro') },
              ].map(opt => (
                <button key={opt.id} onClick={() => setPartnerMode(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${partnerMode === opt.id ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${partnerMode === opt.id ? 'bg-brand/10' : 'bg-raised'}`}>
                    <opt.icon className={`h-5 w-5 ${partnerMode === opt.id ? 'text-brand' : 'text-ink-secondary'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${partnerMode === opt.id ? 'text-brand' : ''}`}>{opt.label}</p>
                    <p className="text-[10px] text-ink-secondary">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            {partnerMode === 'specific' && (
              <div className="space-y-2">
                {partners.length === 0
                  ? <div className="text-center py-8 bg-surface rounded-2xl border border-hairline/10 text-sm text-ink-secondary">{t('No verified partners yet')}</div>
                  : partners.slice(0, 5).map(p => (
                    <button key={p.id} onClick={() => setSelectedPartner(p)}
                      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${selectedPartner?.id === p.id ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface'}`}>
                      <div className="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0 relative">
                        <span className="font-bold text-brand text-lg">{p.full_name?.charAt(0)}</span>
                        {p.partner_verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center">
                            <BadgeCheck className="h-2.5 w-2.5 text-ink-inverse" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{p.full_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-semibold">{(p.partner_rating || 4.8).toFixed(1)}</span>
                          <span className="text-xs text-ink-secondary">• {p.partner_jobs_completed || 0} {t('jobs')}</span>
                        </div>
                      </div>
                      {selectedPartner?.id === p.id && <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* Step 5: Notes + Photos */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">{t('Special Instructions')}</h2>
            <div>
              <label className="text-sm font-bold mb-2 block">{t('Notes for Partner')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                placeholder="e.g. Pet at home, eco-friendly products preferred, access code 1234..."
                className="w-full bg-surface border border-hairline/10 rounded-2xl px-4 py-3 text-sm outline-none resize-none focus:ring-2 ring-brand/20 shadow-e1" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">{t('Reference Photos')}</label>
              <p className="text-xs text-ink-secondary mb-3">{t('Upload up to 3 photos (optional)')}</p>
              <div className="flex gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-hairline/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand transition-colors bg-surface">
                    <Camera className="h-5 w-5 text-ink-secondary" />
                    <span className="text-[9px] text-ink-secondary">{t('Add photo')}</span>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                      onChange={e => handlePhotoUpload(e.target.files)} />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Payment */}
        {step === 6 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">{t('Payment')}</h2>
            <div>
              <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" /> {t('Promo Code')}
              </label>
              <CouponInput serviceType={service.name} subtotal={pricing.subtotal} onApply={setCoupon} />
            </div>
            <div className="bg-surface rounded-2xl border border-hairline/10 shadow-e1 p-4 space-y-2">
              <p className="text-sm font-bold mb-3">{t('Order Summary')}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">
                    {tField(packages[pkgIdx], 'name')}
                    {isAreaScaled(serviceId) && ` (${BEDROOM_OPTIONS.find(b => b.value === bedrooms)?.label || bedrooms})`}
                  </span>
                  <span>RM{pricing.sizedBasePrice}</span>
                </div>
                {isAreaScaled(serviceId) && getSizeMultiplier(bedrooms) !== 1.0 && (
                  <div className="flex justify-between text-ink-tertiary">
                    <span className="italic">Base RM{packages[pkgIdx].price} × {getSizeMultiplier(bedrooms)}x size</span>
                    <span></span>
                  </div>
                )}
                {availableAddons.filter(a => addons.includes(a.id)).map(a => (
                  <div key={a.id} className="flex justify-between">
                    <span className="text-ink-secondary">{tField(a, 'label')}</span>
                    <span>RM{a.price}</span>
                  </div>
                ))}
                {coupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{t('Promo')} ({coupon.code})</span>
                    <span>-RM{coupon.calculatedDiscount}</span>
                  </div>
                )}
                <div className="border-t border-hairline/10 pt-2 flex justify-between font-bold text-sm">
                  <span>{t('Total')}</span>
                  <span className="text-brand">RM{pricing.total}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">{t('Payment Method')}</label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${paymentMethod === pm.id ? 'border-brand bg-brand-tint' : 'border-hairline/10 bg-surface'}`}>
                    <span className="text-xl w-7 text-center">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{pm.label}</p>
                      <p className="text-xs text-ink-secondary">{pm.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${paymentMethod === pm.id ? 'border-brand bg-brand' : 'border-hairline/10'}`}>
                      {paymentMethod === pm.id && <div className="w-2 h-2 bg-surface rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-50">
        <div className="bg-surface/95 backdrop-blur-xl border-t border-hairline/10 px-5 lg:px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-ink-secondary">
                {tField(packages[pkgIdx], 'name')}
                {addons.length > 0 ? ` + ${addons.length} ${addons.length > 1 ? t('add-ons') : t('add-on')}` : ''}
                {coupon ? ` · ${t('Promo applied')}` : ''}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-brand">RM{pricing.total}</span>
                {pricing.discount > 0 && (
                  <span className="text-xs text-emerald-600 font-medium">-RM{pricing.discount}</span>
                )}
              </div>
            </div>
            {step < 6 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                className="bg-ink text-ink-inverse rounded-xl px-6 h-11 shadow-e2 font-semibold">
                {t('Next')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}
                className="bg-ink text-ink-inverse rounded-xl px-6 h-11 shadow-e2 font-semibold">
                {submitting ? t('Processing...') : `${t('Confirm')} · RM${pricing.total}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}