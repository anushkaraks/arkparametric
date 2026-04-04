import React, { useState, useEffect } from 'react';
import { Shield, Plus, Power, PowerOff, Clock, TrendingUp, Loader2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { fetchUserPolicies, createPolicy, togglePolicy } from '../lib/api';

const PolicyCard = ({ policy, onToggle }) => {
  const [toggling, setToggling] = useState(false);
  const handleToggle = async () => {
    setToggling(true);
    await onToggle(policy.id);
    setToggling(false);
  };

  return (
    <div className={`glass rounded-2xl p-5 transition-all duration-200 hover:border-white/20 ${policy.active_status ? 'border-emerald-500/20' : 'border-white/5 opacity-70'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${policy.active_status ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'}`}>
            <Shield size={22} />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Income Protection #{policy.id}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(policy.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <span className={policy.active_status ? 'badge-green' : 'badge-gray'}>
          {policy.active_status ? '● Active' : '○ Paused'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Weekly Premium</p>
          <p className="font-bold text-blue-400 text-lg">₹{policy.weekly_premium?.toFixed(0)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Coverage Hours</p>
          <p className="font-bold text-white text-lg">{policy.coverage_hours}h</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Risk Score</p>
          <p className={`font-bold text-lg ${policy.risk_score > 2 ? 'text-rose-400' : policy.risk_score > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {policy.risk_score?.toFixed(2)}
          </p>
        </div>
      </div>

      <button onClick={handleToggle} disabled={toggling} className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${policy.active_status ? 'btn-danger' : 'btn-success'}`}>
        {toggling ? <Loader2 className="animate-spin" size={14} /> : policy.active_status ? <><PowerOff size={14} /> Pause Policy</> : <><Power size={14} /> Activate Policy</>}
      </button>
    </div>
  );
};

const NewPolicyModal = ({ userId, onCreated, onClose }) => {
  const [coverageHours, setCoverageHours] = useState(40);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true); setError('');
    try {
      await createPolicy({ user_id: userId, coverage_hours: coverageHours });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-1">New Policy</h3>
        <p className="text-slate-400 text-sm mb-6">Gemini AI will calculate your dynamic premium based on your profile and coverage hours.</p>

        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Coverage Hours/Week: <span className="text-blue-400">{coverageHours} hrs</span>
        </label>
        <div className="flex items-center gap-4 mb-2">
          <Clock size={16} className="text-slate-500 shrink-0" />
          <input type="range" min="10" max="80" step="5" value={coverageHours}
            onChange={e => setCoverageHours(Number(e.target.value))}
            className="w-full accent-blue-500" />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-6">
          <span>10 hrs</span><span>80 hrs</span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6 text-xs text-blue-300 flex items-start gap-2">
          <Zap size={14} className="mt-0.5 shrink-0" />
          <span>Your premium will be dynamically priced by Gemini AI based on your city, platform risk, and weather disruption patterns.</span>
        </div>

        {error && <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm mb-4"><AlertCircle size={14} />{error}</div>}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={14} />Calculating...</> : 'Create Policy'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PolicyManagement = ({ userId }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchUserPolicies(userId);
      setPolicies(data);
    } catch (err) {
      setError('Failed to load policies.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  const handleToggle = async (policyId) => {
    await togglePolicy(policyId);
    await load();
  };

  const totalPremium = policies.filter(p => p.active_status).reduce((s, p) => s + p.weekly_premium, 0);
  const activePolicies = policies.filter(p => p.active_status).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Policies</p>
          <p className="text-3xl font-bold text-white">{policies.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-bold text-emerald-400">{activePolicies}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Weekly Premium</p>
          <p className="text-3xl font-bold text-blue-400">₹{totalPremium.toFixed(0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Annual Cost Est.</p>
          <p className="text-3xl font-bold text-indigo-400">₹{(totalPremium * 52).toFixed(0)}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Your Policies</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your income protection coverage</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm"><RefreshCw size={14} />Refresh</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14} />New Policy</button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-blue-400" size={28} /></div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4"><AlertCircle size={16} />{error}</div>
      ) : policies.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Shield size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 font-medium">No policies yet</p>
          <p className="text-slate-500 text-sm mt-1">Create your first income protection policy to get started.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-6 inline-flex items-center gap-2 text-sm"><Plus size={14} />Create First Policy</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map(p => <PolicyCard key={p.id} policy={p} onToggle={handleToggle} />)}
        </div>
      )}

      {showModal && <NewPolicyModal userId={userId} onCreated={() => { setShowModal(false); load(); }} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default PolicyManagement;
