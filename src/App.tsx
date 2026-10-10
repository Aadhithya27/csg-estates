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
import { GoogleSignInButton } from './components/auth/GoogleSignInButton';

import { Building2, Lock, Mail, ShieldCheck, ArrowRight, Sparkles, Key } from 'lucide-react';

// Login Screen
const LoginScreen: React.FC = () => {
  const { login, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('owner@csgestates.com');
  const [password, setPassword] = useState('admin123');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      showToast('Welcome back, Owner!', 'Signed into Property Manager', 'success');
    } else {
      showToast('Invalid login', 'Password must be at least 4 characters', 'error');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await resetPassword(resetEmail);
    showToast(res.success ? 'Email Sent' : 'Error', res.message, res.success ? 'info' : 'error');
    setIsForgotOpen(false);
  };

  const handleLoadDemoCreds = () => {
    setEmail('owner@csgestates.com');
    setPassword('admin123');
    showToast('Demo Credentials Loaded', 'owner@csgestates.com / admin123', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">C S G Estates</h1>
          <p className="text-xs text-slate-400">Rental Property Management — Owner & Manager ERP</p>
        </div>

        {/* 1. Official Google Sign-In Integration */}
        <div className="space-y-2">
          <GoogleSignInButton onOpenSetup={() => setIsSetupOpen(true)} />
        </div>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
              Or with Owner Password
            </span>
          </div>
        </div>

        {/* 2. Standard Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Owner Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@csgestates.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">Password *</label>
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-[11px] text-indigo-400 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleLoadDemoCreds}
              className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Fill Demo Credentials</span>
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Owner Access • Mobile First ERP • Launch Ready</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-sm font-bold text-white">Reset Password</h3>
            <p className="text-slate-400 text-[11px]">
              Enter your registered email to receive reset instructions.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="owner@csgestates.com"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup / Google OAuth Modal */}
      <SettingsModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        defaultTab="google"
      />
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
