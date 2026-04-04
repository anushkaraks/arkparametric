import { useState } from 'react';
import { CloudLightning, LayoutDashboard, Shield, Calculator, FileText, LogOut, Menu, X } from 'lucide-react';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import PolicyManagement from './components/PolicyManagement';
import PremiumCalculator from './components/PremiumCalculator';
import ClaimsManagement from './components/ClaimsManagement';

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Overview',   icon: LayoutDashboard },
  { id: 'policies',   label: 'Policies',   icon: Shield },
  { id: 'calculator', label: 'Calculator', icon: Calculator },
  { id: 'claims',     label: 'Claims',     icon: FileText },
];

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Still in registration flow
  if (!user) {
    return <Registration onRegistered={(u) => { setUser(u); setActiveTab('dashboard'); }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':   return <Dashboard user={user} />;
      case 'policies':    return <PolicyManagement userId={user.id} />;
      case 'calculator':  return <PremiumCalculator />;
      case 'claims':      return <ClaimsManagement userId={user.id} />;
      default:            return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      {/* ── Top navbar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
              <CloudLightning size={22} />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Ark</span>
              <span className="ml-2 text-xs text-blue-400/80 font-medium uppercase tracking-wider hidden sm:inline">Income Stabilization</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>

          {/* Right: user + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-slate-300 hidden md:block">{user.name}</span>
            </div>
            <button onClick={() => setUser(null)} title="Sign out"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
              <LogOut size={16} />
            </button>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileNavOpen(o => !o)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-white/5 transition-all">
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/80 px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setActiveTab(id); setMobileNavOpen(false); }}
                className={`nav-tab justify-start ${activeTab === id ? 'active' : ''}`}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {renderContent()}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-600">
        Ark Income Stabilization Engine · Powered by Gemini AI · Parametric Insurance Platform
      </footer>
    </div>
  );
}

export default App;
