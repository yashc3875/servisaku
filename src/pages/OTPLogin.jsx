import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, safeMotion } from '@/lib/design/motion';
import { ArrowRight, ArrowLeft, Shield, CheckCircle2, Eye, EyeOff, Home, Wrench, Settings, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  formatMalaysianPhone, isValidMalaysianPhone,
  sendOTP, verifyOTP, ROLE_HOME
} from '@/lib/auth';
import { checkOtpSendAllowed, recordOtpAttempt, sanitizePhone, auditLog } from '@/lib/security';
import { useAuth } from '@/lib/AuthContext';
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
  const { checkUserAuth } = useAuth();
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
      // Create a deterministic demo email/password for this phone number
      const demoEmail = `${formatted.replace('+', '')}@servisaku.demo`;
      const demoPassword = 'DemoPassword123!';
      
      try {
        await base44.auth.loginViaEmailPassword(demoEmail, demoPassword);
        await base44.auth.updateMe({ phone: formatted, role });
        if (checkUserAuth) await checkUserAuth();
        auditLog('LOGIN_SUCCESS', { role });
        setStep(STEP.DONE);
        setTimeout(() => navigate(role === 'partner' ? '/partner/onboarding' : ROLE_HOME[role]), 1200);
      } catch {
        // If login fails and we can't register programmatically (e.g. 405 error), fallback to standard login
        toast.info('Direct registration disabled. Redirecting to standard login...');
        setTimeout(() => base44.auth.redirectToLogin(), 1500);
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      toast.error('Auth failed: ' + (err.message || 'Unknown error'));
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
    <div className="min-h-screen bg-bg flex flex-col font-inter">
      <div className="w-full bg-[#031024] flex-shrink-0 border-b border-hairline/10">
        <div className="max-w-6xl mx-auto flex justify-center">
          <img 
            src="/img/login-banner-wide.png" 
            alt="ServisAku - Trusted Home Services, At Your Fingertips" 
            className="w-full h-auto max-h-[350px] object-cover object-center" 
          />
        </div>
      </div>

      <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full text-ink relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...safeMotion(variants.slide)} className="w-full">
        {step === STEP.ROLE && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-1 text-ink">Welcome 👋</h2>
              <p className="text-sm text-ink-secondary">Choose how you use ServisAku</p>
            </div>
            <div className="space-y-3 mb-8">
              {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${role === r.id ? 'border-brand bg-brand-tint/30' : 'border-hairline/10 bg-surface hover:border-hairline'}`}>
                    <span className="text-2xl shrink-0">{r.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm text-ink">{r.label}</p>
                      <p className="text-xs text-ink-secondary">{r.desc}</p>
                    </div>
                    <div className={`ml-auto shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${role === r.id ? 'bg-brand border-brand' : 'border-2 border-hairline/20'}`}>
                      {role === r.id && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </div>
                  </button>
              ))}
            </div>
            <Button onClick={() => setStep(STEP.PHONE)} className="w-full h-12 rounded-full bg-[#031024] text-white hover:bg-[#031024]/90 shadow-xl font-semibold">
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hairline/10" /></div>
              <div className="relative flex justify-center"><span className="bg-bg px-3 text-xs text-ink-secondary">or continue with</span></div>
            </div>
            <button onClick={() => base44.auth.loginWithProvider('google')}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-hairline/10 bg-surface text-sm font-medium hover:bg-raised transition-colors text-ink">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" /> Continue with Google
            </button>
          </div>
        )}

        {step === STEP.PHONE && (
          <div>
            <button onClick={() => setStep(STEP.ROLE)} className="flex items-center gap-1 text-sm text-ink-secondary mb-6 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Enter your number</h2>
            <p className="text-sm text-ink-secondary mb-6">We will send a 6-digit OTP via SMS</p>
            <div className="flex gap-2 mb-6">
              <div className="flex items-center gap-2 bg-raised rounded-xl px-3 py-3 text-sm font-medium shrink-0">
                <span>🇲🇾</span> +60
              </div>
              <input type="tel" placeholder="11 234 5678" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-raised rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-brand/20 text-ink"
                maxLength={11} autoFocus />
            </div>
            <div className="bg-brand-tint rounded-xl p-3 mb-6 text-xs text-ink-secondary flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-brand shrink-0" />
              Your number is used for login only. We never share it.
            </div>
            <Button onClick={handleSendOTP} disabled={phone.length < 8} className="w-full h-12 rounded-xl bg-ink text-ink-inverse hover:bg-ink/90">
              Send OTP <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {step === STEP.OTP && (
          <div>
            <button onClick={() => setStep(STEP.PHONE)} className="flex items-center gap-1 text-sm text-ink-secondary mb-6 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h2 className="text-xl font-bold mb-1">Enter OTP</h2>
            <p className="text-sm text-ink-secondary mb-1">Sent to +60{phone}</p>
            <p className="text-xs text-ink-secondary mb-4">Code expires in 5 minutes • Max 3 attempts</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
              Demo OTP: <strong className="font-mono text-lg">{sentOtp}</strong>
            </div>
            <div className="relative mb-2">
              <input type={showOtp ? 'text' : 'password'} placeholder="• • • • • •" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-raised rounded-xl px-4 pr-12 py-4 text-2xl tracking-widest text-center font-bold outline-none focus:ring-2 ring-brand/20 text-ink"
                maxLength={6} autoFocus />
              <button onClick={() => setShowOtp(!showOtp)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink">
                {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-center mb-6">
              {countdown > 0
                ? <p className="text-xs text-ink-secondary">Resend in {countdown}s</p>
                : <button onClick={handleResend} className="text-xs text-brand font-medium">Resend OTP</button>
              }
            </div>
            <Button onClick={handleVerify} disabled={otp.length < 6 || loading} className="w-full h-12 rounded-xl bg-ink text-ink-inverse hover:bg-ink/90">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </div>
        )}

        {step === STEP.DONE && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-brand-tint rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-brand" />
            </div>
            <h2 className="text-xl font-bold">Verified!</h2>
            <p className="text-sm text-ink-secondary mt-2">Redirecting you now...</p>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}