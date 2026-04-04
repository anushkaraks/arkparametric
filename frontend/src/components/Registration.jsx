import React, { useState } from 'react';
import { User, MapPin, Briefcase, Clock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { registerUser } from '../lib/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const PLATFORMS = ['Delivery (Swiggy/Zomato)', 'Ride-hailing (Uber/Ola)', 'Freelance (Upwork)', 'E-commerce (Meesho)', 'Domestic Services (Urban Company)'];

const Registration = ({ onRegistered }) => {
  const [form, setForm] = useState({ name: '', city: 'Mumbai', platform: 'Delivery (Swiggy/Zomato)', avg_hours_per_week: 40 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Please enter your full name.'); return; }
    setLoading(true); setError('');
    try {
      const user = await registerUser({ ...form, avg_hours_per_week: Number(form.avg_hours_per_week) });
      setSuccess(user);
      setTimeout(() => onRegistered(user), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-10 max-w-md w-full text-center space-y-4 glow-blue">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to Ark, {success.name}!</h2>
          <p className="text-slate-400 text-sm">Your profile has been created. Gemini AI calculated your risk score: <span className="text-amber-400 font-bold">{success.risk_profile_score?.toFixed(2)}</span></p>
          <p className="text-slate-500 text-xs animate-pulse">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Parametric Income Protection
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Register with <span className="text-gradient">Ark</span>
          </h1>
          <p className="text-slate-400 text-sm">AI-powered income protection for gig workers. Get insured in 60 seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select name="city" value={form.city} onChange={handleChange} className="select-field pl-10">
                {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform / Work Type</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select name="platform" value={form.platform} onChange={handleChange} className="select-field pl-10">
                {PLATFORMS.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
              </select>
            </div>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Average Hours/Week: <span className="text-blue-400">{form.avg_hours_per_week} hrs</span>
            </label>
            <div className="relative">
              <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="range" name="avg_hours_per_week"
                min="10" max="80" step="5"
                value={form.avg_hours_per_week}
                onChange={handleChange}
                className="w-full pl-10 accent-blue-500"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>10 hrs (part-time)</span><span>80 hrs (full-time)</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm">
              <AlertCircle size={16} />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
            {loading ? <><Loader2 className="animate-spin" size={18} />Creating Profile...</> : <>Create Profile <ArrowRight size={18} /></>}
          </button>

          <p className="text-center text-xs text-slate-500">
            Already registered?{' '}
            <button type="button" onClick={() => onRegistered({ id: 1 })} className="text-blue-400 hover:underline">
              Continue as Demo User (ID: 1)
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;
