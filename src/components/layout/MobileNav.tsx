import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  FileSpreadsheet,
  Plus,
  Home,
  X,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
}) => {
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <>
      {/* FLOATING ACTION BUTTON (FAB "+") */}
      <div className="fixed bottom-20 right-5 z-40 md:hidden">
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 transition-transform active:scale-90 ${
            isFabOpen ? 'rotate-45 bg-rose-600' : ''
          }`}
          aria-label="Quick Actions"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* FAB Quick Action Sheet */}
        {isFabOpen && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex flex-col justify-end p-4 animate-in fade-in duration-150"
            onClick={() => setIsFabOpen(false)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl animate-in slide-in-from-bottom-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Quick Entry Launcher</h3>
                <button onClick={() => setIsFabOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => {
                    setIsFabOpen(false);
                    onOpenQuickAction('BILL');
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1.5 hover:border-indigo-500/50 active:scale-95 transition-all text-center"
                >
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-100">Create Bill</span>
                </button>

                <button
                  onClick={() => {
                    setIsFabOpen(false);
                    onOpenQuickAction('EXPENSE');
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1.5 hover:border-rose-500/50 active:scale-95 transition-all text-center"
                >
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-100">Add Expense</span>
                </button>

                <button
                  onClick={() => {
                    setIsFabOpen(false);
                    onOpenQuickAction('HOME');
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1.5 hover:border-sky-500/50 active:scale-95 transition-all text-center"
                >
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-100">Add Rental Home</span>
                </button>

                <button
                  onClick={() => {
                    setIsFabOpen(false);
                    onOpenQuickAction('PROPERTY');
                  }}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1.5 hover:border-purple-500/50 active:scale-95 transition-all text-center"
                >
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-100">Add Property</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden flex items-center justify-around px-2 py-2 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'properties' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-1">Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'bills' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1">Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center py-1 px-4 rounded-xl transition-all ${
            activeTab === 'expenses' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px] mt-1">Expenses</span>
        </button>
      </nav>
    </>
  );
};
