import React, { createContext, useContext, useEffect, useState } from 'react';
import { DatabaseService } from '../services/database';
import { FinanceService } from '../services/finance';
import { Bill, Expense, PaymentRecord, Property, RentalHome } from '../types';

interface DataContextType {
  properties: Property[];
  homes: RentalHome[];
  bills: Bill[];
  payments: PaymentRecord[];
  expenses: Expense[];

  // Selected filters
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;

  // Property Actions (Add, Edit, Delete)
  addProperty: (data: Omit<Property, 'id' | 'createdAt'>) => Property;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Rental Home Actions (Add, Edit, Delete)
  addHome: (data: Omit<RentalHome, 'id' | 'createdAt'>) => RentalHome;
  updateHome: (id: string, data: Partial<RentalHome>) => void;
  deleteHome: (id: string) => void;

  // Bill Actions (Create, Edit, Delete, Payment)
  createBill: (data: Omit<Bill, 'id' | 'totalAmount' | 'remainingAmount' | 'status' | 'createdAt'>) => Bill;
  updateBill: (id: string, data: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  addPaymentToBill: (billId: string, amount: number, method: string, notes?: string) => void;

  // Expense Actions (Add, Edit, Delete)
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Helpers & Synchronization
  refreshData: () => void;
  getPropertyById: (id: string) => Property | undefined;
  getHomeById: (id: string) => RentalHome | undefined;
  getBillById: (id: string) => Bill | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    DatabaseService.initDatabase();
  }, []);

  const [properties, setProperties] = useState<Property[]>(() => DatabaseService.getProperties());
  const [homes, setHomes] = useState<RentalHome[]>(() => DatabaseService.getHomes());
  const [bills, setBills] = useState<Bill[]>(() => DatabaseService.getBills());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => DatabaseService.getPayments());
  const [expenses, setExpenses] = useState<Expense[]>(() => DatabaseService.getExpenses());

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Persistence helpers
  const syncProperties = (data: Property[]) => {
    setProperties(data);
    DatabaseService.saveProperties(data);
  };

  const syncHomes = (data: RentalHome[]) => {
    setHomes(data);
    DatabaseService.saveHomes(data);
  };

  const syncBills = (data: Bill[]) => {
    setBills(data);
    DatabaseService.saveBills(data);
  };

  const syncPayments = (data: PaymentRecord[]) => {
    setPayments(data);
    DatabaseService.savePayments(data);
  };

  const syncExpenses = (data: Expense[]) => {
    setExpenses(data);
    DatabaseService.saveExpenses(data);
  };

  // --- PROPERTY ACTIONS ---
  const addProperty = (input: Omit<Property, 'id' | 'createdAt'>): Property => {
    const newProp: Property = {
      ...input,
      id: `prop-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    syncProperties([...properties, newProp]);
    return newProp;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    syncProperties(properties.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProperty = (id: string) => {
    syncProperties(properties.filter((p) => p.id !== id));
    // Remove homes inside property
    syncHomes(homes.filter((h) => h.propertyId !== id));
  };

  // --- RENTAL HOME ACTIONS ---
  const addHome = (input: Omit<RentalHome, 'id' | 'createdAt'>): RentalHome => {
    const newHome: RentalHome = {
      ...input,
      id: `home-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    syncHomes([...homes, newHome]);
    return newHome;
  };

  const updateHome = (id: string, updates: Partial<RentalHome>) => {
    syncHomes(homes.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHome = (id: string) => {
    syncHomes(homes.filter((h) => h.id !== id));
  };

  // --- BILL ACTIONS ---
  const createBill = (
    input: Omit<Bill, 'id' | 'totalAmount' | 'remainingAmount' | 'status' | 'createdAt'>
  ): Bill => {
    const calc = FinanceService.calculateBillTotals({
      rentAmount: input.rentAmount,
      electricityCharge: input.electricityCharge,
      waterCharge: input.waterCharge,
      otherCharges: input.otherCharges,
      previousBalance: input.previousBalance,
      amountPaid: input.amountPaid,
    });

    const home = homes.find((h) => h.id === input.homeId);
    const billId = `BILL-${home?.houseNumber.replace(/\s+/g, '') || 'HM'}-${Date.now().toString().slice(-4)}`;

    const newBill: Bill = {
      ...input,
      id: billId,
      totalAmount: calc.totalAmount,
      remainingAmount: calc.remainingAmount,
      status: calc.status,
      createdAt: new Date().toISOString().split('T')[0],
    };

    syncBills([newBill, ...bills]);
    return newBill;
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    const target = bills.find((b) => b.id === id);
    if (!target) return;

    const merged = { ...target, ...updates };
    const calc = FinanceService.calculateBillTotals({
      rentAmount: merged.rentAmount,
      electricityCharge: merged.electricityCharge,
      waterCharge: merged.waterCharge,
      otherCharges: merged.otherCharges,
      previousBalance: merged.previousBalance,
      amountPaid: merged.amountPaid,
    });

    const updatedBill: Bill = {
      ...merged,
      totalAmount: calc.totalAmount,
      remainingAmount: calc.remainingAmount,
      status: calc.status,
    };

    syncBills(bills.map((b) => (b.id === id ? updatedBill : b)));
  };

  const deleteBill = (id: string) => {
    syncBills(bills.filter((b) => b.id !== id));
  };

  const addPaymentToBill = (billId: string, amount: number, method: string, notes?: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;

    const newPaidTotal = bill.amountPaid + amount;
    updateBill(billId, { amountPaid: newPaidTotal });

    const newPay: PaymentRecord = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      billId,
      homeId: bill.homeId,
      propertyId: bill.propertyId,
      date: new Date().toISOString().split('T')[0],
      amount,
      method,
      notes,
    };

    syncPayments([newPay, ...payments]);
  };

  // --- EXPENSE ACTIONS ---
  const addExpense = (input: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExp: Expense = {
      ...input,
      id: `exp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    syncExpenses([newExp, ...expenses]);
    return newExp;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    syncExpenses(expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExpense = (id: string) => {
    syncExpenses(expenses.filter((e) => e.id !== id));
  };

  // Helper getters
  const getPropertyById = (id: string) => properties.find((p) => p.id === id);
  const getHomeById = (id: string) => homes.find((h) => h.id === id);
  const getBillById = (id: string) => bills.find((b) => b.id === id);

  const refreshData = () => {
    setProperties(DatabaseService.getProperties());
    setHomes(DatabaseService.getHomes());
    setBills(DatabaseService.getBills());
    setPayments(DatabaseService.getPayments());
    setExpenses(DatabaseService.getExpenses());
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        homes,
        bills,
        payments,
        expenses,
        selectedPropertyId,
        setSelectedPropertyId,
        selectedMonth,
        setSelectedMonth,
        addProperty,
        updateProperty,
        deleteProperty,
        addHome,
        updateHome,
        deleteHome,
        createBill,
        updateBill,
        deleteBill,
        addPaymentToBill,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshData,
        getPropertyById,
        getHomeById,
        getBillById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
