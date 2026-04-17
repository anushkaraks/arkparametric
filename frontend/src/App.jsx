import { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, FileText, Headphones, Activity, User, Menu, X, LogOut } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Policies from './components/Policies';
import Claims from './components/Claims';
import Support from './components/Support';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import { getToken, clearToken } from './lib/api';

const SIDEBAR_ITEMS = [
  { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { id: 'policies',  label: 'Policy',          icon: Shield },
  { id: 'analytics', label: 'Risk Analysis',   icon: Activity },
  { id: 'claims',    label: 'Claims',          icon: FileText },
  { id: 'support',   label: 'Support',         icon: Headphones },
  { id: 'admin',     label: 'Insurer Portal',   icon: LayoutDashboard }, // Phase 3 Admin View
  { id: 'profile',   label: 'Profile',         icon: User },
];

const MOBILE_TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'policies', label: 'Policy',  icon: Shield },
  { id: 'claims',   label: 'Claims',    icon: FileText },
  { id: 'profile',  label: 'Profile',   icon: User },
];

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ark_user');
    if (stored && getToken()) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ark_user', JSON.stringify(userData));
    setActiveTab('overview');
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('ark_user');
    setUser(null);
  };

  const renderContent = () => {
    if (!user) {
      return <Auth onLogin={handleLogin} />;
    }
    switch (activeTab) {
      case 'overview':  return <Dashboard user={user} />;
      case 'policies':  return <Policies user={user} />;
      case 'claims':    return <Claims user={user} />;
      case 'support':   return <Support />;
      case 'analytics': return <Dashboard user={user} />;
      case 'admin':     return <AdminDashboard />;
      case 'profile':   return <Profile user={user} onLogout={handleLogout} />;
      default:          return <Dashboard user={user} />;
    }
  };

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          {renderContent()}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex bg-[#FAFAF8]">
        
        {/* ── Desktop Sidebar ────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
          <div className="p-6 flex items-center gap-2 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-600">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-gray-900 tracking-tight">Ark Parametric</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Workspace</div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id 
                    ? 'bg-amber-50 text-amber-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={activeTab === id ? 'text-amber-600' : 'text-gray-400'} />
                {label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={18} className="text-gray-400" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
          
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50 h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-600">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-sm font-extrabold text-gray-900">Ark Parametric</span>
            </div>
            <button onClick={() => setMobileMenuOpen(o => !o)} className="p-2 text-gray-600">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </header>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-b border-gray-200 bg-white px-4 py-3 flex flex-col gap-1 z-40 fixed top-14 left-0 right-0 shadow-lg">
              {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
                <button 
                  key={id} 
                  onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 text-left py-2.5 px-3 rounded-xl text-sm font-semibold ${
                    activeTab === id ? 'bg-amber-50 text-amber-700' : 'text-gray-600'
                  }`}
                >
                  <Icon size={18} className={activeTab === id ? 'text-amber-600' : 'text-gray-400'} />
                  {label}
                </button>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-red-600">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </div>
          </main>
          
          {/* Mobile Bottom Nav */}
          <div className="bottom-nav md:hidden border-t border-gray-200 bg-white pb-safe">
            {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`bottom-nav-item ${activeTab === id ? 'active text-amber-600' : 'text-gray-400'}`}>
                <Icon size={20} className="mb-1" />
                <span className="text-[10px] font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}

export default App;
