import React from 'react';
import {
  Building2,
  Home,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FinanceService } from '../../services/finance';
import { useToast } from '../../context/ToastContext';

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  onOpenQuickAction,
}) => {
  const {
    properties,
    homes,
    bills,
    payments,
    expenses,
    selectedPropertyId,
    selectedMonth,
    createBill,
  } = useData();

  const { showToast } = useToast();

  const metrics = FinanceService.calculateDashboardMetrics(properties, homes, bills, expenses);

  // Filter bills
  const pendingBills = bills.filter((b) => b.status === 'Pending' || b.status === 'Partial');
  const overdueBills = bills.filter((b) => b.status === 'Overdue');
  const recentPayments = payments.slice(0, 5);

  const handleGenerateMonthlyBills = () => {
    let createdCount = 0;
    const occupiedHomes = homes.filter((h) => h.occupancyStatus === 'Occupied');

    occupiedHomes.forEach((home) => {
      const alreadyHasBill = bills.some(
        (b) => b.homeId === home.id && b.billingMonth === selectedMonth
      );
      if (!alreadyHasBill) {
        createBill({
          homeId: home.id,
          propertyId: home.propertyId,
          billingMonth: selectedMonth,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: `${selectedMonth}-05`,
          rentAmount: home.monthlyRent,
          electricityCharge: home.electricityCharge || 0,
          waterCharge: home.waterCharge || 0,
          otherCharges: home.otherCharges || 0,
          previousBalance: 0,
          amountPaid: 0,
        });
        createdCount++;
      }
    });

    if (createdCount > 0) {
      showToast(`Generated ${createdCount} monthly bills for ${selectedMonth}!`, undefined, 'success');
    } else {
      showToast(`All occupied homes already have bills for ${selectedMonth}.`, undefined, 'info');
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            Owner Financial Overview
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simple, real-time rental properties, monthly rent & net income summary
          </p>
        </div>

        <button
          onClick={handleGenerateMonthlyBills}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Bills ({selectedMonth})</span>
        </button>
      </div>

      {/* Empty State Banner if no properties added yet */}
      {properties.length === 0 && (
        <div className="p-8 bg-slate-900/80 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Welcome! No Properties Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your rental ERP is clean and ready. Start by adding your first property and configuring rental units or rooms.
          </p>
          <button
            onClick={() => onOpenQuickAction('PROPERTY')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Property</span>
          </button>
        </div>
      )}

      {/* DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {/* Card 1: Total Properties */}
        <div
          onClick={() => setActiveTab('properties')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.totalProperties}</p>
          <p className="text-[10px] text-slate-400 mt-1">Buildings owned</p>
        </div>

        {/* Card 2: Total Rental Homes */}
        <div
          onClick={() => setActiveTab('properties')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/50 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Rental Homes</span>
            <Home className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.totalHomes}</p>
          <p className="text-[10px] text-slate-400 mt-1">Units inside properties</p>
        </div>

        {/* Card 3: Occupied Homes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Occupied Homes</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{metrics.occupiedHomes}</p>
          <p className="text-[10px] text-slate-400 mt-1">Active tenants</p>
        </div>

        {/* Card 4: Vacant Homes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Vacant Homes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{metrics.vacantHomes}</p>
          <p className="text-[10px] text-slate-400 mt-1">Ready for rent</p>
        </div>

        {/* Card 5: Total Monthly Rent */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase">
            <span>Total Monthly Rent</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-100 mt-2">
            {FinanceService.formatCurrency(metrics.totalMonthlyRent)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Expected monthly</p>
        </div>
      </div>

      {/* 4 CORE FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Rent Collected */}
        <div
          onClick={() => setActiveTab('bills')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
            <span>Rent Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">
            {FinanceService.formatCurrency(metrics.rentCollected)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Total payments received</span>
        </div>

        {/* Pending Rent */}
        <div
          onClick={() => setActiveTab('bills')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-amber-500/50 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
            <span>Pending Rent</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-2">
            {FinanceService.formatCurrency(metrics.pendingRent)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Outstanding balance</span>
        </div>

        {/* Total Expenses */}
        <div
          onClick={() => setActiveTab('expenses')}
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-rose-500/50 cursor-pointer shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-extrabold uppercase">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 mt-2">
            {FinanceService.formatCurrency(metrics.totalExpenses)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Maintenance & repairs</span>
        </div>

        {/* Net Income */}
        <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/50 border border-indigo-500/40 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-indigo-300 text-[10px] font-extrabold uppercase">
            <span>Net Income</span>
            <DollarSign className="w-4 h-4 text-indigo-300" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-2">
            {FinanceService.formatCurrency(metrics.netIncome)}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">Collected − Expenses</span>
        </div>
      </div>

      {/* SIMPLE LISTS: OVERDUE BILLS, PENDING BILLS, RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Bills */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Overdue Bills ({overdueBills.length})</span>
            </h3>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-[10px] text-indigo-400 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto custom-scrollbar max-h-64">
            {overdueBills.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No overdue bills</div>
            ) : (
              overdueBills.map((b) => {
                const home = homes.find((h) => h.id === b.homeId);
                const prop = properties.find((p) => p.id === b.propertyId);

                return (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-100">{home?.houseNumber}</p>
                      <p className="text-[10px] text-slate-400">{prop?.name} • {home?.tenantName}</p>
                      <span className="text-[10px] text-rose-400 font-semibold">Due: {b.dueDate}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-rose-400">
                        {FinanceService.formatCurrency(b.remainingAmount)}
                      </p>
                      <button
                        onClick={() => onOpenQuickAction('PAYMENT')}
                        className="mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-md"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Bills ({pendingBills.length})</span>
            </h3>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-[10px] text-indigo-400 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto custom-scrollbar max-h-64">
            {pendingBills.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No pending bills</div>
            ) : (
              pendingBills.map((b) => {
                const home = homes.find((h) => h.id === b.homeId);
                const prop = properties.find((p) => p.id === b.propertyId);

                return (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-100">{home?.houseNumber}</p>
                      <p className="text-[10px] text-slate-400">{prop?.name} • {home?.tenantName}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-amber-400">
                        {FinanceService.formatCurrency(b.remainingAmount)}
                      </p>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Recent Payments</span>
            </h3>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-[10px] text-indigo-400 font-semibold hover:underline"
            >
              View History
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto custom-scrollbar max-h-64">
            {recentPayments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No recent payments recorded</div>
            ) : (
              recentPayments.map((p) => {
                const home = homes.find((h) => h.id === p.homeId);
                const prop = properties.find((pr) => pr.id === p.propertyId);

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-100">{home?.houseNumber}</p>
                      <p className="text-[10px] text-slate-400">{prop?.name} • Mode: {p.method}</p>
                      <span className="text-[10px] text-slate-500">{p.date}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-emerald-400">
                        +{FinanceService.formatCurrency(p.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
