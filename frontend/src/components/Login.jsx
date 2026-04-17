import { useState, useRef } from 'react';
import { Shield, Phone, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';
import { requestOTP, verifyOTP } from '../lib/api';

export default function Login({ onLogin, onSwitchToSignUp }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [demoOtp, setDemoOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // ── Step 1: Request OTP ──────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestOTP(phone.trim());
      setDemoOtp(res.demo_otp);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const authData = await verifyOTP(phone.trim(), code);
      onLogin(authData.user);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    if (pasted.length > 0) otpRefs[Math.min(pasted.length, 3)].current?.focus();
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await requestOTP(phone.trim());
      setDemoOtp(res.demo_otp);
      setOtp(['', '', '', '']);
      startResendTimer();
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(to bottom, #F8F9FB 0%, #EEF2F6 100%)' }}>

      {/* Gold hero header */}
      <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden z-0 rounded-b-[40px] md:rounded-none shadow-sm"
        style={{ background: 'linear-gradient(180deg, #1A1A1A 0%, rgba(26,26,26,0) 100%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-48 h-48 rounded-full shadow-[0_0_40px_rgba(212,146,11,0.3)]"
            style={{ background: 'radial-gradient(circle at 30% 30%, #FDE6B0 0%, #D4920B 60%, #8C5D00 100%)' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-overlay">
          <span className="text-[100px] font-serif italic text-white/40 tracking-tight transform -rotate-6">Premium</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl mt-32 p-8 shadow-xl rounded-3xl border border-white/50"
        style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>

        {/* Branding */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-amber-600" />
            <h1 className="text-2xl font-extrabold" style={{ color: '#8C5D00' }}>Ark Parametric</h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">The Parametric Engine</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? 'Welcome Back' : 'Verify Your Identity'}
          </h2>
          <p className="text-sm text-gray-500">
            {step === 'phone'
              ? 'Enter your registered phone number to continue.'
              : `OTP sent to ${phone}. Enter it below.`}
          </p>
        </div>

        {/* ── Demo OTP banner ── */}
        {demoOtp && (
          <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <CheckCircle size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800">Demo Mode — OTP Delivered</p>
              <p className="text-sm text-amber-700">
                Your code: <span className="font-extrabold tracking-widest text-lg">{demoOtp}</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Step 1: Phone entry ── */}
        {step === 'phone' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-gray-700"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button
              id="send-otp-btn"
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(to right, #A86B00, #D4920B)' }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP entry ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Verification Code</label>
                <button
                  id="resend-otp-btn"
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
              <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-digit-${i}`}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-14 text-center text-xl font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-gray-900"
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('phone'); setError(null); setOtp(['','','','']); }}
                className="flex-1 py-3.5 px-4 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
              >
                ← Back
              </button>
              <button
                id="verify-otp-btn"
                type="submit"
                disabled={loading || otp.join('').length < 4}
                className="flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #A86B00, #D4920B)' }}
              >
                {loading ? 'Verifying...' : 'Login'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3">New to the ark ecosystem?</p>
          <button
            id="switch-to-signup-btn"
            onClick={onSwitchToSignUp}
            className="w-full py-3 px-4 border border-gray-200 bg-gray-50/50 rounded-xl shadow-sm text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all"
          >
            Create Executive Account
          </button>
        </div>

        {/* Demo hint */}
        <p className="mt-4 text-center text-[10px] text-gray-400">
          Demo account: <span className="font-bold text-gray-600">+919999999999</span>
        </p>
      </div>

      <div className="mt-auto pt-8 pb-4 w-full max-w-md flex justify-between items-center px-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60">ARK PARAMETRIC V1.0</span>
        <div className="flex gap-2 text-amber-600/40">
          <Shield size={14} />
          <Shield size={14} className="opacity-50" />
        </div>
      </div>
    </div>
  );
}
