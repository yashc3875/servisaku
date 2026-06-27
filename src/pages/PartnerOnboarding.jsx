import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Upload, User, Wrench, MapPin, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/services';
import { toast } from 'sonner';

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'area', label: 'Coverage', icon: MapPin },
  { id: 'docs', label: 'Documents', icon: Upload },
  { id: 'done', label: 'Done', icon: Check },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PartnerOnboarding() {
  const navigate = useNavigate();
  // Specializations come from the live catalogue (category-level).
  const { data: categories } = useQuery({
    queryKey: ['onboarding-categories'],
    queryFn: () => servisaku.catalog.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    bio: '',
    ic_number: '',
    bank_name: '',
    bank_account: '',
    services: [],
    areas: [],
    working_days: [1, 2, 3, 4, 5],
    start_time: '08:00',
    end_time: '18:00',
    ic_doc: null,
    cert_doc: null,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
    }));
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleFileUpload = async (file, field) => {
    const { file_url } = await servisaku.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, [field]: file_url }));
    toast.success('Document uploaded');
  };

  const handleSubmit = async () => {
    setSaving(true);
    const me = await servisaku.auth.me();
    await servisaku.auth.updateMe({
      partner_bio: form.bio,
      partner_ic_number: form.ic_number,
      partner_bank_name: form.bank_name,
      partner_bank_account: form.bank_account,
      partner_services: form.services,
    });
    const availabilityRecords = form.working_days.map(d => ({
      partner_email: me.email,
      day_of_week: d,
      start_time: form.start_time,
      end_time: form.end_time,
      is_available: true,
      max_jobs: 3,
      service_areas: form.areas,
    }));
    await servisaku.entities.PartnerAvailability.bulkCreate(availabilityRecords);
    setSaving(false);
    next();
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-primary px-6 pt-14 pb-6">
        <p className="text-white/60 text-xs mb-2">Partner Onboarding</p>
        <h1 className="text-xl font-bold text-white">Join as a Pro</h1>
        <div className="mt-4 bg-white/20 rounded-full h-1.5">
          <div className="bg-white rounded-full h-1.5 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex flex-col items-center text-[9px] gap-0.5 ${i <= step ? 'text-white' : 'text-white/30'}`}>
              <s.icon className="h-3 w-3" />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6">

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Personal Details</h2>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Bio / About You</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3} placeholder="Tell customers about your experience..."
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">IC Number (MyKad)</label>
              <input value={form.ic_number} onChange={e => setForm(f => ({ ...f, ic_number: e.target.value }))}
                placeholder="e.g. 900101-01-1234"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Bank Name</label>
              <select value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none">
                <option value="">Select bank</option>
                {['Maybank', 'CIMB', 'Public Bank', 'RHB', 'AmBank', 'Hong Leong', 'Bank Islam', 'BSN'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Bank Account Number</label>
              <input value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))}
                placeholder="Account number"
                className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none" />
            </div>
          </div>
        )}

        {/* Step 1: Services */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-1">Your Services</h2>
            <p className="text-xs text-muted-foreground mb-4">Select all services you can provide</p>
            <div className="grid grid-cols-2 gap-2">
              {(categories || []).map(c => {
                const active = form.services.includes(c.name);
                return (
                  <button key={c.slug} onClick={() => toggle('services', c.name)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 text-left transition-all ${active ? 'border-primary bg-accent' : 'border-border bg-card'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium leading-tight">{c.name}</span>
                    {active && <Check className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Coverage + Availability */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold mb-1">Coverage Area</h2>
              <p className="text-xs text-muted-foreground mb-3">Select areas you can travel to</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map(c => (
                  <button key={c} onClick={() => toggle('areas', c)}
                    className={`text-xs py-2.5 px-3 rounded-xl border text-left transition-all ${form.areas.includes(c) ? 'border-primary bg-accent text-primary font-semibold' : 'border-border bg-card text-muted-foreground'}`}>
                    {form.areas.includes(c) && <Check className="h-3 w-3 inline mr-1" />}{c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-2">Working Days</h3>
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <button key={d} onClick={() => toggle('working_days', i)}
                    className={`flex-1 py-2 text-[10px] font-semibold rounded-lg transition-all ${form.working_days.includes(i) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Start', 'start_time'], ['End', 'end_time']].map(([label, key]) => (
                <div key={key}>
                  <label className="text-xs font-semibold mb-1.5 block">{label} Time</label>
                  <input type="time" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-muted rounded-xl px-3 py-3 text-sm outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold mb-1">Upload Documents</h2>
            <p className="text-xs text-muted-foreground">Required for partner verification. Reviewed within 24 hours.</p>
            {[
              { label: 'MyKad (IC) Copy', field: 'ic_doc', desc: 'Front side of your IC card' },
              { label: 'Trade Certificate (optional)', field: 'cert_doc', desc: 'Skills cert, training cert, etc.' },
            ].map(d => (
              <div key={d.field} className="bg-card border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold mb-0.5">{d.label}</p>
                <p className="text-xs text-muted-foreground mb-3">{d.desc}</p>
                {form[d.field] ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <Check className="h-4 w-4" /> Uploaded successfully
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer bg-muted rounded-xl px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors w-fit">
                    <Upload className="h-3.5 w-3.5" /> Choose file
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], d.field)} />
                  </label>
                )}
              </div>
            ))}
            <div className="bg-accent rounded-xl p-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-primary" />
              All documents are encrypted and stored securely. CTOS credit check will be performed automatically.
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-2">Our team will review your documents within 24 hours.</p>
            <p className="text-xs text-muted-foreground mb-8">You will receive an SMS once approved.</p>
            <Button onClick={() => navigate('/partner')} className="rounded-xl w-full">
              Go to Partner Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {step < 4 && (
        <div className="px-6 pb-8 flex gap-3">
          {step > 0 && (
            <Button onClick={back} variant="outline" className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next} className="flex-1 h-12 rounded-xl">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving} className="flex-1 h-12 rounded-xl">
              {saving ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}