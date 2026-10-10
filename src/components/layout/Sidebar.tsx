import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  FileSpreadsheet,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const { user, logout, setIsSettingsOpen } = useAuth();
  const { bills } = useData();

  const overdueCount = bills.filter((b) => b.status === 'Overdue').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'properties', label: 'Properties & Homes', icon: Building2 },
    { id: 'bills', label: 'Billing & Payments', icon: Receipt, badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'expenses', label: 'Expenses', icon: FileSpreadsheet },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-500/25 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="text-base font-bold text-white tracking-wide truncate">C S G Estates</h1>
              <p className="text-[10px] uppercase font-semibold text-indigo-400">Property Manager</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className={`w-5 h-5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Nav links */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {!collapsed && 'MAIN NAVIGATION'}
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
            )}
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Owner'}</p>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user?.provider === 'google' ? 'Google Auth' : 'Owner Control'}</span>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Settings & Cloud Backup"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
