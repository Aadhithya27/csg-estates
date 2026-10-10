import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Edit3,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FinanceService } from '../../services/finance';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { Bill } from '../../types';
import { Modal } from '../layout/Modal';
import { useToast } from '../../context/ToastContext';

interface BillsListProps {
  onOpenQuickAction: (actionType: string) => void;
}

export const BillsList: React.FC<BillsListProps> = ({ onOpenQuickAction }) => {
  const {
    bills,
    homes,
    properties,
    updateBill,
    deleteBill,
    addPaymentToBill,
  } = useData();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table'); // Simple & aligned table default

  const [previewBill, setPreviewBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Edit Bill form fields
  const [editRent, setEditRent] = useState('');
  const [editElec, setEditElec] = useState('');
  const [editWater, setEditWater] = useState('');
  const [editOther, setEditOther] = useState('');
  const [editPrevBal, setEditPrevBal] = useState('');
  const [editPaid, setEditPaid] = useState('');

  // Payment modal state
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');

  const openEditModal = (b: Bill) => {
    setEditingBill(b);
    setEditRent(String(b.rentAmount));
    setEditElec(String(b.electricityCharge));
    setEditWater(String(b.waterCharge));
    setEditOther(String(b.otherCharges));
    setEditPrevBal(String(b.previousBalance));
    setEditPaid(String(b.amountPaid));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill) return;

    updateBill(editingBill.id, {
      rentAmount: parseFloat(editRent) || 0,
      electricityCharge: parseFloat(editElec) || 0,
      waterCharge: parseFloat(editWater) || 0,
      otherCharges: parseFloat(editOther) || 0,
      previousBalance: parseFloat(editPrevBal) || 0,
      amountPaid: parseFloat(editPaid) || 0,
    });

    showToast(`Bill ${editingBill.id} recalculated & saved!`, undefined, 'success');
    setEditingBill(null);
  };

  const handleDeleteBill = (b: Bill) => {
    if (confirm(`Are you sure you want to delete bill "${b.id}"?`)) {
      deleteBill(b.id);
      showToast(`Bill "${b.id}" deleted.`, undefined, 'info');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentBill || !payAmount) return;

    addPaymentToBill(paymentBill.id, parseFloat(payAmount), payMethod);
    showToast(`Payment of ₹${payAmount} recorded for ${paymentBill.id}!`, undefined, 'success');
    setPaymentBill(null);
  };

  const handleDownloadPDF = (b: Bill) => {
    const home = homes.find((h) => h.id === b.homeId);
    const prop = properties.find((p) => p.id === b.propertyId);

    PDFGeneratorService.generateBillPDF(b, home, prop);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const home = homes.find((h) => h.id === b.homeId);
    const prop = properties.find((p) => p.id === b.propertyId);

    const matchesQuery =
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (home && home.houseNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (home && home.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prop && prop.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;

    return matchesQuery && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Partial
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            <span>Billing & Rent Invoices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            C S G Estates — Simplified rental invoice management, automatic balances, and PDF receipts
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAction('BILL')}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bill number, house number, tenant or property..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="Paid" className="bg-slate-900">Paid</option>
              <option value="Partial" className="bg-slate-900">Partial</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Overdue" className="bg-slate-900">Overdue</option>
            </select>
          </div>

          {/* Table / Card View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Aligned Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aligned Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* BILLS CONTENT */}
      {filteredBills.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
          No bills found matching search or filter criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* ======================================================== */
        /* SIMPLIFIED & ALIGNED TABLE VIEW */
        /* ======================================================== */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-32">Bill ID</th>
                  <th className="py-3.5 px-4">Unit / Home</th>
                  <th className="py-3.5 px-4">Tenant Name</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4 text-center">Month</th>
                  <th className="py-3.5 px-4 text-right">Rent + Util</th>
                  <th className="py-3.5 px-4 text-right">Total Bill</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredBills.map((b) => {
                  const home = homes.find((h) => h.id === b.homeId);
                  const prop = properties.find((p) => p.id === b.propertyId);
                  const utilities = b.electricityCharge + b.waterCharge;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Bill ID */}
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {b.id}
                      </td>

                      {/* Rental Unit */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-100">
                          {home?.houseNumber || 'Unit'}
                        </span>
                      </td>

                      {/* Tenant */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-200">
                        {home?.tenantName ? (
                          <div>
                            <div className="font-semibold text-slate-100">{home.tenantName}</div>
                            {home.tenantPhone && (
                              <div className="text-[10px] text-slate-400">{home.tenantPhone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No tenant</span>
                        )}
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {prop?.name || 'Property'}
                      </td>

                      {/* Billing Month */}
                      <td className="py-3 px-4 text-center text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {b.billingMonth}
                      </td>

                      {/* Breakdown Rent + Util */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        ₹{b.rentAmount.toLocaleString()}{' '}
                        {utilities > 0 && (
                          <span className="text-[10px] text-indigo-300">
                            (+₹{utilities.toLocaleString()})
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-100 whitespace-nowrap">
                        ₹{b.totalAmount.toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        ₹{b.amountPaid.toLocaleString()}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={
                            b.remainingAmount > 0 ? 'text-rose-400' : 'text-slate-400'
                          }
                        >
                          ₹{b.remainingAmount.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {b.remainingAmount > 0 && (
                            <button
                              onClick={() => {
                                setPaymentBill(b);
                                setPayAmount(String(b.remainingAmount));
                              }}
                              className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-sm mr-1 cursor-pointer"
                              title="Record Payment"
                            >
                              + Pay
                            </button>
                          )}

                          <button
                            onClick={() => setPreviewBill(b)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Preview Clean Bill"
                          >
                            <Eye className="w-4 h-4 text-indigo-400" />
                          </button>

                          <button
                            onClick={() => handleDownloadPDF(b)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Download PDF Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit Bill"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteBill(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* SIMPLIFIED & ALIGNED CARDS VIEW */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((b) => {
            const home = homes.find((h) => h.id === b.homeId);
            const prop = properties.find((p) => p.id === b.propertyId);

            return (
              <div
                key={b.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg hover:shadow-xl"
              >
                <div>
                  {/* Card Header: Unit & Status */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-100">
                          {home?.houseNumber || 'Rental Unit'}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-bold">
                          {b.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{prop?.name}</span>
                        {home?.tenantName && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300 font-medium">{home.tenantName}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div>{getStatusBadge(b.status)}</div>
                  </div>

                  {/* Calculations Breakdown (Clean Aligned Table Grid) */}
                  <div className="py-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400">Monthly Base Rent:</span>
                      <span className="font-mono font-medium">₹{b.rentAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Electricity & Water:</span>
                      <span className="font-mono text-slate-300">
                        ₹{(b.electricityCharge + b.waterCharge).toLocaleString()}
                      </span>
                    </div>

                    {(b.otherCharges > 0 || b.previousBalance > 0) && (
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Other Charges / Arrears:</span>
                        <span className="font-mono text-slate-300">
                          ₹{(b.otherCharges + b.previousBalance).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-800 pt-2.5 mt-2 flex justify-between items-center text-slate-100 font-bold">
                      <span>Total Charges:</span>
                      <span className="font-mono text-sm text-white">₹{b.totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-400 font-semibold">
                      <span>Amount Received:</span>
                      <span className="font-mono">- ₹{b.amountPaid.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                      <span className="font-bold text-slate-200">Balance Due:</span>
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          b.remainingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        ₹{b.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {b.remainingAmount > 0 ? (
                      <button
                        onClick={() => {
                          setPaymentBill(b);
                          setPayAmount(String(b.remainingAmount));
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        + Payment
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                        Settled
                      </span>
                    )}

                    <button
                      onClick={() => setPreviewBill(b)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Bill</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDownloadPDF(b)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      title="Edit Bill"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteBill(b)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                      title="Delete Bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* SIMPLIFIED & PERFECTLY ALIGNED BILL PREVIEW MODAL */}
      {/* ======================================================== */}
      {previewBill && (
        <Modal
          isOpen={!!previewBill}
          onClose={() => setPreviewBill(null)}
          title={`Rent Invoice — ${previewBill.id}`}
          subtitle={`Billing Period: ${previewBill.billingMonth}`}
          maxWidth="2xl"
        >
          {(() => {
            const home = homes.find((h) => h.id === previewBill.homeId);
            const prop = properties.find((p) => p.id === previewBill.propertyId);

            return (
              <div className="space-y-6">
                {/* Printable Invoice Container */}
                <div className="printable-invoice bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-inner">
                  {/* Top Header: Company Brand & Invoice Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black shadow-md">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white tracking-wide">
                            C S G Estates
                          </h3>
                          <p className="text-[11px] text-indigo-400 font-semibold tracking-wide uppercase">
                            Property Management & Rental Invoices
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {prop?.name} • {prop?.address || 'Chennai, Tamil Nadu'}
                      </p>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                        Official Rent Invoice
                      </span>
                      <span className="text-base font-mono font-black text-indigo-400 block">
                        {previewBill.id}
                      </span>
                      <div className="mt-1">{getStatusBadge(previewBill.status)}</div>
                    </div>
                  </div>

                  {/* 2-Column Aligned Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs">
                    {/* Column 1: Billed To */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        Billed To (Tenant)
                      </span>
                      <div className="font-extrabold text-slate-100 text-sm">
                        {home?.tenantName || 'Tenant (Unassigned)'}
                      </div>
                      <div className="text-slate-300 font-medium">
                        Unit: <span className="text-white font-bold">{home?.houseNumber}</span>
                      </div>
                      {home?.tenantPhone && (
                        <div className="text-slate-400">Phone: {home.tenantPhone}</div>
                      )}
                    </div>

                    {/* Column 2: Invoice Details */}
                    <div className="space-y-1 sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                        Invoice Details
                      </span>
                      <div className="text-slate-300">
                        Billing Month: <span className="font-mono font-bold text-white">{previewBill.billingMonth}</span>
                      </div>
                      <div className="text-slate-300">
                        Invoice Date: <span className="font-mono text-slate-200">{previewBill.invoiceDate}</span>
                      </div>
                      <div className="text-slate-300">
                        Payment Due: <span className="font-mono font-bold text-amber-400">{previewBill.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Charges Table (Clean & Aligned) */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-4 w-12 text-center">#</th>
                          <th className="py-2.5 px-4">Charge Description</th>
                          <th className="py-2.5 px-4 hidden sm:table-cell">Type</th>
                          <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        <tr>
                          <td className="py-3 px-4 text-center text-slate-500">1</td>
                          <td className="py-3 px-4 text-slate-100 font-semibold">
                            Monthly House Rent
                          </td>
                          <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                            Standard Base Rent
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            ₹{previewBill.rentAmount.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3 px-4 text-center text-slate-500">2</td>
                          <td className="py-3 px-4 text-slate-100 font-semibold">
                            Electricity Charges
                          </td>
                          <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                            Utility Meter Usage
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            ₹{previewBill.electricityCharge.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-3 px-4 text-center text-slate-500">3</td>
                          <td className="py-3 px-4 text-slate-100 font-semibold">
                            Water Supply Charges
                          </td>
                          <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                            Water Maintenance
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                            ₹{previewBill.waterCharge.toLocaleString()}
                          </td>
                        </tr>

                        {previewBill.otherCharges > 0 && (
                          <tr>
                            <td className="py-3 px-4 text-center text-slate-500">4</td>
                            <td className="py-3 px-4 text-slate-100 font-semibold">
                              Other / Maintenance Charges
                            </td>
                            <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                              Property Upkeep
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                              ₹{previewBill.otherCharges.toLocaleString()}
                            </td>
                          </tr>
                        )}

                        {previewBill.previousBalance > 0 && (
                          <tr>
                            <td className="py-3 px-4 text-center text-slate-500">
                              {previewBill.otherCharges > 0 ? 5 : 4}
                            </td>
                            <td className="py-3 px-4 text-amber-400 font-semibold">
                              Previous Outstanding Balance
                            </td>
                            <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">
                              Carried Forward Due
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                              ₹{previewBill.previousBalance.toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Box (Aligned Right) */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-300">Payment Modes Accepted:</p>
                      <p>UPI (GPay / PhonePe / Paytm), Bank Transfer (NEFT), Cheque, Cash</p>
                      <p className="text-slate-500 pt-1">
                        Please pay on or before the due date to ensure smooth tenancy.
                      </p>
                    </div>

                    <div className="w-full sm:w-64 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Total Gross Charges:</span>
                        <span className="font-mono font-bold text-white">
                          ₹{previewBill.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Amount Paid / Received:</span>
                        <span className="font-mono">
                          - ₹{previewBill.amountPaid.toLocaleString()}
                        </span>
                      </div>

                      <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                        <span className="font-extrabold text-slate-100">Balance Due:</span>
                        <span
                          className={`font-mono font-black text-base ${
                            previewBill.remainingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          ₹{previewBill.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
                  <div className="flex items-center gap-2">
                    {previewBill.remainingAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentBill(previewBill);
                          setPayAmount(String(previewBill.remainingAmount));
                          setPreviewBill(null);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Record Payment</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Print Invoice"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(previewBill)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewBill(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* ======================================================== */}
      {/* EDIT BILL MODAL */}
      {/* ======================================================== */}
      {editingBill && (
        <Modal
          isOpen={!!editingBill}
          onClose={() => setEditingBill(null)}
          title={`Edit Bill — ${editingBill.id}`}
          subtitle="All calculations update automatically"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Base Rent Amount (₹)</label>
                <input
                  type="number"
                  value={editRent}
                  onChange={(e) => setEditRent(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Electricity Charge (₹)</label>
                <input
                  type="number"
                  value={editElec}
                  onChange={(e) => setEditElec(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Water Charge (₹)</label>
                <input
                  type="number"
                  value={editWater}
                  onChange={(e) => setEditWater(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Other Charges (₹)</label>
                <input
                  type="number"
                  value={editOther}
                  onChange={(e) => setEditOther(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Previous Balance (₹)</label>
                <input
                  type="number"
                  value={editPrevBal}
                  onChange={(e) => setEditPrevBal(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={editPaid}
                  onChange={(e) => setEditPaid(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingBill(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Save & Recalculate
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* RECORD PAYMENT MODAL */}
      {/* ======================================================== */}
      {paymentBill && (
        <Modal
          isOpen={!!paymentBill}
          onClose={() => setPaymentBill(null)}
          title={`Record Rent Payment — ${paymentBill.id}`}
          subtitle="Add full or partial rent payment"
          maxWidth="md"
        >
          <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold text-base focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPaymentBill(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Save Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
