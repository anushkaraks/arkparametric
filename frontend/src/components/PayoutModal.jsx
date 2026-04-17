import { useState } from 'react';
import { X, CreditCard, Landmark, ArrowRight, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import { initiatePayout } from '../lib/api';

export default function PayoutModal({ claim, isOpen, onClose, onPayoutSuccess }) {
  const [step, setStep] = useState('method'); // 'method' | 'processing' | 'success'
  const [method, setMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  if (!isOpen) return null;

  const handlePayout = async (selectedMethod) => {
    setMethod(selectedMethod);
    setStep('processing');
    setLoading(true);
    setError(null);
    try {
      const res = await initiatePayout(claim.id, selectedMethod);
      setTransactionId(res.transaction_id);
      setTimeout(() => {
        setLoading(false);
        setStep('success');
      }, 2000); // UI delay for feel
    } catch (err) {
      setError(err.message || 'Payout failed. Please try again.');
      setStep('method');
      setLoading(false);
    }
  };

  const methods = [
    { id: 'UPI', label: 'UPI / PhonePe / GPay', icon: Smartphone, color: 'text-purple-600 bg-purple-50' },
    { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
    { id: 'BANK', label: 'Direct Bank Transfer', icon: Landmark, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Instant Payout</h3>
            <p className="text-xs text-gray-500 font-medium">Claim ID: #ARK-{claim.id}</p>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-8">
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-2">Amount to Receive</p>
                <h2 className="text-5xl font-black text-gray-900">₹{claim.loss_calculated?.toFixed(2)}</h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">Automatic parametric settlement</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Payout Method</p>
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handlePayout(m.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:border-amber-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.color}`}>
                        <m.icon size={24} />
                      </div>
                      <span className="font-bold text-gray-700">{m.label}</span>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              
              {error && <p className="text-xs text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-amber-100 border-t-amber-600 animate-spin mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw size={32} className="text-amber-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
                <p className="text-sm text-gray-500 mt-2">Communicating with {method} gateway protocols...</p>
              </div>
              <div className="max-w-[200px] mx-auto h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600 animate-progress" />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600 shadow-lg shadow-green-100">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Payout Dispatched!</h3>
                <p className="text-sm text-gray-500 mt-2">The funds have been instantly credited to your {method} account.</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Transaction ID</span>
                  <span className="text-gray-900 font-mono font-bold tracking-tight">{transactionId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Amount</span>
                  <span className="text-gray-900 font-bold">₹{claim.loss_calculated?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400 font-bold uppercase">Status</span>
                  <span className="text-green-600 font-bold uppercase tracking-wider">Completed</span>
                </div>
              </div>

              <button
                onClick={() => { onPayoutSuccess(); onClose(); }}
                className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
              >
                Return to Claims
              </button>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            Secure Payout Protocol • Powered by Ark Parametric
          </p>
        </div>
      </div>
    </div>
  );
}
