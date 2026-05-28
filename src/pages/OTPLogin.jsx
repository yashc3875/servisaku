import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  formatMalaysianPhone, isValidMalaysianPhone,
  sendOTP, verifyOTP, ROLE_HOME
} from '@/lib/auth';
import { checkOtpSendAllowed, recordOtpAttempt, sanitizePhone, auditLog } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STEP = { ROLE: 'role', PHONE: 'phone', OTP: 'otp', DONE: 'done' };

const ROLES = [
  { id: 'consumer', label: 'Consumer', desc: 'Book home services', emoji: '🏠' },
  { id: 'partner', label: 'Service Partner', desc: 'Provide services & earn', emoji: '🔧' },
  { id: 'admin', label: 'Admin', desc: 'Manage the platform', emoji: '⚙️' },
];

export default function OTPLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.ROLE);
  const [role, setRole] = useState('consumer');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showOtp, setShowOtp] = useState(false);

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleSendOTP = () => {
    const cleaned = sanitizePhone(phone);
    const formatted = formatMalaysianPhone(cleaned);
    if (!isValidMalaysianPhone(formatted)) {
      toast.error('Please enter a valid Malaysian mobile number');
      return;
    }
    const rateCheck = checkOtpSendAllowed(formatted);
    if (!rateCheck.allowed) {
      toast.error(rateCheck.message);
      auditLog('OTP_RATE_LIMITED', { phone: formatted.slice(0, 6) + '****' });
      return;
    }
    const code = sendOTP(formatted);
    setSentOtp(code);
    setStep(STEP.OTP);
    startCountdown();
    auditLog('OTP_SENT', { role });
    toast.success('OTP sent!');
  };

  const handleVerify = async () => {
    const formatted = formatMalaysianPhone(sanitizePhone(phone));
    const attemptCheck = recordOtpAttempt(formatted, false); // tentatively mark as failed
    if (attemptCheck.blocked) {
      toast.error(attemptCheck.message);
      auditLog('OTP_LOCKED', { phone: formatted.slice(0, 6) + '****' });
      return;
    }
    const result = verifyOTP(formatted, otp);
    if (!result.success) {
      const remaining = attemptCheck.triesLeft - 1;
      toast.error(result.error + (remaining > 0 ? ` (${remaining} attempts left)` : ''));
      return;
    }
    recordOtpAttempt(formatted, true); // clear failed attempts on success
    setLoading(true);
    try {
      await base44.auth.updateMe({ phone: formatted, role });
      auditLog('LOGIN_SUCCESS', { role });
      setStep(STEP.DONE);
      setTimeout(() => navigate(role === 'partner' ? '/partner/onboarding' : ROLE_HOME[role]), 1200);
    } catch {
      toast.error('Authentication failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = () => {
    const formatted = formatMalaysianPhone(sanitizePhone(phone));
    const rateCheck = checkOtpSendAllowed(formatted);
    if (!rateCheck.allowed) {
      toast.error(rateCheck.message);
      return;
    }
    const code = sendOTP(formatted);
    setSentOtp(code);
    startCountdown();
    toast.success('New OTP sent!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-6 pt-16 pb-10 flex-shrink-0">
        <div className="max-w-sm mx-auto">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ServisAku</h1>
          <p className="text-white/60 text-sm mt-1">Malaysia's Home Services Platform</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">

        {step === STEP.ROLE && (
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome 👋</h2>
            <p className="text-sm text-muted-foreground mb-6">Choose how you use FixMate</p>
            <div className="space-y-3 mb-8">
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRole(r.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${role === r.id ? 'border-primary bg-accent' : 'border-border bg-card'}`}>
                  <span className="text-2xl">{r.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                  {role === r.id && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(STEP.PHONE)} className="w-full h-12 rounded-xl">
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground">or continue with</span></div>
            </div>
            <button onClick={() => base44.auth.redirectToLogin()}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Continue with Google
            </button>
          </div>
        )}

        {step === STEP.PHONE && (
          <div>
            <button onClick={() => setStep(STEP.ROLE)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Enter your number</h2>
            <p className="text-sm text-muted-foreground mb-6">We will send a 6-digit OTP via SMS</p>
            <div className="flex gap-2 mb-6">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-3 text-sm font-medium shrink-0">
                <span>🇲🇾</span> +60
              </div>
              <input type="tel" placeholder="11 234 5678" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20"
                maxLength={11} autoFocus />
            </div>
            <div className="bg-accent rounded-xl p-3 mb-6 text-xs text-muted-foreground flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
              Your number is used for login only. We never share it.
            </div>
            <Button onClick={handleSendOTP} disabled={phone.length < 8} className="w-full h-12 rounded-xl">
              Send OTP <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {step === STEP.OTP && (
          <div>
            <button onClick={() => setStep(STEP.PHONE)} className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Enter OTP</h2>
            <p className="text-sm text-muted-foreground mb-1">Sent to +60{phone}</p>
            <p className="text-xs text-muted-foreground mb-4">Code expires in 5 minutes • Max 3 attempts</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
              Demo OTP: <strong className="font-mono text-lg">{sentOtp}</strong>
            </div>
            <div className="relative mb-2">
              <input type={showOtp ? 'text' : 'password'} placeholder="• • • • • •" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-muted rounded-xl px-4 pr-12 py-4 text-2xl tracking-widest text-center font-bold outline-none focus:ring-2 ring-primary/20"
                maxLength={6} autoFocus />
              <button onClick={() => setShowOtp(!showOtp)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-center mb-6">
              {countdown > 0
                ? <p className="text-xs text-muted-foreground">Resend in {countdown}s</p>
                : <button onClick={handleResend} className="text-xs text-primary font-medium">Resend OTP</button>
              }
            </div>
            <Button onClick={handleVerify} disabled={otp.length < 6 || loading} className="w-full h-12 rounded-xl">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        )}

        {step === STEP.DONE && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Verified!</h2>
            <p className="text-sm text-muted-foreground mt-2">Redirecting you now...</p>
          </div>
        )}
      </div>
    </div>
  );
}