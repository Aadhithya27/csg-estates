import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Building2,
  Calendar,
  Home,
  FileText,
  DollarSign,
  X,
  Settings,
  LogOut,
  ShieldCheck,
  Key,
  Wifi,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onOpenQuickAction: (actionType: string) => void;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  onOpenQuickAction,
  setActiveTab,
}) => {
  const {
    properties,
    homes,
    bills,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedMonth,
    setSelectedMonth,
    syncNow,
    isServerSynced,
  } = useData();

  const { user, logout, setIsSettingsOpen } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Global search filtering
  const filteredProperties = searchQuery
    ? properties.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredHomes = searchQuery
    ? homes.filter(
        (h) =>
          h.houseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.tenantPhone.includes(searchQuery)
      )
    : [];

  const filteredBills = searchQuery
    ? bills.filter((b) => b.id.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasSearchHits =
    filteredProperties.length > 0 || filteredHomes.length > 0 || filteredBills.length > 0;

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setIsQuickMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 md:left-64 z-30 h-16 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 transition-all duration-300 flex items-center justify-between px-3 sm:px-6 ${
        sidebarCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      {/* Search Input */}
      <div className="flex items-center space-x-2 flex-1 max-w-md mr-2" ref={searchRef}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold md:hidden shrink-0">
          <Building2 className="w-4 h-4" />
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search property, home, tenant, bill..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() !== '' && (
          <div className="absolute top-12 left-0 right-0 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 max-h-80 overflow-y-auto custom-scrollbar space-y-3">
            {!hasSearchHits ? (
              <div className="p-4 text-center text-slate-400 text-xs">No records found for "{searchQuery}"</div>
            ) : (
              <>
                {filteredProperties.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Properties</p>
                    {filteredProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab('properties');
                          setIsSearchOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex justify-between text-xs text-slate-200"
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-slate-400">{p.city}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredHomes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Rental Homes</p>
                    {filteredHomes.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          setActiveTab('properties');
                          setIsSearchOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex justify-between text-xs text-slate-200"
                      >
                        <span className="font-semibold">{h.houseNumber} ({h.tenantName})</span>
                        <span className="text-emerald-400">₹{h.monthlyRent.toLocaleString('en-IN')}/mo</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredBills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-1">Bills</p>
                    {filteredBills.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setActiveTab('bills');
                          setIsSearchOpen(false);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex justify-between text-xs text-slate-200"
                      >
                        <span className="font-semibold">{b.id}</span>
                        <span className="text-indigo-400">₹{b.totalAmount.toLocaleString('en-IN')} ({b.status})</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Desktop Property Selector */}
        <div className="hidden lg:flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 space-x-1.5">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Quick Action Button */}
        <div className="hidden md:block relative" ref={quickRef}>
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Action</span>
          </button>

          {isQuickMenuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
              <button
                onClick={() => {
                  onOpenQuickAction('BILL');
                  setIsQuickMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Create Bill</span>
              </button>

              <button
                onClick={() => {
                  onOpenQuickAction('EXPENSE');
                  setIsQuickMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
              >
                <DollarSign className="w-4 h-4 text-rose-400" />
                <span>Record Expense</span>
              </button>

              <button
                onClick={() => {
                  onOpenQuickAction('HOME');
                  setIsQuickMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
              >
                <Home className="w-4 h-4 text-emerald-400" />
                <span>Add Rental Home</span>
              </button>

              <button
                onClick={() => {
                  onOpenQuickAction('PROPERTY');
                  setIsQuickMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Add Property</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="System Settings & Launch Checklist"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile & Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
              {user?.name || 'Owner'}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-11 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-800/80">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Property Owner'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'Active Session'}</p>
                <div className="mt-1.5 flex items-center space-x-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Family Master Key (9444423448)</span>
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Passkey & Mobile Sync</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <span>Estate & Backup Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-800/80 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
