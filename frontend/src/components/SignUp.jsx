import { useState, useRef } from 'react';
import { Shield, MapPin, Clock, ArrowRight, Phone, CheckCircle, RefreshCw } from 'lucide-react';
import { registerUser, requestOTP, verifyOTP } from '../lib/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const PLATFORMS = ['Delivery (Swiggy/Zomato)', 'Ride-hailing (Uber/Ola)', 'Freelance (Upwork)', 'E-commerce (Meesho)', 'Domestic Services (Urban Company)'];
const DAYS = [
  { id: 'M', label: 'M' }, { id: 'T1', label: 'T' }, { id: 'W', label: 'W' },
  { id: 'T2', label: 'T' }, { id: 'F', label: 'F' }, { id: 'S1', label: 'S' }, { id: 'S2', label: 'S' }
];

export default function SignUp({ onLogin, onSwitchToLogin }) {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({
    name: '', phone: '', platform: '', city: '',
    dailyCapacity: 8, activeDays: ['M', 'T1', 'W', 'T2', 'F']
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [demoOtp, setDemoOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const toggleDay = (dayId) => {
    setForm(prev => {
      const active = prev.activeDays.includes(dayId);
      return {
        ...prev,
        activeDays: active ? prev.activeDays.filter(d => d !== dayId) : [...prev.activeDays, dayId]
      };
    });
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

  // Step 1: Register user then send OTP
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const totalHours = form.dailyCapacity * form.activeDays.length;
      const payload = {
        name: form.name,
        phone: form.phone.trim(),
        city: form.city || CITIES[0],
        platform: form.platform || PLATFORMS[0],
        avg_hours_per_week: totalHours > 0 ? totalHours : 40
      };
      await registerUser(payload);
      // Now request OTP for the phone
      const res = await requestOTP(form.phone.trim());
      setDemoOtp(res.demo_otp);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const authData = await verifyOTP(form.phone.trim(), code);
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

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await requestOTP(form.phone.trim());
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 flex flex-col items-center">

      {/* Header Logo */}
      <div className="w-full max-w-md flex items-center gap-2 mb-8">
        <Shield size={24} className="text-amber-600" style={{ fill: '#8C5D00', color: '#8C5D00' }} />
        <span className="text-xl font-extrabold text-gray-900 tracking-tight">Ark Parametric</span>
      </div>

      <div className="w-full max-w-md">
        {/* ── Step 1: Profile Form ── */}
        {step === 'form' && (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
              Create your<br />professional profile
            </h1>
            <p className="text-sm font-medium text-gray-600 mb-8">
              Step into a new era of gig economy<br />intelligence.
            </p>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Full Name</label>
                <input
                  id="signup-name"
                  required type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Sterling"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium placeholder-gray-400"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="signup-phone"
                    required type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Primary Gig Sector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Primary Gig Sector</label>
                <div className="relative">
                  <select
                    id="signup-platform"
                    required value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium appearance-none"
                  >
                    <option value="" disabled>Select your specialization</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>

              {/* Base Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Base Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    id="signup-city"
                    required value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 font-medium appearance-none"
                  >
                    <option value="" disabled>City, Country</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Work Frequency Card */}
              <div className="bg-[#F4F6FB] p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={16} className="text-amber-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Work Frequency</span>
                </div>

                {/* Daily Capacity */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-900">Daily Capacity</span>
                    <span className="text-sm font-bold text-amber-700">{form.dailyCapacity} <span className="text-[10px] text-amber-600">HRS</span></span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full flex items-center">
                    <div className="absolute h-full bg-[#E6ECF5] rounded-full w-full" />
                    <div className="absolute h-full bg-blue-100 rounded-full" style={{ width: `${(form.dailyCapacity / 24) * 100}%` }} />
                    <input
                      type="range" min="1" max="24" value={form.dailyCapacity}
                      onChange={(e) => setForm({ ...form, dailyCapacity: parseInt(e.target.value) })}
                      className="w-full absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="absolute w-4 h-4 rounded-full shadow-sm pointer-events-none"
                      style={{ left: `calc(${(form.dailyCapacity / 24) * 100}% - 8px)`, background: '#8C5D00' }} />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                    <span>Part Time</span><span>Overdrive</span>
                  </div>
                </div>

                {/* Weekly Commitment */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-900">Weekly Commitment</span>
                    <span className="text-sm font-bold text-amber-700">{form.activeDays.length} <span className="text-[10px] text-amber-600">DAYS</span></span>
                  </div>
                  <div className="flex justify-between gap-1">
                    {DAYS.map(day => {
                      const isActive = form.activeDays.includes(day.id);
                      return (
                        <button key={day.id} type="button" onClick={() => toggleDay(day.id)}
                          className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-[#8C5D00] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button
                id="signup-submit-btn"
                type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: '#A86B00' }}
              >
                {loading ? 'Processing...' : 'Complete Onboarding'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 'otp' && (
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Verify Your<br />Phone Number</h1>
            <p className="text-sm font-medium text-gray-600 mb-6">OTP sent to <strong>{form.phone}</strong></p>

            {/* Demo OTP banner */}
            {demoOtp && (
              <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <CheckCircle size={18} className="text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Demo Mode — OTP Delivered</p>
                  <p className="text-sm text-amber-700">
                    Your code: <span className="font-extrabold tracking-widest text-lg">{demoOtp}</span>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Verification Code</label>
                  <button
                    type="button" onClick={handleResend}
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
                      key={i} ref={otpRefs[i]}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
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
                  type="button" onClick={() => { setStep('form'); setError(null); }}
                  className="flex-1 py-3.5 px-4 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
                >
                  ← Back
                </button>
                <button
                  id="signup-verify-btn"
                  type="submit" disabled={loading || otp.join('').length < 4}
                  className="flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#A86B00' }}
                >
                  {loading ? 'Verifying...' : 'Confirm & Login'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already a Member?{' '}
            <button id="switch-to-login-btn" onClick={onSwitchToLogin} className="font-bold text-[#8C5D00] hover:underline">
              Log in to your dashboard
            </button>
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200/60 flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}
