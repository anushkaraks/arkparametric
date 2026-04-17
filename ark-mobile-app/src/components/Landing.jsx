import { useState } from 'react';
import { Shield, ChevronRight, Phone, User, MapPin, Briefcase, Clock, FileCheck } from 'lucide-react';
import { registerUser, login as apiLogin, setToken } from '../lib/api';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
const PLATFORMS = ['Delivery (Swiggy/Zomato)', 'Ride-hailing (Uber/Ola)', 'Freelance (Urban Company)'];

export default function Landing({ onLogin }) {
  const [mode, setMode] = useState('welcome'); // welcome, login, signup, otp

  const [form, setForm] = useState({
    name: '',
    phone: '',
    platform: PLATFORMS[0],
    city: 'Mumbai',
    hours: '',
    days: ''
  });
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [animating, setAnimating] = useState(false);

  // Simple transition handler
  const switchMode = (newMode) => {
    setAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setAnimating(false);
    }, 200);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if(mode === 'login' || mode === 'signup') {
      switchMode('otp');
    } else if (mode === 'otp') {
      try {
        if (form.name) {
          // Signup flow
          const user = await registerUser({
            name: form.name,
            city: form.city,
            platform: form.platform,
            avg_hours_per_week: parseFloat(form.hours) * parseFloat(form.days) || 40,
          });
          // After register, auto-login mock via finding it or just log in by id
          const tokenData = await apiLogin(user.id);
          onLogin(user);
        } else {
          // Login flow mock directly using id 1 for now since we don't have phone lookup yet
          const tokenData = await apiLogin(1);
          onLogin(tokenData.user);
        }
      } catch (err) {
        console.error("Auth Error:", err);
        alert(err.message || "Something went wrong.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto relative shadow-2xl flex flex-col font-sans overflow-hidden">
      
      {/* Background Graphic */}
      <div className="absolute top-0 w-full h-[45%] bg-[var(--bg)] hero-bg"></div>
      
      {/* Top Banner space */}
      <div className="relative z-10 pt-16 px-6 pb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)] flex items-center justify-center text-white shadow-xl shadow-amber-600/30 mb-6 animate-float">
          <Shield size={32} />
        </div>
        
        {mode === 'welcome' && (
          <div className="text-center animate-slide-up">
            <h1 className="text-3xl font-extrabold text-[var(--text-main)] mb-2">Ark Sentinel</h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed px-4">
              AI-driven parametric protection for gig economy workers. Ensure your income remains steady.
            </p>
          </div>
        )}
      </div>

      {/* Action Card */}
      <div className={`relative z-10 flex-1 bg-white rounded-t-[40px] px-6 pt-10 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        
        {mode === 'welcome' && (
          <div className="flex-1 flex flex-col justify-end space-y-4 pb-6">
            <button onClick={() => switchMode('signup')} className="btn btn-primary w-full text-base">
              Create New Account
            </button>
            <button onClick={() => switchMode('login')} className="btn btn-secondary w-full text-base border-gray-200">
              I already have an account
            </button>
            
            {/* Social Proof */}
            <div className="pt-8 text-center">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Trusted by 10,000+ workers</p>
              <div className="flex justify-center -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="user" />
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleAuth} className="flex-1 flex flex-col animate-slide-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-sm text-[var(--text-muted)]">Enter your registered mobile number to continue.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-main)] font-semibold border-r border-gray-200 pr-3">+91</span>
                  <input required type="tel" maxLength="10" placeholder="000 000 0000" className="input pl-16 text-lg tracking-wider font-medium" />
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 space-y-4">
              <button type="submit" className="btn btn-primary w-full text-base">
                Send OTP <ChevronRight size={18} />
              </button>
              <button type="button" onClick={() => switchMode('welcome')} className="w-full text-sm font-semibold text-[var(--text-muted)]">
                Back to Welcome
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleAuth} className="flex-1 flex flex-col animate-slide-up pb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Build your profile</h2>
              <p className="text-sm text-[var(--text-muted)]">We need some details to calculate your coverage.</p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-4 custom-scrollbar">
              
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Jane Cooper" className="input pl-11" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="tel" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="9876543210" className="input pl-11" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Gig Platform</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select className="input pl-11 appearance-none bg-white" value={form.platform} onChange={e=>setForm({...form, platform:e.target.value})}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Primary Zone</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select className="input pl-11 appearance-none bg-white" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}>
                    {CITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Hours / Day</label>
                   <div className="relative">
                     <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input required type="number" min="1" max="24" value={form.hours} onChange={e=>setForm({...form, hours:e.target.value})} placeholder="8" className="input pl-11" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Days / Week</label>
                   <div className="relative">
                     <FileCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input required type="number" min="1" max="7" value={form.days} onChange={e=>setForm({...form, days:e.target.value})} placeholder="5" className="input pl-11" />
                   </div>
                 </div>
              </div>

            </div>

            <div className="pt-4 space-y-4 bg-white">
              <button type="submit" className="btn btn-primary w-full text-base">
                Create Account
              </button>
              <button type="button" onClick={() => switchMode('welcome')} className="w-full text-sm font-semibold text-[var(--text-muted)]">
                Cancel
              </button>
            </div>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleAuth} className="flex-1 flex flex-col animate-slide-up">
            <div className="mb-10 text-center mt-4">
              <h2 className="text-2xl font-bold mb-2">Verify it's you</h2>
              <p className="text-sm text-[var(--text-muted)]">We sent a 4-digit code to your number.</p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  required
                  className="w-14 h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[#FDF3E1] transition-all"
                  onChange={(e) => {
                     const newOtp = [...otp];
                     newOtp[index] = e.target.value;
                     setOtp(newOtp);
                     // Auto-focus logic would go here in a real app
                  }}
                />
              ))}
            </div>
            
            <p className="text-center text-sm font-semibold text-[var(--primary)] mb-8 cursor-pointer">
              Resend Code in 0:24
            </p>

            <div className="mt-auto pt-6 space-y-4">
              <button type="submit" className="btn btn-primary w-full text-base">
                Verify & Continue
              </button>
              <button type="button" onClick={() => switchMode('welcome')} className="w-full text-sm font-semibold text-[var(--text-muted)]">
                Go Back
              </button>
            </div>
          </form>
        )}

      </div>

      <style jsx>{`
        .hero-bg {
          background-image: radial-gradient(circle at 50% 0%, var(--primary-bg) 0%, white 100%);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
