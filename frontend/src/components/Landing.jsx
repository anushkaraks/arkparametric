import { useState } from 'react';
import { Shield, BarChart3, Zap, CheckCircle2, ChevronRight, Activity, ArrowRight, MapPin } from 'lucide-react';
import { registerUser, login as apiLogin } from '../lib/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'];
const PLATFORMS = ['Delivery (Swiggy/Zomato)', 'Ride-hailing (Uber/Ola)', 'Freelance (Upwork)', 'E-commerce (Meesho)', 'Domestic Services (Urban Company)'];

export default function Landing({ onLogin }) {
  const [form, setForm] = useState({ name: '', platform: PLATFORMS[0], city: 'Mumbai' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create user and auto-login
      const user = await registerUser({ ...form, avg_hours_per_week: 40 });
      const authData = await apiLogin(user.id);
      onLogin(authData.user);
    } catch (err) {
      setError(err.message || 'Failed to initialize coverage.');
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      const authData = await apiLogin(1);
      onLogin(authData.user);
    } catch (err) {
      setError('Run backend seed script first to create Demo user (ID:1).');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ── Desktop/Mobile Hero Section ────────────────────────────── */}
      <div className="hero-gradient pt-10 md:pt-20 pb-16 md:pb-28 px-4 md:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left content */}
          <div className="space-y-6 md:space-y-8 z-10 relative">
            <div className="md:hidden flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold w-fit uppercase tracking-wider mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              Solar Sentinel Protocol Active
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: 'var(--dark)' }}>
              Secure your <br className="hidden md:block" />
              <span style={{ color: 'var(--amber)' }}>gig earnings.</span>
            </h1>
            
            <p className="text-sm md:text-lg max-w-lg" style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
              Parametric protection for the modern workforce. We cover the variables you can't control—weather, air quality, and traffic—ensuring your income stays consistent.
            </p>

            <div className="hidden md:flex gap-12 pt-4">
              <div>
                <p className="text-3xl font-extrabold" style={{ color: 'var(--dark)' }}>99.9%</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gray-400)' }}>Uptime Accuracy</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold" style={{ color: 'var(--dark)' }}>Instant</p>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--gray-400)' }}>Claims Payout</p>
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex flex-col gap-3">
              <button onClick={() => document.getElementById('calc-form').scrollIntoView()} className="btn-primary w-full flex items-center justify-center gap-2">
                Get Covered Now <ChevronRight size={16} />
              </button>
              <button onClick={handleDemo} className="btn-secondary w-full bg-white">
                View Live Risk Feed
              </button>
            </div>
          </div>

          {/* Right form (Desktop & Mobile) */}
          <div id="calc-form" className="z-10 bg-white rounded-2xl shadow-xl shadow-amber-900/5 overflow-hidden border border-gray-100">
            <div className="p-6 md:p-8 relative">
              {/* Decorative edge */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>

              <h3 className="text-xl font-bold mb-6 font-serif">
                <span className="hidden md:inline">Calculate Your Shield</span>
                <span className="md:hidden uppercase text-sm tracking-wider">Deployment Profile</span>
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Operator Name</label>
                  <input required type="text"
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Jane Cooper"
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Gig Classification</label>
                  <select className="select-field" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Deployment Zone (City)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select className="select-field pl-10" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2 uppercase text-sm tracking-wide">
                  {loading ? 'Initializing...' : (
                    <span className="hidden md:inline">Generate Quote</span>
                  )}
                  {loading ? '' : (
                    <span className="md:hidden">Initialize Coverage</span>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
              <button type="button" onClick={handleDemo} disabled={loading} className="text-xs text-amber-600 font-medium hover:underline">
                Or Continue as Demo User (ID: 1)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Features Section ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        
        <div className="mb-10 md:mb-16">
          <p className="text-[10px] font-bold text-amber-500 tracking-[0.2em] uppercase mb-3">The Solar Sentinel Framework</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Financial Resilience by Design.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="card flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold mb-3">Dynamic Premiums</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Our ML-driven engine processes hyper-local risk data in real-time. We calculate specific exposure based on your actual route and working hours.
              </p>
            </div>
            <div className="h-24 flex items-end gap-2 shrink-0">
              {[30, 40, 70, 30, 40, 90, 35].map((h, i) => (
                <div key={i} className="w-full rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 2 || i === 5 ? 'var(--amber)' : 'var(--gray-200)' }}></div>
              ))}
            </div>
          </div>

          {/* Feature 2 (Gold card) */}
          <div className="card-amber relative overflow-hidden flex flex-col justify-between md:col-span-1" style={{ background: 'linear-gradient(145deg, #A86B00 0%, #704700 100%)', borderColor: '#C88100', color: 'white' }}>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Zap size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                <Zap size={20} />
              </div>
              <h3 className="text-lg font-bold mb-3">Automated Trigger Engine</h3>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">
                Continuous monitoring of Weather, AQI, and Traffic thresholds. When conditions deteriorate, your policy activates instantly.
              </p>
            </div>
            <div className="relative z-10 shrink-0 border-t border-white/20 pt-4 mt-auto">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-white/70">
                <span>Weather Sensor</span>
                <span className="text-white">Active</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[80%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
              </div>
            </div>
          </div>

          {/* Feature 3 & 4 column */}
          <div className="flex flex-col gap-6 md:col-span-1">
            <div className="card flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <CheckCircle2 size={16} />
              </div>
              <h3 className="text-lg font-bold mb-2">Zero-Touch Claims</h3>
              <p className="text-sm text-gray-500 mb-6">No paperwork. No adjusters. Payouts are triggered by data events, depositing funds directly to your wallet.</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 w-fit px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle2 size={14} /> Verified Settlement
              </div>
            </div>
            
            <div className="card p-0 overflow-hidden relative flex-1 min-h-[160px] bg-slate-900 border-none">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-end">
                  <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-2 text-right">
                    <p className="text-[8px] uppercase tracking-wider text-amber-500 font-bold mb-1">Current Signals</p>
                    <p className="text-xl font-bold text-white leading-none">42 <span className="text-xs font-normal text-white/60">MODERATE</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" /> Live Risk Perimeter
                  </h3>
                  <p className="text-xs text-white/60">Real-time visualization of environmental volatility.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Extra Content (from Image 3) ───────────────── */}
      <div className="md:hidden max-w-7xl mx-auto px-4 pb-16">
         <h2 className="text-2xl font-extrabold tracking-tight mb-4">Intelligent <br/><span className="text-amber-500 italic">Response</span> Protocol.</h2>
         <p className="text-sm text-gray-600 mb-6">
           Traditional insurance fails gig workers because it's too slow. Ark's parametric model uses decentralized data to verify income loss in seconds.
         </p>
         
         <div className="flex gap-4 mb-6">
           <div className="card flex-1 text-center py-4">
             <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Avg Settlement</p>
             <p className="text-2xl font-extrabold text-amber-600">14 <span className="text-xs text-amber-500 font-bold">SEC</span></p>
           </div>
           <div className="card flex-1 text-center py-4">
             <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Risk Mitigated</p>
             <p className="text-2xl font-extrabold text-dark">$2M+</p>
           </div>
         </div>

         <div className="bg-dark text-white rounded-2xl p-5 flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">System Status</p>
             <p className="text-sm font-semibold">Optimal Operational Status</p>
           </div>
           <div className="flex gap-1">
             {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-4 bg-amber-500 rounded-full animate-pulse-slow"></div>)}
           </div>
         </div>
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-1 bg-amber-700 mx-auto mb-8 rounded-full"></div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-10 text-dark">
          Don't let the forecast <br/> dictate your paycheck.
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="btn-primary min-w-[200px]">
            Protect My Income
          </button>
          <button className="btn-secondary bg-transparent border-gray-300 min-w-[200px]">
            Review Policy Types
          </button>
        </div>
      </div>
    </div>
  );
}
