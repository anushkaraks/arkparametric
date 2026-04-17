import { ArrowUpRight, ShieldAlert, BadgeCheck, CloudLightning, Navigation, Activity } from 'lucide-react';

export default function Dashboard({ user, setTab }) {
  
  return (
    <div className="space-y-4 px-4 pt-6 pb-24 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="flex items-center justify-between mb-2">
        <div>
           <p className="text-sm font-semibold text-[var(--text-muted)]">Good morning,</p>
           <h1 className="text-2xl font-bold text-[var(--text-main)]">{user.name.split(' ')[0]}</h1>
        </div>
        <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
        </div>
      </div>

      {/* Risk Profile Card */}
      <div className="relative overflow-hidden bg-[var(--text-main)] rounded-3xl p-5 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 opacity-10">
          <ShieldAlert size={160} />
        </div>
        <div className="relative z-10">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Risk Profile Score</p>
                 <div className="flex items-baseline gap-1">
                   <p className="text-4xl font-extrabold">8.4</p>
                   <p className="text-sm text-gray-400">/ 10</p>
                 </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                 <p className="text-[10px] font-bold text-green-400 uppercase">Optimal</p>
              </div>
           </div>
           
           <div className="flex gap-4 border-t border-white/10 pt-4">
              <div className="flex-1">
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Active Policy</p>
                 <p className="text-sm font-semibold flex items-center gap-1.5">
                   Ark Sentinel Pro <BadgeCheck size={14} className="text-[var(--primary)]" />
                 </p>
              </div>
              <div className="flex-1">
                 <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Coverage Limit</p>
                 <p className="text-sm font-semibold">₹15,000 / week</p>
              </div>
           </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
         <button onClick={() => setTab('claims')} className="dash-card flex flex-col justify-between h-32 hover:bg-gray-50 active:scale-95 transition-all text-left">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-bg)] text-[var(--primary)] flex items-center justify-center">
               <ArrowUpRight size={20} />
            </div>
            <div>
               <p className="font-bold text-[var(--text-main)] text-sm">Recent Claims</p>
               <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">View history</p>
            </div>
         </button>
         <button onClick={() => setTab('risk')} className="dash-card flex flex-col justify-between h-32 hover:bg-gray-50 active:scale-95 transition-all text-left">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
               <Activity size={20} />
            </div>
            <div>
               <p className="font-bold text-[var(--text-main)] text-sm">Live Risk Map</p>
               <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Sector 7G</p>
            </div>
         </button>
      </div>

      {/* Live Environment Monitoring */}
      <div className="pt-4">
         <h2 className="text-sm font-bold text-[var(--text-main)] mb-3 px-1">Environment Monitoring</h2>
         
         <div className="dash-card">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border)]">
               <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-[var(--text-muted)]" />
                  <span className="font-semibold text-sm">{user.city} Zone 4</span>
               </div>
               <span className="text-xs font-bold text-[var(--primary)]">LIVE</span>
            </div>

            <div className="space-y-4">
               {/* Weather Tracker */}
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                     <CloudLightning size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Severe Weather Risk</span>
                        <span className="font-bold text-orange-500">Elevated</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-1.5 rounded-full w-[65%]"></div>
                     </div>
                  </div>
               </div>

               {/* AQI Tracker */}
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                     <Activity size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Air Quality Index (AQI)</span>
                        <span className="font-bold text-red-500">210</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-red-500 h-1.5 rounded-full w-[80%]"></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
