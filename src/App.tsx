import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider, useToast } from './context/ToastContext';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { SettingsModal } from './components/layout/SettingsModal';

import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PropertiesList } from './components/properties/PropertiesList';
import { BillsList } from './components/bills/BillsList';
import { ExpensesList } from './components/expenses/ExpensesList';
import { QuickActionModal } from './components/dashboard/QuickActionModal';

import {
  Building2,
  Lock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Wifi,
  Delete,
  CheckCircle2,
} from 'lucide-react';
import { useData } from './context/DataContext';

// Family Passkey Lock Screen
const LoginScreen: React.FC = () => {
  const { loginWithPasskey } = useAuth();
  const { syncNow, refreshData, isServerSynced } = useData();
  const { showToast } = useToast();

  const [enteredPasskey, setEnteredPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async (keyToTest?: string) => {
    const key = (keyToTest || enteredPasskey).trim();
    if (!key) {
      showToast('Passkey Required', 'Please enter your 10-digit passkey', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithPasskey(key, 'Owner');

    if (res.success) {
      showToast('Welcome!', 'C S G Estates Unlocked', 'success');
      await syncNow();
      refreshData();
    } else {
      showToast('Access Denied', res.message, 'error');
    }
    setIsSubmitting(false);
  };

  const handleKeypadPress = (digit: string) => {
    if (digit === 'DEL') {
      setEnteredPasskey((prev) => prev.slice(0, -1));
    } else if (digit === 'CLR') {
      setEnteredPasskey('');
    } else {
      if (enteredPasskey.length < 15) {
        setEnteredPasskey((prev) => prev + digit);
      }
    }
  };

  const mobileUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5173/`
    : 'http://192.168.29.111:5173/';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">C S G Estates</h1>
          <p className="text-xs text-slate-400 font-medium">Rental Property Management — Secured Entrance</p>
        </div>

        {/* Live Network Sync Badge */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-300">Central Sync Server Active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Mobile & PC Shared</span>
        </div>

        {/* Passkey Input Box */}
        <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enter Passkey (PIN)</span>
              </label>
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPasskey ? 'text' : 'password'}
                value={enteredPasskey}
                onChange={(e) => setEnteredPasskey(e.target.value)}
                placeholder="••••••••••"
                autoFocus
                className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-base tracking-widest text-center"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* On-Screen Mobile Touch Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-3 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                  btn === 'DEL' || btn === 'CLR'
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-100 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {btn === 'DEL' ? <Delete className="w-4 h-4" /> : btn}
              </button>
            ))}
          </div>

          {/* Unlock Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 text-sm mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Unlock Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Phone & PC Sync Assurance */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-800/80 space-y-1">
          <p className="flex items-center justify-center space-x-1.5 text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phone URL: <code className="text-emerald-400 select-all font-mono">{mobileUrl}</code></span>
          </p>
          <p className="text-[10px] text-slate-500">
            Enter your 10-digit passkey to unlock on mobile or desktop.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Layout
const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState('BILL');

  const { isSettingsOpen, setIsSettingsOpen } = useAuth();

  const openQuickAction = (actionType: string) => {
    setQuickActionType(actionType);
    setQuickActionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Main Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onOpenQuickAction={openQuickAction}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 px-4 sm:px-6 max-w-7xl mx-auto w-full ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {activeTab === 'dashboard' && (
          <DashboardOverview setActiveTab={setActiveTab} onOpenQuickAction={openQuickAction} />
        )}

        {activeTab === 'properties' && (
          <PropertiesList setActiveTab={setActiveTab} onOpenQuickAction={openQuickAction} />
        )}

        {activeTab === 'bills' && <BillsList onOpenQuickAction={openQuickAction} />}

        {activeTab === 'expenses' && <ExpensesList onOpenQuickAction={openQuickAction} />}
      </main>

      {/* Mobile Bottom Navigation & Floating Launcher (+) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickAction={openQuickAction}
      />

      {/* Quick Action Launcher Modal */}
      <QuickActionModal
        isOpen={quickActionModalOpen}
        onClose={() => setQuickActionModalOpen(false)}
        actionType={quickActionType}
      />

      {/* Global Settings & Launch Center Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

// Root App Component
export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainDashboard /> : <LoginScreen />;
};

export default App;
