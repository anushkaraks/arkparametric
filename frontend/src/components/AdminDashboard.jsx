import { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Activity, ShieldAlert, 
  TrendingUp, MapPin, AlertCircle, RefreshCw, 
  ArrowUpRight, ArrowDownRight, Users, Zap
} from 'lucide-react';
import { fetchAdminAnalytics } from '../lib/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const analytics = await fetchAdminAnalytics();
      setData(analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <RefreshCw className="animate-spin text-amber-600" size={32} />
      </div>
    );
  }

  const lossRatioPercent = (data.loss_ratio * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Insurer Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Institutional portal for predictive risk and portfolio exposure.</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* ── Top Stats Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border-l-4 border-l-amber-600">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Gross Premium</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900">₹{data.total_premiums.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-green-600 flex items-center mb-1">
              <ArrowUpRight size={10} /> 12%
            </span>
          </div>
        </div>

        <div className="card border-l-4 border-l-blue-600">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Portfolio Loss Ratio</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900">{lossRatioPercent}%</span>
            <span className={`text-[10px] font-bold flex items-center mb-1 ${data.loss_ratio > 0.6 ? 'text-red-500' : 'text-green-600'}`}>
              {data.loss_ratio > 0.6 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} Optimal
            </span>
          </div>
        </div>

        <div className="card border-l-4 border-l-red-600">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Fraud Flags</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900">{data.fraud_flags}</span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center mb-1">Alerts</span>
          </div>
        </div>

        <div className="card border-l-4 border-l-emerald-600">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Net Payouts</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-900">₹{data.total_paid.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-gray-400 flex items-center mb-1">Parametric</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* ── Claims Breakdown (Pie Chart SVG) ────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <PieChart size={16} className="text-amber-600" /> Exposure by Peril
            </h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Simple SVG Pie Chart */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                <circle r="16" cx="16" cy="16" fill="transparent" stroke="#E5E7EB" strokeWidth="32" />
                {/* Heat - Red */}
                <circle r="16" cx="16" cy="16" fill="transparent" stroke="#EF4444" strokeWidth="32" strokeDasharray="100 100" />
                {/* Rain - Blue (approx 60%) */}
                <circle r="16" cx="16" cy="16" fill="transparent" stroke="#3B82F6" strokeWidth="32" strokeDasharray="65 100" />
                {/* AQI - Orange (approx 20%) */}
                <circle r="16" cx="16" cy="16" fill="transparent" stroke="#F59E0B" strokeWidth="32" strokeDasharray="15 100" />
              </svg>
            </div>

            <div className="flex-1 space-y-4 w-full">
              {[
                { label: 'Severe Weather (Rain)', value: data.claims_by_trigger.rain || 0, color: 'bg-blue-500', percent: '65%' },
                { label: 'Extreme Heat', value: data.claims_by_trigger.heat || 0, color: 'bg-red-500', percent: '20%' },
                { label: 'AQI Toxicity', value: data.claims_by_trigger.pollution || 0, color: 'bg-amber-500', percent: '15%' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-500 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} /> {item.label}
                    </span>
                    <span className="text-gray-900">{item.value} claims</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: item.percent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Predictive Analytics ─────────────────────────────────── */}
        <div className="card bg-gray-900 text-white border-none shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} /> Predictive Loss (Next 7D)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">AI FORECAST</span>
          </div>
          
          <div className="space-y-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              Based on recent meteorological telemetry and urban activity trends, the portfolio faces heightened disruption risk in <span className="text-white font-bold">Mumbai South</span> and <span className="text-white font-bold">Delhi NCR</span>.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Likely Claims</p>
                <p className="text-xl font-bold">~14-18</p>
                <p className="text-[10px] text-amber-500 font-bold mt-1">+24% vs last week</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Payout</p>
                <p className="text-xl font-bold">₹28.4K</p>
                <p className="text-[10px] text-green-500 font-bold mt-1">Hedged</p>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4">
                <Activity size={14} className="text-amber-500" /> System Confidence: 88.4%
              </div>
              <div className="flex items-end gap-1 h-12">
                {[40, 60, 45, 80, 55, 70, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-amber-500/20 rounded-t-sm relative group">
                    <div className="absolute bottom-0 w-full bg-amber-500 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-bold text-gray-500 mt-2">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* ── Top Risk Zones ───────────────────────────────────────── */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
            <MapPin size={16} className="text-amber-600" /> Geospatial Risk Densities
          </h3>
          <div className="space-y-1">
            {data.high_risk_cities.map((city, idx) => (
              <div key={city.city} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400">#{idx+1}</span>
                  <span className="text-sm font-bold text-gray-900">{city.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-500">{city.claims} claims</span>
                  <div className={`w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden`}>
                    <div className="h-full bg-amber-500" style={{ width: `${(city.claims / data.high_risk_cities[0].claims) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent High Risk Alerts ──────────────────────────────── */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
            <ShieldAlert size={16} className="text-red-600" /> Fraud Sentinel Queue
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border border-red-50 bg-red-50/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertCircle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">High Confidence Spoofing</p>
                    <p className="text-[10px] text-gray-500">Claim #ARK-449{i} • GPS Discrepancy</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-red-600 hover:underline">REJECT</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
            Review Full Fraud Queue
          </button>
        </div>

      </div>

    </div>
  );
}
