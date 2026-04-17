import { useState } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, Cloud } from 'lucide-react';
import { fetchFraudAnalysis } from '../lib/api';

export default function FraudBadge({ claimId, initialConfidence = 0 }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getStatus = (conf) => {
    if (conf < 0.3) return { label: 'Low Risk', color: 'text-green-600 bg-green-50 border-green-200', icon: Shield };
    if (conf < 0.7) return { label: 'Medium Risk', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertTriangle };
    return { label: 'High Risk', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle };
  };

  const status = getStatus(analysis ? analysis.fraud_confidence : initialConfidence);
  const Icon = status.icon;

  const handleFetch = async () => {
    if (analysis || loading) {
      setShowDetails(!showDetails);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFraudAnalysis(claimId);
      setAnalysis(data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={handleFetch}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all hover:brightness-95 ${status.color}`}
      >
        <Icon size={12} />
        {status.label}
        {loading && <div className="w-2 h-2 rounded-full bg-current animate-pulse ml-1" />}
      </button>

      {showDetails && analysis && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
            <h4 className="text-xs font-bold text-gray-900">Fraud Analysis</h4>
            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
              <Info size={12} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${analysis.gps_spoofing_flag ? 'text-red-500' : 'text-green-500'}`}>
                <Shield size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900">GPS Authenticity</p>
                <p className="text-[9px] text-gray-500 leading-tight">
                  {analysis.gps_spoofing_flag ? 'Irregular jump detected in worker telemetry.' : 'Verified location within trigger zone.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${!analysis.weather_authenticity ? 'text-red-500' : 'text-green-500'}`}>
                <Cloud size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900">Weather Cross-Check</p>
                <p className="text-[9px] text-gray-500 leading-tight">
                  {analysis.weather_authenticity ? 'Authentic disruption verified by local sensors.' : 'Discrepancy in historical satellite data.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-500">
                <AlertCircle size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900">Behavioral Pattern</p>
                <p className="text-[9px] text-gray-500 leading-tight">
                  {analysis.behavioral_pattern}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-gray-400 uppercase">Fraud Score</span>
              <span className={`font-extrabold ${(analysis.fraud_confidence * 100) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                {(analysis.fraud_confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${analysis.fraud_confidence > 0.7 ? 'bg-red-500' : analysis.fraud_confidence > 0.3 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${analysis.fraud_confidence * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
