import { useState, useEffect } from 'react';
import {
  User, MapPin, Shield, FileText, CheckCircle2, Clock,
  TrendingUp, AlertCircle, Award, Phone
} from 'lucide-react';
import { fetchUserPolicies, fetchClaims } from '../lib/api';

const statusColor = {
  approved: 'text-green-600 bg-green-50 border-green-200',
  pending:  'text-amber-600 bg-amber-50  border-amber-200',
  rejected: 'text-red-600   bg-red-50   border-red-200',
};

const statusIcon = {
  approved: <CheckCircle2 size={14} className="text-green-500" />,
  pending:  <Clock       size={14} className="text-amber-500" />,
  rejected: <AlertCircle size={14} className="text-red-500" />,
};

export default function Profile({ user, onLogout }) {
  const [policies, setPolicies]   = useState([]);
  const [claims,   setClaims]     = useState([]);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      fetchUserPolicies(user.id),
      fetchClaims(user.id),
    ])
      .then(([p, c]) => { setPolicies(p); setClaims(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const formatDate = (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? '—' : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activePolicy   = policies.find(p => p.active_status);
  const totalPremium   = policies.reduce((s, p) => s + (p.weekly_premium || 0), 0);
  const totalPayout    = claims.filter(c => c.status === 'approved').reduce((s, c) => s + (c.loss_calculated || 0), 0);
  const pendingClaims  = claims.filter(c => c.status === 'pending').length;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account overview, policies, and claims history.</p>
      </div>

      {/* ── User Card ──────────────────────────────────────────────────── */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #A86B00, #D4920B)' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-gray-900 truncate">{user?.name}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            {user?.phone && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Phone size={12} /> {user.phone}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} /> {user?.city}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Award size={12} /> {user?.platform}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge badge-premium">PREMIUM MEMBER</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
              Risk Score: {user?.risk_profile_score?.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Policies', value: policies.filter(p => p.active_status).length, icon: Shield, color: 'text-amber-600' },
          { label: 'Weekly Premium', value: `₹${totalPremium.toFixed(0)}`, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Total Paid Out', value: `₹${totalPayout.toFixed(0)}`, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Pending Claims', value: pendingClaims, icon: Clock, color: 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex flex-col gap-2">
            <Icon size={20} className={color} />
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Policies Summary ───────────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <p className="section-label flex items-center gap-2"><Shield size={14} className="text-amber-600" /> Policies</p>
            <span className="text-xs text-gray-400">{policies.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />)}
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8">
              <Shield size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No policies yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map(policy => (
                <div key={policy.id}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Policy #{policy.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {policy.coverage_hours}h coverage · Since {formatDate(policy.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">₹{policy.weekly_premium?.toFixed(0)}<span className="text-xs text-gray-400 font-normal">/wk</span></p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${policy.active_status ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {policy.active_status ? <><CheckCircle2 size={10} /> ACTIVE</> : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Claims Summary ─────────────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <p className="section-label flex items-center gap-2"><FileText size={14} className="text-amber-600" /> Claims</p>
            <span className="text-xs text-gray-400">{claims.length} total</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-xl" />)}
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No claims yet. Stay covered!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map(claim => (
                <div key={claim.id}
                  className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="flex items-start gap-2">
                    {statusIcon[claim.status] || statusIcon.pending}
                    <div>
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {(claim.trigger_type || 'Disruption').replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(claim.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-extrabold text-gray-900">₹{claim.loss_calculated?.toFixed(0)}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize mt-1 ${statusColor[claim.status] || statusColor.pending}`}>
                      {claim.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Account Info ───────────────────────────────────────────────── */}
      <div className="card">
        <p className="section-label flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <User size={14} className="text-amber-600" /> Account Details
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Platform', value: user?.platform },
            { label: 'Base City', value: user?.city },
            { label: 'Avg Hours / Week', value: `${user?.avg_hours_per_week}h` },
            { label: 'Hourly Rate', value: `₹${user?.hourly_rate?.toFixed(0)}/hr` },
            { label: 'Risk Profile Score', value: user?.risk_profile_score?.toFixed(2) },
            { label: 'Member Since', value: user?.created_at ? formatDate(user.created_at) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
