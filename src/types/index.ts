export type OccupancyStatus = 'Occupied' | 'Vacant' | 'Under Maintenance';
export type BillStatus = 'Paid' | 'Partial' | 'Pending' | 'Overdue';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  provider?: 'email' | 'google' | 'passkey';
  googleId?: string;
  lastLogin?: string;
}

export interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: string;
  provider: 'email' | 'google' | 'passkey';
  avatarUrl?: string;
}

export interface AppSettings {
  estateName: string;
  ownerContactPhone: string;
  currencySymbol: string;
  invoiceNote: string;
  googleClientId: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  notes?: string;
  createdAt: string;
}

export interface RentalHome {
  id: string;
  propertyId: string;
  houseNumber: string; // e.g. "House 101", "Flat 201"
  tenantName: string;
  tenantPhone: string;
  monthlyRent: number;
  securityDeposit: number;
  electricityCharge: number;
  waterCharge: number;
  otherCharges: number;
  dueDate: string; // e.g. "5th of every month"
  occupancyStatus: OccupancyStatus;
  notes?: string;
  createdAt: string;
}

export interface Bill {
  id: string; // e.g. "BILL-101-OCT"
  homeId: string;
  propertyId: string;
  billingMonth: string; // e.g. "2026-10"
  invoiceDate: string;
  dueDate: string;
  rentAmount: number;
  electricityCharge: number;
  waterCharge: number;
  otherCharges: number;
  previousBalance: number;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: BillStatus;
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  billId: string;
  homeId: string;
  propertyId: string;
  date: string;
  amount: number;
  method: string;
  notes?: string;
}

export interface Expense {
  id: string;
  propertyId: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}
