import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, MapPin, FileText, CheckCircle2, ChevronRight, User, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SERVICES, CITIES, TIME_SLOTS } from '@/lib/services';
import PartnerCard from '../components/PartnerCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PACKAGES = [
  { name: 'Basic', multiplier: 1 },
  { name: 'Premium', multiplier: 1.6 },
  { name: 'Complete', multiplier: 2.2 },
];

const STEPS = ['Schedule', 'Location', 'Partner', 'Confirm'];

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = SERVICES.find(s => s.id === serviceId);
  const params = new URLSearchParams(window.location.search);
  const pkgIdx = parseInt(params.get('package') || '0');

  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partners, setPartners] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me().then(me => {
      setUser(me);
      if (me.city) setCity(me.city);
    });
    base44.entities.User.filter({ role: 'partner', partner_verified: true }).then(p => {
      const filtered = p.filter(u => u.partner_services?.includes(service?.name));
      setPartners(filtered.length > 0 ? filtered : p.slice(0, 3));
    });
  }, []);

  if (!service) return null;

  const price = Math.round(service.priceRange[0] * PACKAGES[pkgIdx].multiplier);
  const Icon = service.icon;

  const canProceed = () => {
    if (step === 0) return date && timeSlot;
    if (step === 1) return address && city;
    if (step === 2) return true;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Booking.create({
      service_type: service.name,
      consumer_email: user.email,
      consumer_name: user.full_name,
      partner_email: selectedPartner?.email || null,
      partner_name: selectedPartner?.full_name || null,
      date, time_slot: timeSlot, address, city, price,
      package_name: PACKAGES[pkgIdx].name,
      notes, status: 'pending', payment_status: 'pending',
    });
    setSuccess(true);
    setSubmitting(false);
  };

  if (success) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-background">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
      <p className="text-sm text-muted-foreground mb-1">We are matching you with a verified partner.</p>
      <p className="text-xs text-muted-foreground mb-8">You will receive an SMS confirmation shortly.</p>
      <Button onClick={() => navigate('/bookings')} className="rounded-2xl w-full h-12">View My Bookings</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-inter pb-36">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl px-5 pt-12 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{service.name}</p>
            <p className="text-sm font-bold">{STEPS[step]}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {/* Step indicators */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">

        {/* Step 0: Schedule */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" /> Pick a Date
              </label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-border rounded-2xl px-4 py-3.5 text-sm outline-none shadow-card focus:ring-2 ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-bold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Choose Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setTimeSlot(t)}
                    className={`py-3 text-xs rounded-2xl border-2 font-medium transition-all duration-200 ${timeSlot === t ? 'border-primary bg-accent text-primary font-bold shadow-card' : 'border-border bg-white text-muted-foreground hover:border-primary/40'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Select Area
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <button key={c} onClick={() => setCity(c)}
                    className={`text-xs py-3 px-3 rounded-2xl border-2 text-left font-medium transition-all duration-200 ${city === c ? 'border-primary bg-accent text-primary font-bold' : 'border-border bg-white text-muted-foreground'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Full Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                placeholder="Unit/block, building, street name, landmark..."
                className="w-full bg-white border border-border rounded-2xl px-4 py-3.5 text-sm outline-none resize-none shadow-card focus:ring-2 ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Special Instructions
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="e.g. Allergic to certain chemicals, pet at home..."
                className="w-full bg-white border border-border rounded-2xl px-4 py-3.5 text-sm outline-none resize-none shadow-card focus:ring-2 ring-primary/20" />
            </div>
          </div>
        )}

        {/* Step 2: Partner */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Available Partners</h3>
              <span className="text-xs text-muted-foreground">{partners.length} available</span>
            </div>
            {partners.length > 0 ? (
              <div className="space-y-3">
                {partners.map(p => (
                  <PartnerCard key={p.id} partner={p} selected={selectedPartner?.id === p.id} onSelect={setSelectedPartner} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-border shadow-card">
                <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Partners will be auto-assigned</p>
                <p className="text-xs text-muted-foreground mt-1">We will match you with the best available partner</p>
              </div>
            )}
            <div className="mt-3 bg-accent rounded-2xl p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
              All partners are verified, background-checked, and insured.
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold">Review Booking</h3>
            {[
              { label: 'Service', value: `${service.name} (${PACKAGES[pkgIdx].name})` },
              { label: 'Date', value: date ? new Date(date).toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' }) : '-' },
              { label: 'Time', value: timeSlot },
              { label: 'Location', value: `${address}, ${city}` },
              { label: 'Partner', value: selectedPartner?.full_name || 'Auto-assigned' },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between bg-white rounded-2xl border border-border px-4 py-3 shadow-card">
                <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                <span className="text-xs font-semibold text-right max-w-[55%]">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-xl border-t border-border px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">RM{price}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {date && <p>{new Date(date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}</p>}
              {timeSlot && <p>{timeSlot}</p>}
            </div>
          </div>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} className="w-full h-12 rounded-2xl shadow-float">
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 rounded-2xl shadow-float">
              {submitting ? 'Confirming...' : `Confirm Booking • RM${price}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}