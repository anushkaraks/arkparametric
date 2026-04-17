import { useState } from 'react';
import { Home, LayoutDashboard, ShieldAlert, FileText, HeadphonesIcon, User, ChevronLeft } from 'lucide-react';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'policy', label: 'Policy', icon: ShieldAlert },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
    { id: 'claims', label: 'Claims', icon: FileText },
    { id: 'support', label: 'Support', icon: HeadphonesIcon },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  if (!user) {
    return <Landing onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-[var(--text-main)] rounded-full"></span>
            <span className="block w-4 h-0.5 bg-[var(--text-main)] rounded-full"></span>
            <span className="block w-5 h-0.5 bg-[var(--text-main)] rounded-full"></span>
          </div>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-[var(--primary)] tracking-[0.2em] uppercase">Sentinel</span>
          <span className="text-sm font-bold tracking-tight">Gig Worker</span>
        </div>

        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--primary-bg)]">
          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=D4920B&color=fff`} alt="avatar" />
        </button>
      </header>

      {/* Side Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="w-[80%] max-w-sm bg-white h-full relative z-10 flex flex-col animate-in slide-in-from-left">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-gray-50">
               <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{user.platform}</p>
               </div>
               <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border)] hover:bg-gray-50">
                  <ChevronLeft size={18} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2">Dashboard Menu</p>
              {TABS.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:bg-gray-50 hover:text-[var(--text-main)]'}`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? "text-[var(--primary)]" : ""} />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-[var(--border)]">
               <button 
                  onClick={() => setUser(null)}
                  className="w-full btn btn-secondary text-red-500 border-red-100 hover:bg-red-50"
               >
                 Log out
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        {activeTab === 'home' && <Dashboard user={user} setTab={setActiveTab} />}
        {activeTab === 'overview' && <Dashboard user={user} setTab={setActiveTab} />}
        {/* We will build the other components based on the plan */}
        {activeTab === 'policy' && <div className="p-6 text-center text-gray-500 pt-20">Policy view coming soon</div>}
        {activeTab === 'risk' && <div className="p-6 text-center text-gray-500 pt-20">Risk Analysis coming soon</div>}
        {activeTab === 'claims' && <div className="p-6 text-center text-gray-500 pt-20">Claims view coming soon</div>}
        {activeTab === 'support' && <div className="p-6 text-center text-gray-500 pt-20">Support view coming soon</div>}
        {activeTab === 'profile' && <div className="p-6 text-center text-gray-500 pt-20">Profile view coming soon</div>}
      </main>

      {/* Bottom Navigation for Mobile App Feel */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-[var(--border)] px-6 py-3 flex justify-between items-center z-40 pb-safe">
        {[
          { id: 'overview', icon: Home, label: 'Home' },
          { id: 'policy', icon: ShieldAlert, label: 'Policy' },
          { id: 'claims', icon: FileText, label: 'Claims' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${activeTab === item.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <div className={`p-1.5 rounded-full ${activeTab === item.id ? 'bg-[var(--primary-bg)]' : 'bg-transparent'}`}>
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

export default App;
