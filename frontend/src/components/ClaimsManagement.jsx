import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Loader2, RefreshCw, Zap, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchClaims, simulateTrigger } from '../lib/api';

const STATUS_CONFIG = {
  approved: { label: 'Approved', className: 'badge-green', icon: CheckCircle },
  rejected: { label: 'Rejected', className: 'badge-red', icon: XCircle },
  pending:  { label: 'Pending', className: 'badge-yellow', icon: Clock },
};

const TRIGGER_ICONS = {
  rain: '🌧️', heat: '🌡️', pollution: '💨', platform_down: '⚡', default: '🔔'
};

const ClaimCard = ({ claim }) => {
  const cfg = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className={`glass rounded-2xl p-5 transition-all duration-200 hover:border-white/20 ${claim.status === 'approved' ? 'border-emerald-500/20' : claim.status === 'rejected' ? 'border-rose-500/20' : 'border-amber-500/20'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl text-lg ${claim.status === 'approved' ? 'bg-emerald-500/15' : claim.status === 'rejected' ? 'bg-rose-500/15' : 'bg-amber-500/15'}`}>
            {TRIGGER_ICONS[claim.trigger_type] || TRIGGER_ICONS.default}
          </div>
          <div>
            <p className="font-semibold text-white text-sm capitalize">
              {(claim.trigger_type || 'Unknown').replace('_', ' ')} Disruption
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Claim #{claim.id} · {new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <span className={cfg.className}>
          <Icon size={10} />{cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Disruption</p>
          <p className="font-bold text-white">{claim.disruption_hours?.toFixed(1)}h</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Income Loss</p>
          <p className="font-bold text-rose-400">₹{claim.loss_calculated?.toFixed(0)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Fraud Score</p>
          <p className={`font-bold ${claim.fraud_confidence > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {((claim.fraud_confidence || 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {claim.payout && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs text-emerald-400 font-medium">✓ Payout Processed</span>
          <span className="text-emerald-400 font-bold">₹{claim.payout?.amount?.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
};

const ClaimsManagement = ({ userId }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simMsg, setSimMsg] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true); setError('');
      const data = await fetchClaims(userId);
      setClaims(data);
    } catch (err) {
      setError('Failed to load claims. Ensure the backend is running.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  const handleSimulate = async () => {
    setSimulating(true); setSimMsg('Running 15-minute engine cycle...');
    try {
      await simulateTrigger('Mumbai');
      setSimMsg('✓ Engine executed. New claims processed if thresholds were breached.');
      await load();
    } catch {
      setSimMsg('Backend offline — simulation skipped.');
    } finally { setSimulating(false); }
  };

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const totals = {
    approved: claims.filter(c => c.status === 'approved').length,
    pending:  claims.filter(c => c.status === 'pending').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    paidOut:  claims.filter(c => c.status === 'approved').reduce((s, c) => s + (c.loss_calculated || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Claims Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Zero-touch automated claims triggered by real-world disruptions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm"><RefreshCw size={14} />Refresh</button>
          <button onClick={handleSimulate} disabled={simulating} className="btn-primary flex items-center gap-2 text-sm">
            {simulating ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
            Simulate Trigger
          </button>
        </div>
      </div>

      {simMsg && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300 flex items-center gap-2">
          <Zap size={14} />{simMsg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Claims</p>
          <p className="text-3xl font-bold text-white">{claims.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Approved</p>
          <p className="text-3xl font-bold text-emerald-400">{totals.approved}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{totals.pending}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Paid Out</p>
          <p className="text-3xl font-bold text-blue-400">₹{totals.paidOut.toFixed(0)}</p>
        </div>
      </div>

      {/* How zero-touch works */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />Zero-Touch Claim Processing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Disruption Detected', desc: 'Rain > 15mm, AQI > 200, or platform downtime detected via APIs' },
            { step: '2', label: 'Trigger Created', desc: 'Celery engine logs a parametric trigger with severity score' },
            { step: '3', label: 'Claim Auto-Filed', desc: 'Claims filed for all active policyholders in affected zone' },
            { step: '4', label: 'Instant Payout', desc: 'Fraud check runs; approved claims paid to wallet in seconds' },
          ].map(s => (
            <div key={s.step} className="bg-white/5 rounded-xl p-3 flex gap-3">
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full h-6 w-6 flex items-center justify-center font-bold shrink-0">{s.step}</span>
              <div>
                <p className="text-xs font-semibold text-white">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'approved', 'pending', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Claims list */}
      {loading ? (
        <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-blue-400" size={28} /></div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm"><AlertCircle size={16} />{error}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 font-medium">No {filter !== 'all' ? filter : ''} claims yet</p>
          <p className="text-slate-500 text-sm mt-1">Use "Simulate Trigger" to generate test claims, or wait for real disruptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => <ClaimCard key={c.id} claim={c} />)}
        </div>
      )}
    </div>
  );
};

export default ClaimsManagement;
