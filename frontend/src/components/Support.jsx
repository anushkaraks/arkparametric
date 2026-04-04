import { MessageSquare, Mail, Plus } from 'lucide-react';

export default function Support() {
  const faqs = [
    "How is a parametric payout triggered?",
    "What data sources does Ark use?",
    "Can I adjust my trigger threshold mid-term?",
    "When are funds deposited after a trigger event?"
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-extrabold text-dark tracking-tight">Help & Support</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">Clear answers and instant assistance for your parametric coverage.</p>
      </div>

      {/* ── Contact Channels ───────────────────────────────────── */}
      <div className="space-y-4">
         {/* Live Chat */}
         <div className="card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
               <MessageSquare size={24} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-dark">Live Chat</h2>
               <p className="text-sm text-gray-500 mt-1">Speak with a specialist immediately. Average wait time: 2 mins.</p>
            </div>
            <button className="btn-primary w-full max-w-[200px] text-sm py-2">
               Start Conversation &rarr;
            </button>
         </div>

         {/* Email Support */}
         <div className="card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-600">
               <Mail size={24} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-dark">Email Support</h2>
               <p className="text-sm text-gray-500 mt-1">For detailed inquiries. We respond within 24 hours.</p>
            </div>
            <button className="w-full max-w-[200px] bg-indigo-100 text-indigo-900 font-semibold text-sm py-2 px-4 rounded-xl hover:bg-indigo-200 transition-colors">
               Send Ticket @
            </button>
         </div>
      </div>

      {/* ── FAQ Section ────────────────────────────────────────── */}
      <div className="pt-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-dark uppercase tracking-widest">Frequently Asked Questions</h2>
            <button className="text-[10px] font-bold text-amber-700 hover:text-amber-800 uppercase text-right tracking-wider">
               View All<br/>FAQ
            </button>
         </div>

         <div className="space-y-3">
            {faqs.map((q, i) => (
               <div key={i} className="bg-gray-50 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100">
                  <p className="font-semibold text-dark text-sm pr-4">{q}</p>
                  <Plus size={18} className="text-gray-400 shrink-0" />
               </div>
            ))}
         </div>
      </div>

      {/* ── System Status ──────────────────────────────────────── */}
      <div className="pt-6 pb-10">
         <div className="status-bar">
            <h2 className="text-base font-bold text-white mb-2">System Status</h2>
            <p className="text-xs text-gray-400 mb-6 max-w-xs">
               Parametric monitoring systems are 100% operational.
            </p>
            
            <div className="progress-bar h-1.5 mb-2 bg-gray-700">
               <div className="progress-bar-fill w-full bg-amber-500"></div>
            </div>
            
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-gray-500">
               <span>Active Monitoring</span>
               <span>No Outages</span>
            </div>
         </div>
      </div>

    </div>
  );
}
