import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, safeMotion } from '@/lib/design/motion';
import { ArrowRight, ArrowLeft, Shield, CheckCircle2, Eye, EyeOff, Check, Mail, Phone, User, Home, Lock } from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import {
  formatMalaysianPhone, isValidMalaysianPhone,
  sendOTP, verifyOTP, ROLE_HOME
} from '@/lib/auth';
import { checkOtpSendAllowed, recordOtpAttempt, sanitizePhone, auditLog } from '@/lib/security';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STEP = { ROLE: 'role', INPUT: 'input', OTP: 'otp', DONE: 'done' };
const MODE = { EMAIL: 'email', PHONE: 'phone' };

const ROLES = [
  { id: 'consumer', label: 'Consumer', desc: 'Book home services', emoji: '🏠' },
  { id: 'partner', label: 'Service Partner', desc: 'Provide services & earn', emoji: '🔧' },
  { id: 'admin', label: 'Admin', desc: 'Manage the platform', emoji: '⚙️' },
];

export default function OTPLogin() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [step, setStep] = useState(STEP.ROLE);
  const [mode, setMode] = useState(MODE.EMAIL);
  const [role, setRole] = useState('consumer');
  const [isRegister, setIsRegister] = useState(false);

  // Email/password fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP/phone fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  // ---- Email/Password login or register ----
  const handleEmailAuth = async () => {
    if (!email || !password) { toast.error('Please enter your email and password'); return; }
    if (isRegister && !fullName) { toast.error('Please enter your full name'); return; }
    setLoading(true);
    try {
      if (isRegister) {
        await servisaku.auth.register(email, password, fullName);
        toast.success('Account created! Welcome to ServisAku 🎉');
      } else {
        await servisaku.auth.loginViaEmailPassword(email, password);
        toast.success('Logged in successfully!');
      }
      if (checkUserAuth) await checkUserAuth();
      auditLog('LOGIN_SUCCESS', { role, method: 'email' });
      setStep(STEP.DONE);
      setTimeout(() => navigate(ROLE_HOME[role] || '/'), 1200);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  // ---- OTP flow ----
  const handleSendOTP = () => {
    const cleaned = sanitizePhone(phone);
    const formatted = formatMalaysianPhone(cleaned);
    if (!isValidMalaysianPhone(formatted)) { toast.error('Please enter a valid Malaysian mobile number'); return; }
    const rateCheck = checkOtpSendAllowed(formatted);
    if (!rateCheck.allowed) { toast.error(rateCheck.message); return; }
    const code = sendOTP(formatted);
    setSentOtp(code);
    setStep(STEP.OTP);
    startCountdown();
    toast.success('OTP sent!');
  };

  const handleVerify = async () => {
    const formatted = formatMalaysianPhone(sanitizePhone(phone));
    const attemptCheck = recordOtpAttempt(formatted, false);
    if (attemptCheck.blocked) { toast.error(attemptCheck.message); return; }
    const result = verifyOTP(formatted, otp);
    if (!result.success) {
      toast.error(result.error + (attemptCheck.triesLeft > 0 ? ` (${attemptCheck.triesLeft - 1} attempts left)` : ''));
      return;
    }
    recordOtpAttempt(formatted, true);
    setLoading(true);
    try {
      // Use phone as email basis — register if first time
      const demoEmail = `${formatted.replace('+', '')}@servisaku.demo`;
      const demoPassword = 'OTP_Auth_2026!';
      try {
        await servisaku.auth.loginViaEmailPassword(demoEmail, demoPassword);
      } catch {
        // First time — register account
        await servisaku.auth.register(demoEmail, demoPassword, `User ${phone}`);
      }
      if (checkUserAuth) await checkUserAuth();
      auditLog('LOGIN_SUCCESS', { role, method: 'otp' });
      setStep(STEP.DONE);
      setTimeout(() => navigate(ROLE_HOME[role] || '/'), 1200);
    } catch (err) {
      toast.error('Auth failed: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  const handleResend = () => {
    const formatted = formatMalaysianPhone(sanitizePhone(phone));
    const rateCheck = checkOtpSendAllowed(formatted);
    if (!rateCheck.allowed) { toast.error(rateCheck.message); return; }
    const code = sendOTP(formatted);
    setSentOtp(code);
    startCountdown();
    toast.success('New OTP sent!');
  };

  return (
    <div className="min-h-screen bg-bg flex font-inter">
      {/* Left Side: Branding / Hero */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#031024] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#031024] via-[#051c3f] to-[#031024]"></div>
        
        {/* Glowing orb for modern look */}
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand blur-[100px] opacity-10"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="bg-brand text-white p-2.5 rounded-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
               <Home className="h-6 w-6" />
            </div>
            <span className="text-3xl font-display font-bold text-white tracking-tight">Servis<span className="text-brand">Aku</span></span>
          </Link>
        </div>

        <div className="relative z-10 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="text-4xl xl:text-5xl font-display font-bold text-white mb-6 leading-[1.15]">
              Trusted Home Services,<br/> <span className="text-brand">At Your Fingertips.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md mb-10 leading-relaxed">
              Book verified professionals for cleaning, repairs, maintenance, and home improvement across Malaysia.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
               <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                 <Shield className="h-6 w-6 text-brand" />
               </div>
               <div>
                 <p className="text-sm font-semibold text-white">Verified Pros</p>
                 <p className="text-xs text-white/60 mt-0.5">Vetted experts only</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
               <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                 <CheckCircle2 className="h-6 w-6 text-brand" />
               </div>
               <div>
                 <p className="text-sm font-semibold text-white">Quality Work</p>
                 <p className="text-xs text-white/60 mt-0.5">Satisfaction guaranteed</p>
               </div>
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 text-white/40 text-sm">
          &copy; {new Date().getFullYear()} ServisAku. All rights reserved.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-bg">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-brand text-white p-2 rounded-lg shadow-sm">
               <Home className="h-5 w-5" />
            </div>
            <span className="text-2xl font-display font-bold text-ink tracking-tight">Servis<span className="text-brand">Aku</span></span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto relative z-10 mt-16 lg:mt-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...safeMotion(variants.slide)} className="w-full">

              {/* STEP 1: Role selection */}
              {step === STEP.ROLE && (
                <div>
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-display font-bold mb-2 text-ink">Welcome back 👋</h2>
                    <p className="text-ink-secondary">Choose how you want to use ServisAku</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {ROLES.map(r => (
                      <button key={r.id} onClick={() => setRole(r.id)}
                        className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all ${role === r.id ? 'border-brand bg-brand-tint/20 shadow-sm' : 'border-hairline/20 bg-surface hover:border-hairline/60 hover:shadow-sm'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${role === r.id ? 'bg-brand/10' : 'bg-raised'}`}>
                          {r.emoji}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`font-semibold text-base ${role === r.id ? 'text-brand-ink' : 'text-ink'}`}>{r.label}</p>
                          <p className="text-sm text-ink-secondary mt-0.5">{r.desc}</p>
                        </div>
                        <div className={`ml-auto shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${role === r.id ? 'bg-brand border-brand' : 'border-2 border-hairline/30'}`}>
                          {role === r.id && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <Button onClick={() => setStep(STEP.INPUT)} className="w-full h-14 rounded-2xl bg-[#031024] text-white hover:bg-[#031024]/90 shadow-xl shadow-[#031024]/10 font-semibold text-lg">
                    Continue <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 2: Login method */}
              {step === STEP.INPUT && (
                <div>
                  <button onClick={() => setStep(STEP.ROLE)} className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary mb-8 hover:text-ink transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to roles
                  </button>

                  <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold mb-2 text-ink">
                      {isRegister ? 'Create an account' : 'Sign in to your account'}
                    </h2>
                    <p className="text-ink-secondary">
                      {isRegister ? 'Join thousands of users on ServisAku' : 'Enter your details below to continue'}
                    </p>
                  </div>

                  {/* Mode tabs */}
                  <div className="flex bg-raised rounded-xl p-1 mb-8">
                    {[{ id: MODE.EMAIL, icon: Mail, label: 'Email' }, { id: MODE.PHONE, icon: Phone, label: 'Phone OTP' }].map(m => (
                      <button key={m.id} onClick={() => { setMode(m.id); setIsRegister(false); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${mode === m.id ? 'bg-surface shadow-sm text-ink' : 'text-ink-secondary hover:text-ink'}`}>
                        <m.icon className="h-4 w-4" /> {m.label}
                      </button>
                    ))}
                  </div>

                  {mode === MODE.EMAIL ? (
                    <div className="space-y-4">
                      {isRegister && (
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-ink pl-1">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-tertiary" />
                            <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)}
                              className="w-full bg-raised rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 ring-brand/30 border border-transparent focus:border-brand/30 text-ink transition-all" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-ink pl-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-tertiary" />
                          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-raised rounded-xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 ring-brand/30 border border-transparent focus:border-brand/30 text-ink transition-all" autoFocus />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-ink pl-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-tertiary" />
                          <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-raised rounded-xl pl-12 pr-12 py-3.5 text-sm outline-none focus:ring-2 ring-brand/30 border border-transparent focus:border-brand/30 text-ink transition-all"
                            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <Button onClick={handleEmailAuth} disabled={loading || !email || !password || (isRegister && !fullName)}
                        className="w-full h-14 rounded-xl bg-brand text-white hover:bg-brand/90 mt-4 shadow-lg shadow-brand/20 font-semibold text-base transition-all">
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                      
                      <div className="text-center pt-4">
                        <span className="text-sm text-ink-secondary">
                          {isRegister ? "Already have an account?" : "Don't have an account?"}
                        </span>
                        <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-sm font-semibold text-brand hover:underline">
                          {isRegister ? 'Sign in' : 'Sign up'}
                        </button>
                      </div>

                      {/* Demo hint */}
                      {!isRegister && (
                        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
                          <div className="font-semibold mb-2 flex items-center gap-1.5"><Shield className="h-3.5 w-3.5"/> Demo Credentials</div>
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div>User: <span className="font-medium text-blue-900">user@servisaku.my</span><br/>Pass: user123</div>
                            <div>Admin: <span className="font-medium text-blue-900">admin@servisaku.my</span><br/>Pass: admin123</div>
                            <div className="col-span-2">Partner: <span className="font-medium text-blue-900">ali@servisaku.my</span> / partner123</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-ink pl-1">Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-2 bg-raised rounded-xl px-4 py-3.5 text-sm font-medium shrink-0 border border-transparent">
                            🇲🇾 +60
                          </div>
                          <input type="tel" placeholder="11 234 5678" value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 bg-raised rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 ring-brand/30 border border-transparent focus:border-brand/30 text-ink transition-all"
                            maxLength={11} autoFocus />
                        </div>
                      </div>
                      
                      <div className="bg-brand-tint/30 rounded-xl p-4 mt-6 text-sm text-brand-ink flex items-start gap-3">
                        <Shield className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                        <p>Your number is used for secure login only. We'll send you a One-Time Password (OTP) to verify it's you.</p>
                      </div>
                      
                      <Button onClick={handleSendOTP} disabled={phone.length < 8} className="w-full h-14 rounded-xl bg-brand text-white hover:bg-brand/90 mt-4 shadow-lg shadow-brand/20 font-semibold text-base transition-all">
                        Send OTP <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: OTP entry */}
              {step === STEP.OTP && (
                <div>
                  <button onClick={() => setStep(STEP.INPUT)} className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary mb-8 hover:text-ink transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  
                  <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold mb-2 text-ink">Enter Verification Code</h2>
                    <p className="text-ink-secondary">We've sent a 6-digit code to <span className="font-semibold text-ink">+60{phone}</span></p>
                  </div>
                  
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800 flex items-center justify-between">
                    <span>Demo OTP code:</span>
                    <strong className="font-mono text-xl tracking-widest bg-white px-3 py-1 rounded shadow-sm">{sentOtp}</strong>
                  </div>
                  
                  <div className="relative mb-6">
                    <input type={showOtp ? 'text' : 'password'} placeholder="••••••" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-raised rounded-xl px-4 pr-12 py-5 text-3xl tracking-[0.5em] text-center font-bold outline-none focus:ring-2 ring-brand/30 border border-transparent focus:border-brand/30 text-ink transition-all"
                      maxLength={6} autoFocus />
                    <button onClick={() => setShowOtp(!showOtp)} className="absolute right-5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors">
                      {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <div className="text-center mb-8">
                    {countdown > 0
                      ? <p className="text-sm text-ink-secondary">Resend code in <span className="font-medium text-ink">{countdown}s</span></p>
                      : <button onClick={handleResend} className="text-sm font-semibold text-brand hover:underline">Resend OTP Code</button>}
                  </div>
                  
                  <Button onClick={handleVerify} disabled={otp.length < 6 || loading} className="w-full h-14 rounded-xl bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/20 font-semibold text-base transition-all">
                    {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 4: Done */}
              {step === STEP.DONE && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-display font-bold text-ink">Successfully Verified!</h2>
                  <p className="text-ink-secondary mt-2">Redirecting to your dashboard...</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}