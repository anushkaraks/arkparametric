import { useState, useEffect } from 'react';
import { IndianRupee, Activity, AlertCircle, ChevronRight, Zap, RefreshCw, Send, CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';
import { fetchClaims, simulateTrigger } from '../lib/api';
import FraudBadge from './FraudBadge';
import PayoutModal from './PayoutModal';

export default function Claims({ user }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [triggerType, setTriggerType] = useState('severe_weather');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchClaims(user.id);
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await simulateTrigger(user.city || 'Mumbai');
      // Reload claims after 3s to capture the new one
      setTimeout(load, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={12} className="text-green-600" />;
      case 'rejected': return <XCircle size={12} className="text-red-600" />;
      default: return <Clock size={12} className="text-amber-800" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-700';
      case 'rejected': return 'text-red-700';
      default: return 'text-amber-800';
    }
  };

  // Metrics
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const totalPaid = approvedClaims.reduce((s, c) => s + (c.loss_calculated || 0), 0);
  const activeCount = claims.filter(c => c.status === 'pending').length;
  const avgPayout = approvedClaims.length > 0 ? (totalPaid / approvedClaims.length) : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-dark tracking-tight">Claims History</h1>
          <p className="text-sm text-gray-500 mt-1">Automatic parametric settlement ledger.</p>
        </div>
        <button onClick={load} className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block">
          <RefreshCw size={18} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <RefreshCw className="animate-spin text-amber-500" size={24} />
        </div>
      ) : (
        <>
          {/* ── Summary Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Paid</p>
               <p className="text-2xl font-bold text-amber-700">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="card">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Active Claims</p>
               <p className="text-2xl font-bold text-dark">{activeCount}</p>
            </div>
            <div className="card">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Avg. Payout</p>
               <p className="text-2xl font-bold text-dark">₹{avgPayout.toFixed(0)}</p>
            </div>
          </div>

          {/* ── Recent Activity List ──────────────────────────────── */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-sm font-bold text-dark tracking-tight">Recent Activity</h2>
              <button className="text-xs font-bold text-amber-600 hover:text-amber-700">Download CSV</button>
            </div>
            
            <div className="space-y-3">
              {claims.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Activity className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">No recent claim events detected.</p>
                </div>
              ) : (
                claims.map(claim => (
                  <div key={claim.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all hover:shadow-md">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${claim.status === 'approved' ? 'bg-orange-100 text-orange-600' : claim.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                             {claim.status === 'approved' ? <IndianRupee size={18} /> : claim.status === 'rejected' ? <AlertCircle size={18} /> : <Activity size={18} />}
                           </div>
                           <div>
                              <p className="font-bold text-dark text-sm capitalize">{(claim.trigger_type || 'Disruption').replace('_', ' ')}</p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">Policy: #ARK-{claim.policy_id} • {new Date(claim.created_at).toLocaleDateString()}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <FraudBadge claimId={claim.id} initialConfidence={claim.fraud_confidence} />
                                {claim.status === 'approved' && !claim.payout && (
                                  <button 
                                    onClick={() => { setSelectedClaim(claim); setIsPayoutModalOpen(true); }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900 uppercase"
                                  >
                                    <CreditCard size={10} /> Pay Now
                                  </button>
                                )}
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                           <span className={`font-black ${claim.status === 'rejected' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              ₹{claim.loss_calculated?.toFixed(2) || '0.00'}
                           </span>
                           {claim.payout ? (
                             <div className="flex flex-col items-end">
                               <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter">Transferred ✓</span>
                               <span className="text-[8px] font-mono text-gray-400">{claim.payout.transaction_id}</span>
                             </div>
                           ) : (
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(claim.status)}`}>
                               {claim.status}
                             </span>
                           )}
                        </div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Simulator Form ───────────────────────────────────── */}
          <div className="card bg-gray-100 border-none mt-8">
             <h3 className="text-lg font-bold text-dark mb-2">Simulate Trigger</h3>
             <p className="text-sm text-gray-600 mb-6 max-w-sm">
                Execute a manual test of the parametric smart contract to verify ledger automation and immediate liquidity protocols.
             </p>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Event Source Data</label>
                   <select 
                      className="select-field bg-white"
                      value={triggerType}
                      onChange={e => setTriggerType(e.target.value)}
                   >
                     <option value="severe_weather">NOAA Heat Index &gt; 105°F</option>
                     <option value="aqi_spike">AQI &gt; 300 (Hazardous)</option>
                     <option value="traffic">Traffic Grids Complete Gridlock</option>
                     <option value="internet_outage">Local Outages (System Trigger)</option>
                   </select>
                </div>
                <button 
                   onClick={handleSimulate}
                   disabled={simulating}
                   className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
                >
                   {simulating ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />} 
                   {simulating ? 'Running...' : 'Run Simulation'}
                </button>
             </div>
          </div>
        </>
      )}

      {selectedClaim && (
        <PayoutModal 
          isOpen={isPayoutModalOpen}
          onClose={() => { setIsPayoutModalOpen(false); setSelectedClaim(null); }}
          claim={selectedClaim}
          onPayoutSuccess={load}
        />
      )}
    </div>
  );
}
