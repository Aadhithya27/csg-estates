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

import { Building2, Lock, Mail, ShieldCheck, ArrowRight, Sparkles, Key, User as UserIcon, UserPlus, LogIn } from 'lucide-react';

// Login Screen
const LoginScreen: React.FC = () => {
  const { login, signup, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Welcome Back!', 'Signed into Property Manager', 'success');
    } else {
      showToast('Sign In Failed', res.message, 'error');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name Required', 'Please enter your full name', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showToast('Email Required', 'Please enter a valid email address', 'error');
      return;
    }
    if (password.length < 4) {
      showToast('Short Password', 'Password must be at least 4 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Password Mismatch', 'The passwords you entered do not match', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await signup(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Account Created!', `Welcome, ${name}! Your account is ready.`, 'success');
    } else {
      showToast('Sign Up Failed', res.message, 'error');
      if (res.message.includes('already exists')) {
        setAuthMode('signin');
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await resetPassword(resetEmail);
    showToast(res.success ? 'Email Sent' : 'Error', res.message, res.success ? 'info' : 'error');
    setIsForgotOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">C S G Estates</h1>
          <p className="text-xs text-slate-400">Rental Property Management — Owner & Manager ERP</p>
        </div>

        {/* Auth Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('signin')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* 1. Seamless Google Sign-In Integration */}
        <div className="space-y-2">
          <GoogleSignInButton onOpenSetup={() => setIsSetupOpen(true)} />
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
              {authMode === 'signin' ? 'Or with Email & Password' : 'Or Register with Email'}
            </span>
          </div>
        </div>

        {/* 2. Standard Email/Password Form (Sign In) */}
        {authMode === 'signin' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">Password *</label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] text-indigo-400 hover:underline font-semibold cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <span className="text-slate-400 text-[11px]">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer text-[11px]"
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* 3. Create Account Form (Sign Up) */
          <form onSubmit={handleSignup} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 chars"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              <span>Create Account & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <span className="text-slate-400 text-[11px]">Already registered? </span>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer text-[11px]"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Multi-User Account System • Secured Local ERP • Ready to Launch</span>
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
                placeholder="name@example.com"
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
