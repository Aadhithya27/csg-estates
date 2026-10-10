import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DatabaseService } from '../../services/database';
import { AppSettings } from '../../types';
import {
  Settings,
  ShieldCheck,
  Key,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  Building2,
  DollarSign,
  Phone,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'google' | 'estate' | 'database' | 'checklist';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'google',
}) => {
  const { user, googleClientId, setGoogleClientId, isGoogleConfigured } = useAuth();
  const { refreshData } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'google' | 'estate' | 'database' | 'checklist'>(defaultTab);

  // Google OAuth state
  const [clientIdInput, setClientIdInput] = useState(googleClientId || '');
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  // Estate Settings state
  const [settings, setSettings] = useState<AppSettings>(() => DatabaseService.getSettings());

  // Restore file state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClientIdInput(googleClientId || '');
      setSettings(DatabaseService.getSettings());
      setActiveTab(defaultTab);
    }
  }, [isOpen, googleClientId, defaultTab]);

  const handleSaveGoogleClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleClientId(clientIdInput.trim());
    showToast(
      clientIdInput.trim() ? 'Google Client ID Saved' : 'Client ID Cleared',
      clientIdInput.trim() ? 'Google Identity Services will use this Client ID' : 'Switched to fallback mode',
      'success'
    );
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

  const copyOriginToClipboard = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedOrigin(true);
    showToast('Copied to clipboard', currentOrigin, 'info');
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleSaveEstateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DatabaseService.saveSettings(settings);
    showToast('Settings Saved', 'Business branding updated successfully', 'success');
  };

  const handleExportBackup = () => {
    const json = DatabaseService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csg-estates-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup Exported', 'Full database JSON downloaded to your device', 'success');
  };

  const handleImportBackup = () => {
    if (!importFile) {
      showToast('No file selected', 'Please choose a JSON backup file to restore', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = DatabaseService.importAllData(content);
      if (res.success) {
        refreshData();
        showToast('Database Restored', res.message, 'success');
        setImportFile(null);
      } else {
        showToast('Restore Failed', res.message, 'error');
      }
    };
    reader.readAsText(importFile);
  };

  const handleResetToDefaults = () => {
    DatabaseService.resetDatabaseToDefaults();
    refreshData();
    setIsConfirmResetOpen(false);
    showToast('Database Reset', 'Reset to initial sample estates and tenants', 'info');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Settings & Launch Center" maxWidth="2xl">
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2.5 px-4 font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'google'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Google Authentication</span>
          </button>

          <button
            onClick={() => setActiveTab('estate')}
            className={`py-2.5 px-4 font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'estate'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Branding & Currency</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-2.5 px-4 font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'database'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup & Restore</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-2.5 px-4 font-bold border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              activeTab === 'checklist'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Checklist</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE AUTH */}
        {activeTab === 'google' && (
          <div className="space-y-5 text-xs">
            {/* Status Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isGoogleConfigured
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {isGoogleConfigured ? 'Google OAuth 2.0 Configured' : 'Google Identity Ready'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isGoogleConfigured
                      ? 'Using your custom Google Cloud Web Client ID'
                      : 'Using built-in Google Auth helper. Configure your own Client ID below.'}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isGoogleConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {isGoogleConfigured ? 'Live Production' : 'Ready / Hybrid'}
              </span>
            </div>

            {/* Client ID Form */}
            <form onSubmit={handleSaveGoogleClientId} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Google OAuth Client ID (Web Application)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="e.g. 1234567890-abcdefg1234567.apps.googleusercontent.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can also specify this in your environment as <code className="text-indigo-400">VITE_GOOGLE_CLIENT_ID</code>.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow cursor-pointer"
                >
                  Save Client ID
                </button>
                {clientIdInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setClientIdInput('');
                      setGoogleClientId('');
                      showToast('Client ID Cleared', 'Reset to default mode', 'info');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Quick Setup Instructions */}
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-3">
              <h5 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>How to get your Google Client ID (2 Minutes)</span>
              </h5>

              <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-400">
                <li>
                  Open{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:underline inline-flex items-center space-x-0.5"
                  >
                    <span>Google Cloud Console Credentials</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                </li>
                <li>Click <strong>Create Credentials</strong> &rarr; <strong>OAuth client ID</strong>.</li>
                <li>Select Application type: <strong>Web application</strong>.</li>
                <li>
                  Under <strong>Authorized JavaScript origins</strong>, add your website address:
                  <div className="mt-1 flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono text-[10px] text-slate-200">
                    <span className="truncate flex-1">{currentOrigin}</span>
                    <button
                      type="button"
                      onClick={copyOriginToClipboard}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded flex items-center space-x-1 shrink-0"
                    >
                      {copiedOrigin ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOrigin ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </li>
                <li>Copy the generated <strong>Client ID</strong> and paste it into the box above!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING & CURRENCY */}
        {activeTab === 'estate' && (
          <form onSubmit={handleSaveEstateSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estate / Business Name</label>
              <input
                type="text"
                value={settings.estateName}
                onChange={(e) => setSettings({ ...settings, estateName: e.target.value })}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Owner Contact Phone</label>
                <input
                  type="text"
                  value={settings.ownerContactPhone}
                  onChange={(e) => setSettings({ ...settings, ownerContactPhone: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Currency Symbol</label>
                <select
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="₹">₹ (INR - Indian Rupee)</option>
                  <option value="$">$ (USD - US Dollar)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - British Pound)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                  <option value="RM">RM (Malaysian Ringgit)</option>
                  <option value="S$">S$ (Singapore Dollar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Invoice Notes / Terms</label>
              <textarea
                value={settings.invoiceNote}
                onChange={(e) => setSettings({ ...settings, invoiceNote: e.target.value })}
                rows={3}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Save Branding
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: BACKUP & RESTORE */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Export Database Backup</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Download a full JSON snapshot of all your properties, rental homes, bills, and payments.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 shrink-0 transition-all shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Restore Database */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div>
                <h4 className="font-bold text-white flex items-center space-x-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restore from Backup</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Restore previously exported JSON backup file into this device.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleImportBackup}
                  disabled={!importFile}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shrink-0 transition-all shadow"
                >
                  Restore File
                </button>
              </div>
            </div>

            {/* Reset Defaults */}
            <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Factory Reset Sample Data</span>
                </h4>
                <p className="text-[11px] text-rose-400/80 mt-0.5">
                  Reset the database back to initial sample properties and demo records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmResetOpen(true)}
                className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl font-bold shrink-0 transition-all text-xs"
              >
                Reset Data
              </button>
            </div>

            {/* Confirm Dialog */}
            {isConfirmResetOpen && (
              <div className="p-4 bg-slate-900 border border-rose-500/50 rounded-2xl space-y-3">
                <p className="text-white font-bold">Are you sure you want to reset to demo data?</p>
                <p className="text-slate-400 text-[11px]">
                  This will overwrite local records with default demonstration properties.
                </p>
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmResetOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAUNCH CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <h4 className="font-bold text-indigo-300">Production Launch Status: Ready</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                All core ERP systems, invoice printing engines, and security modules are initialized.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { title: 'Google Identity Services 2.0', desc: 'Secure Google Sign-In with OAuth token validation & fallback simulation', ok: true },
                { title: 'Properties & Rental Units', desc: 'Full multi-property, room/flat occupancy, and rent tracking', ok: true },
                { title: 'Automated Billing & Arrears', desc: 'One-click monthly bill batch generation and arrears carry-forward', ok: true },
                { title: 'PDF Invoice & Thermal Slip', desc: 'Clean vector PDF download and 80mm thermal receipt print layout', ok: true },
                { title: 'WhatsApp Direct Dispatch', desc: 'Pre-formatted Tamil/English billing messages with one-click send', ok: true },
                { title: 'Data Persistence & Backup', desc: 'Instant JSON backup export and restore to ensure data zero-loss', ok: true },
                { title: 'SEO & Mobile Responsive', desc: 'Tailored metadata, OpenGraph tags, modern viewport, and touch UI', ok: true },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-100">{item.title}</h5>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
