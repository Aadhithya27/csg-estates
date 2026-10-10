import React, { useState } from 'react';
import { Modal } from '../layout/Modal';
import { useData } from '../../context/DataContext';
import { OccupancyStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string; // 'BILL' | 'EXPENSE' | 'HOME' | 'PROPERTY' | 'PAYMENT'
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
}) => {
  const {
    properties,
    homes,
    bills,
    addProperty,
    addHome,
    createBill,
    addExpense,
    addPaymentToBill,
    selectedMonth,
  } = useData();

  const { showToast } = useToast();

  // Form states
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [homeId, setHomeId] = useState('');
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('12000');
  const [securityDeposit, setSecurityDeposit] = useState('60000');
  const [elecCharge, setElecCharge] = useState('1000');
  const [waterCharge, setWaterCharge] = useState('400');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeId) return;

    const home = homes.find((h) => h.id === homeId);
    if (!home) return;

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

    showToast(`Monthly Bill generated for ${home.houseNumber}!`, undefined, 'success');
    onClose();
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !description || !amount) return;

    addExpense({
      propertyId,
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
    });

    showToast(`Expense ₹${amount} recorded!`, undefined, 'success');
    onClose();
  };

  const handleHomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !houseNumber || !monthlyRent) return;

    addHome({
      propertyId,
      houseNumber,
      tenantName,
      tenantPhone,
      monthlyRent: parseFloat(monthlyRent),
      securityDeposit: parseFloat(securityDeposit) || 0,
      electricityCharge: parseFloat(elecCharge) || 0,
      waterCharge: parseFloat(waterCharge) || 0,
      otherCharges: 0,
      dueDate: '5th of every month',
      occupancyStatus: 'Occupied',
    });

    showToast(`Rental Home "${houseNumber}" created!`, undefined, 'success');
    onClose();
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !propertyAddress) return;

    addProperty({
      name: propertyName,
      address: propertyAddress,
      city: 'Chennai',
    });

    showToast(`Property "${propertyName}" created!`, undefined, 'success');
    onClose();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billId || !amount) return;

    addPaymentToBill(billId, parseFloat(amount), paymentMethod);
    showToast(`Payment of ₹${amount} recorded!`, undefined, 'success');
    onClose();
  };

  const titlesMap: Record<string, string> = {
    BILL: 'Create Monthly Rent Bill',
    EXPENSE: 'Add Property Expense',
    HOME: 'Add Rental Home',
    PROPERTY: 'Add Property',
    PAYMENT: 'Record Rent Payment',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titlesMap[actionType] || 'Quick Launcher'}
      subtitle="Enter details below"
      maxWidth="md"
    >
      {/* 1. BILL FORM */}
      {actionType === 'BILL' && (
        <form onSubmit={handleBillSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Occupied Home *</label>
            <select
              value={homeId}
              onChange={(e) => setHomeId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose Home --</option>
              {homes
                .filter((h) => h.occupancyStatus === 'Occupied')
                .map((h) => {
                  const prop = properties.find((p) => p.id === h.propertyId);
                  return (
                    <option key={h.id} value={h.id}>
                      {h.houseNumber} ({prop?.name} - ₹{h.monthlyRent}/mo)
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
            >
              Generate Bill
            </button>
          </div>
        </form>
      )}

      {/* 2. EXPENSE FORM */}
      {actionType === 'EXPENSE' && (
        <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Property *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description *</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Plumbing repair for House 102"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30"
            >
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* 3. HOME FORM */}
      {actionType === 'HOME' && (
        <form onSubmit={handleHomeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Property *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">House Number *</label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="House 101"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monthly Rent (₹) *</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenant Name</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenant Phone</label>
              <input
                type="text"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-600/30"
            >
              Save Home
            </button>
          </div>
        </form>
      )}

      {/* 4. PROPERTY FORM */}
      {actionType === 'PROPERTY' && (
        <form onSubmit={handlePropertySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Property Name *</label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. Anna Nagar Building"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Address *</label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="No. 15, 4th Avenue, Anna Nagar"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/30"
            >
              Create Property
            </button>
          </div>
        </form>
      )}

      {/* 5. PAYMENT FORM */}
      {actionType === 'PAYMENT' && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Pending Bill *</label>
            <select
              value={billId}
              onChange={(e) => {
                setBillId(e.target.value);
                const b = bills.find((x) => x.id === e.target.value);
                if (b) setAmount(String(b.remainingAmount));
              }}
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Choose Pending Bill --</option>
              {bills
                .filter((b) => b.remainingAmount > 0)
                .map((b) => {
                  const home = homes.find((h) => h.id === b.homeId);
                  return (
                    <option key={b.id} value={b.id}>
                      {b.id} ({home?.houseNumber} - Due: ₹{b.remainingAmount})
                    </option>
                  );
                })}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Amount Paid (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 15000"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30"
            >
              Record Payment
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
