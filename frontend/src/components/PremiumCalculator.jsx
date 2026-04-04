import React, { useState } from 'react';
import { Calculator, Zap, MapPin, Briefcase, Clock, TrendingUp, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { calculatePremium } from '../lib/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const PLATFORMS = ['Delivery (Swiggy/Zomato)', 'Ride-hailing (Uber/Ola)', 'Freelance (Upwork)', 'E-commerce (Meesho)', 'Domestic Services (Urban Company)'];

const RiskBar = ({ score }) => {
  const pct = Math.min(100, ((score - 1) / 2) * 100);
  const color = score > 2 ? '#f43f5e' : score > 1.5 ? '#f59e0b' : '#10b981';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">Risk Level</span>
        <span style={{ color }} className="font-semibold">{score > 2 ? 'High' : score > 1.5 ? 'Medium' : 'Low'} ({score.toFixed(2)})</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const PremiumCalculator = () => {
  const [form, setForm] = useState({ city: 'Mumbai', platform: 'Delivery (Swiggy/Zomato)', hours: 40 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await calculatePremium(form.city, form.hours, form.platform);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Calculation failed. Ensure backend is running.');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dynamic Premium Calculator</h2>
        <p className="text-slate-500 text-sm mt-0.5">Powered by Gemini AI — get a real-time premium quote based on your work profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Calculator size={16} className="text-blue-400" />Your Work Profile
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select name="city" value={form.city} onChange={handleChange} className="select-field pl-10 text-sm">
                {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select name="platform" value={form.platform} onChange={handleChange} className="select-field pl-10 text-sm">
                {PLATFORMS.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Coverage Hours: <span className="text-blue-400">{form.hours} hrs/week</span>
            </label>
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-slate-500 shrink-0" />
              <input type="range" name="hours" min="10" max="80" step="5" value={form.hours}
                onChange={handleChange} className="flex-1 accent-blue-500" />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1"><span>10h</span><span>80h</span></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm">
              <AlertCircle size={14} />{error}
            </div>
          )}

          <button onClick={calculate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={16} />Calculating with Gemini...</> : <><Zap size={16} />Calculate My Premium</>}
          </button>
        </div>

        {/* Result Panel */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          {!result && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Calculator size={28} className="text-blue-400/50" />
              </div>
              <p className="text-slate-500 text-sm">Fill in your profile and click calculate to get an AI-powered premium quote.</p>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-400" size={36} />
              <p className="text-slate-400 text-sm">Gemini AI is analyzing your risk profile...</p>
            </div>
          ) : result && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />Your Quote
                </h3>
                <button onClick={calculate} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1">
                  <RefreshCw size={12} />Recalculate
                </button>
              </div>

              {/* Premium spotlight */}
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-2xl p-6 text-center glow-blue">
                <p className="text-slate-400 text-sm mb-1">Weekly Premium</p>
                <p className="text-5xl font-bold text-white">₹{Number(result.weekly_premium)?.toFixed(0)}</p>
                <p className="text-slate-400 text-xs mt-1">≈ ₹{(Number(result.weekly_premium) * 52)?.toFixed(0)} / year</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Est. Hourly Rate</p>
                  <p className="text-xl font-bold text-emerald-400">₹{Number(result.hourly_rate)?.toFixed(0)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Monthly Premium</p>
                  <p className="text-xl font-bold text-indigo-400">₹{(Number(result.weekly_premium) * 4.33)?.toFixed(0)}</p>
                </div>
              </div>

              <RiskBar score={Number(result.risk_score) || 1} />

              {result.reasoning && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 flex items-start gap-2">
                  <Zap size={12} className="mt-0.5 shrink-0 text-blue-400" />
                  <span><strong>Gemini Insight:</strong> {result.reasoning}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">How Dynamic Pricing Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Location Risk', desc: 'City-level weather disruption frequency, flood zones, traffic patterns.' },
            { title: 'Platform Risk', desc: 'Historical downtime, payout reliability, and gig market saturation.'},
            { title: 'Hours Coverage', desc: 'More hours = higher premium, but also higher payout on valid claims.' }
          ].map(f => (
            <div key={f.title} className="bg-white/5 rounded-xl p-4">
              <p className="font-semibold text-white text-sm mb-1">{f.title}</p>
              <p className="text-slate-400 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumCalculator;
