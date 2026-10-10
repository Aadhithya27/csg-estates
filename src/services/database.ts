import { AppSettings, Bill, Expense, PaymentRecord, Property, RentalHome, User } from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'rpm_simple_properties_v3',
  HOMES: 'rpm_simple_homes_v3',
  BILLS: 'rpm_simple_bills_v3',
  PAYMENTS: 'rpm_simple_payments_v3',
  EXPENSES: 'rpm_simple_expenses_v3',
  USER: 'rpm_simple_user_v3',
  SETTINGS: 'rpm_simple_settings_v3',
};

const DEFAULT_SETTINGS: AppSettings = {
  estateName: 'C S G Estates',
  ownerContactPhone: '+91 98400 11223',
  currencySymbol: '₹',
  invoiceNote: 'Thank you for your prompt payment! Contact owner for any queries.',
  googleClientId: '',
};

const DEFAULT_USER: User = {
  id: 'usr-owner-01',
  name: 'C S G Estates Owner',
  email: 'owner@csgestates.com',
  role: 'Owner',
  provider: 'email',
};

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Anna Nagar Building',
    address: 'No. 15, 4th Avenue, Anna Nagar East',
    city: 'Chennai',
    notes: '3 Floor residential property',
    createdAt: '2026-01-01',
  },
  {
    id: 'prop-2',
    name: 'Grand Heights',
    address: '88 Usman Road, T. Nagar',
    city: 'Chennai',
    notes: 'Commercial & residential apartments',
    createdAt: '2026-01-01',
  },
  {
    id: 'prop-3',
    name: 'Green Valley Estate',
    address: 'Plot 12, East Coast Road (ECR)',
    city: 'Chennai',
    notes: 'Villa property with parking',
    createdAt: '2026-01-01',
  },
];

const INITIAL_HOMES: RentalHome[] = [
  // Property 1: Anna Nagar
  {
    id: 'home-101',
    propertyId: 'prop-1',
    houseNumber: 'House 101',
    tenantName: 'Rajesh Kumar',
    tenantPhone: '+91 98401 23456',
    monthlyRent: 12000,
    securityDeposit: 60000,
    electricityCharge: 1200,
    waterCharge: 400,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Occupied',
    notes: '1st Floor house',
    createdAt: '2026-01-01',
  },
  {
    id: 'home-102',
    propertyId: 'prop-1',
    houseNumber: 'House 102',
    tenantName: 'Priya Sundaram',
    tenantPhone: '+91 97102 88472',
    monthlyRent: 15000,
    securityDeposit: 80000,
    electricityCharge: 1500,
    waterCharge: 500,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Occupied',
    notes: '2nd Floor house',
    createdAt: '2026-01-01',
  },
  {
    id: 'home-103',
    propertyId: 'prop-1',
    houseNumber: 'House 103',
    tenantName: '',
    tenantPhone: '',
    monthlyRent: 10000,
    securityDeposit: 50000,
    electricityCharge: 0,
    waterCharge: 0,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Vacant',
    notes: 'Ground floor unit',
    createdAt: '2026-01-01',
  },

  // Property 2: Grand Heights
  {
    id: 'home-201',
    propertyId: 'prop-2',
    houseNumber: 'Flat 201',
    tenantName: 'Dr. Vikram Raman',
    tenantPhone: '+91 98410 77332',
    monthlyRent: 22000,
    securityDeposit: 120000,
    electricityCharge: 1800,
    waterCharge: 600,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Occupied',
    notes: '2BHK Apartment',
    createdAt: '2026-01-01',
  },
  {
    id: 'home-202',
    propertyId: 'prop-2',
    houseNumber: 'Flat 202',
    tenantName: '',
    tenantPhone: '',
    monthlyRent: 18000,
    securityDeposit: 100000,
    electricityCharge: 0,
    waterCharge: 0,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Vacant',
    notes: 'Under painting work',
    createdAt: '2026-01-01',
  },

  // Property 3: Green Valley
  {
    id: 'home-301',
    propertyId: 'prop-3',
    houseNumber: 'Villa 1',
    tenantName: 'David Miller',
    tenantPhone: '+91 96000 12890',
    monthlyRent: 45000,
    securityDeposit: 250000,
    electricityCharge: 3500,
    waterCharge: 1000,
    otherCharges: 0,
    dueDate: '5th of every month',
    occupancyStatus: 'Occupied',
    notes: 'Luxury Villa ECR',
    createdAt: '2026-01-01',
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'BILL-101-OCT',
    homeId: 'home-101',
    propertyId: 'prop-1',
    billingMonth: '2026-10',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-05',
    rentAmount: 12000,
    electricityCharge: 1200,
    waterCharge: 400,
    otherCharges: 0,
    previousBalance: 0,
    totalAmount: 13600,
    amountPaid: 13600,
    remainingAmount: 0,
    status: 'Paid',
    notes: 'October Rent Bill Paid in Full',
    createdAt: '2026-10-01',
  },
  {
    id: 'BILL-102-OCT',
    homeId: 'home-102',
    propertyId: 'prop-1',
    billingMonth: '2026-10',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-05',
    rentAmount: 15000,
    electricityCharge: 1500,
    waterCharge: 500,
    otherCharges: 0,
    previousBalance: 0,
    totalAmount: 17000,
    amountPaid: 10000,
    remainingAmount: 7000,
    status: 'Partial',
    notes: 'Partial payment received',
    createdAt: '2026-10-01',
  },
  {
    id: 'BILL-201-OCT',
    homeId: 'home-201',
    propertyId: 'prop-2',
    billingMonth: '2026-10',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-05',
    rentAmount: 22000,
    electricityCharge: 1800,
    waterCharge: 600,
    otherCharges: 0,
    previousBalance: 0,
    totalAmount: 24400,
    amountPaid: 0,
    remainingAmount: 24400,
    status: 'Overdue',
    notes: 'Due date passed',
    createdAt: '2026-10-01',
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'PAY-1001',
    billId: 'BILL-101-OCT',
    homeId: 'home-101',
    propertyId: 'prop-1',
    date: '2026-10-03',
    amount: 13600,
    method: 'UPI',
    notes: 'Paid via GPay',
  },
  {
    id: 'PAY-1002',
    billId: 'BILL-102-OCT',
    homeId: 'home-102',
    propertyId: 'prop-1',
    date: '2026-10-04',
    amount: 10000,
    method: 'Cash',
    notes: 'Partial rent paid in cash',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    propertyId: 'prop-1',
    description: 'Plumbing repair for House 102 bathroom leakage',
    amount: 2500,
    date: '2026-10-02',
    createdAt: '2026-10-02',
  },
  {
    id: 'exp-2',
    propertyId: 'prop-2',
    description: 'Electrical main switchboard repair',
    amount: 1800,
    date: '2026-10-04',
    createdAt: '2026-10-04',
  },
];

export class DatabaseService {
  private static getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (err) {
      console.error('Save storage error:', err);
    }
  }

  static initDatabase(): void {
    if (!localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
      this.setItem(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
      this.setItem(STORAGE_KEYS.HOMES, INITIAL_HOMES);
      this.setItem(STORAGE_KEYS.BILLS, INITIAL_BILLS);
      this.setItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
      this.setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
      this.setItem(STORAGE_KEYS.USER, DEFAULT_USER);
    } else {
      const storedUser = this.getUser();
      if (storedUser && storedUser.email.includes('aadhiestates.com')) {
        this.saveUser({
          ...storedUser,
          name: 'C S G Estates Owner',
          email: 'owner@csgestates.com',
        });
      }
    }
  }

  static getProperties(): Property[] {
    return this.getItem(STORAGE_KEYS.PROPERTIES, INITIAL_PROPERTIES);
  }

  static getHomes(): RentalHome[] {
    return this.getItem(STORAGE_KEYS.HOMES, INITIAL_HOMES);
  }

  static getBills(): Bill[] {
    return this.getItem(STORAGE_KEYS.BILLS, INITIAL_BILLS);
  }

  static getPayments(): PaymentRecord[] {
    return this.getItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  }

  static getExpenses(): Expense[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }

  static getUser(): User {
    return this.getItem(STORAGE_KEYS.USER, DEFAULT_USER);
  }

  static saveProperties(data: Property[]): void {
    this.setItem(STORAGE_KEYS.PROPERTIES, data);
  }

  static saveHomes(data: RentalHome[]): void {
    this.setItem(STORAGE_KEYS.HOMES, data);
  }

  static saveBills(data: Bill[]): void {
    this.setItem(STORAGE_KEYS.BILLS, data);
  }

  static savePayments(data: PaymentRecord[]): void {
    this.setItem(STORAGE_KEYS.PAYMENTS, data);
  }

  static saveExpenses(data: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, data);
  }

  static saveUser(data: User): void {
    this.setItem(STORAGE_KEYS.USER, data);
  }

  static getSettings(): AppSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static saveSettings(data: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, data);
  }

  /**
   * Export all database records as a standalone JSON backup
   */
  static exportAllData(): string {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      appName: 'C S G Estates Rental Management ERP',
      data: {
        properties: this.getProperties(),
        homes: this.getHomes(),
        bills: this.getBills(),
        payments: this.getPayments(),
        expenses: this.getExpenses(),
        settings: this.getSettings(),
        user: this.getUser(),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import and restore database from a JSON backup
   */
  static importAllData(jsonString: string): { success: boolean; message: string; counts?: any } {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;

      if (!data.properties && !data.homes && !data.bills) {
        return {
          success: false,
          message: 'Invalid backup file format. Missing essential property or billing data.',
        };
      }

      if (Array.isArray(data.properties)) this.saveProperties(data.properties);
      if (Array.isArray(data.homes)) this.saveHomes(data.homes);
      if (Array.isArray(data.bills)) this.saveBills(data.bills);
      if (Array.isArray(data.payments)) this.savePayments(data.payments);
      if (Array.isArray(data.expenses)) this.saveExpenses(data.expenses);
      if (data.settings) this.saveSettings(data.settings);
      if (data.user) this.saveUser(data.user);

      return {
        success: true,
        message: 'Database backup restored successfully!',
        counts: {
          properties: data.properties?.length || 0,
          homes: data.homes?.length || 0,
          bills: data.bills?.length || 0,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to restore database: ${err?.message || 'Invalid JSON format'}`,
      };
    }
  }

  /**
   * Reset database back to default factory state
   */
  static resetDatabaseToDefaults(): void {
    this.saveProperties(INITIAL_PROPERTIES);
    this.saveHomes(INITIAL_HOMES);
    this.saveBills(INITIAL_BILLS);
    this.savePayments(INITIAL_PAYMENTS);
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveUser(DEFAULT_USER);
  }
}
