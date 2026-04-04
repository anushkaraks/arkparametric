import React, { useState, useEffect } from 'react';
import { Shield, FileText, TrendingUp, Activity, CloudRain, ThermometerSun, Wind, ServerCrash, Zap, CircleDollarSign } from 'lucide-react';
import { fetchUserPolicies, fetchClaims } from '../lib/api';

const LiveTicker = () => {
  const [data, setData] = useState({ temp: 28.4, rain: 0, aqi: 62 });
  useEffect(() => {
    const id = setInterval(() => setData(p => ({
      temp: +(p.temp + (Math.random() * 0.4 - 0.2)).toFixed(1),
      rain: Math.max(0, +(p.rain + (Math.random() * 0.5 - 0.1)).toFixed(1)),
      aqi: Math.max(0, Math.round(p.aqi + (Math.random() * 4 - 2))),
    })), 4000);
    return () => clearInterval(id);
  }, []);

  const metrics = [
    { icon: ThermometerSun, label: 'Temperature', value: `${data.temp}°C`, color: 'text-amber-400', threshold: data.temp > 40 },
    { icon: CloudRain, label: 'Rainfall', value: `${data.rain} mm/hr`, color: 'text-blue-400', threshold: data.rain > 15 },
    { icon: Wind, label: 'AQI Index', value: data.aqi, color: data.aqi > 200 ? 'text-rose-400' : 'text-emerald-400', threshold: data.aqi > 200 },
    { icon: ServerCrash, label: 'Platform Status', value: 'Operational', color: 'text-emerald-400', threshold: false },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        Live Risk Telemetry
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(({ icon: Icon, label, value, color, threshold }) => (
          <div key={label} className={`bg-white/5 rounded-xl p-3 flex items-center gap-3 ${threshold ? 'border border-rose-500/30' : ''}`}>
            <Icon className={color} size={22} />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-bold text-sm text-white">{value}</p>
            </div>
            {threshold && <span className="ml-auto text-rose-400 text-xs font-bold animate-pulse">!</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserPolicies(user.id).then(setPolicies).catch(() => {});
    fetchClaims(user.id).then(setClaims).catch(() => {});
  }, [user?.id]);

  const activePolicies = policies.filter(p => p.active_status);
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const totalPayout = approvedClaims.reduce((s, c) => s + (c.loss_calculated || 0), 0);
  const weeklyPremium = activePolicies.reduce((s, p) => s + (p.weekly_premium || 0), 0);

  const recentClaims = claims.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass rounded-2xl p-6 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <div>
            <p className="text-slate-400 text-sm">Welcome back</p>
            <h2 className="text-2xl font-bold text-white">{user?.name || 'Gig Worker'}</h2>
            <p className="text-slate-400 text-sm">{user?.city} · {user?.platform}</p>
          </div>
          <div className="ml-auto text-right hidden md:block">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Risk Score</p>
            <p className={`text-3xl font-bold ${user?.risk_profile_score > 2 ? 'text-rose-400' : user?.risk_profile_score > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {user?.risk_profile_score?.toFixed(2) || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Policies', value: activePolicies.length, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Claims', value: claims.length, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Payout Received', value: `₹${totalPayout.toFixed(0)}`, icon: CircleDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Weekly Premium', value: `₹${weeklyPremium.toFixed(0)}`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`${bg} ${color} p-2.5 rounded-xl w-fit mb-3`}><Icon size={20} /></div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Live panel */}
      <LiveTicker />

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active policies summary */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield size={16} className="text-blue-400" />Active Coverage</h3>
          {activePolicies.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No active policies. Go to Policies tab to create one.</p>
          ) : (
            <div className="space-y-3">
              {activePolicies.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-white">Policy #{p.id}</p>
                    <p className="text-xs text-slate-500">{p.coverage_hours}h coverage · Risk {p.risk_score?.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-blue-400 text-sm">₹{p.weekly_premium?.toFixed(0)}/wk</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent claims */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap size={16} className="text-amber-400" />Recent Claims</h3>
          {recentClaims.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No claims yet. Use "Simulate Trigger" in Claims tab to test.</p>
          ) : (
            <div className="space-y-3">
              {recentClaims.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">Claim #{c.id} — {(c.trigger_type || 'disruption').replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500">{c.disruption_hours?.toFixed(1)}h disrupted</p>
                  </div>
                  <span className={`badge text-xs ${c.status === 'approved' ? 'badge-green' : c.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
