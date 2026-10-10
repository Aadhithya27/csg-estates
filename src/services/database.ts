import { AppSettings, Bill, Expense, PaymentRecord, Property, RegisteredAccount, RentalHome, User } from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'rpm_properties_live',
  HOMES: 'rpm_homes_live',
  BILLS: 'rpm_bills_live',
  PAYMENTS: 'rpm_payments_live',
  EXPENSES: 'rpm_expenses_live',
  USER: 'rpm_user_live',
  SETTINGS: 'rpm_settings_live',
  ACCOUNTS: 'rpm_accounts_live',
};

const DEFAULT_SETTINGS: AppSettings = {
  estateName: 'C S G Estates',
  ownerContactPhone: '',
  currencySymbol: '₹',
  invoiceNote: 'Thank you for your prompt payment!',
  googleClientId: '',
};

const DEFAULT_USER: User = {
  id: '',
  name: 'Estate Owner',
  email: '',
  role: 'Owner',
  provider: 'email',
};

const INITIAL_PROPERTIES: Property[] = [];
const INITIAL_HOMES: RentalHome[] = [];
const INITIAL_BILLS: Bill[] = [];
const INITIAL_PAYMENTS: PaymentRecord[] = [];
const INITIAL_EXPENSES: Expense[] = [];

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
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
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

  static getAccounts(): RegisteredAccount[] {
    return this.getItem(STORAGE_KEYS.ACCOUNTS, []);
  }

  static saveAccounts(accounts: RegisteredAccount[]): void {
    this.setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  static registerAccount(
    name: string,
    email: string,
    password?: string,
    provider: 'email' | 'google' = 'email',
    avatarUrl?: string
  ): { success: boolean; user?: User; message: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (existing && provider === 'email') {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const newUser: User = {
      id: existing ? existing.id : `usr-${Date.now()}`,
      name: name.trim() || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      role: 'Owner',
      provider,
      avatarUrl: avatarUrl || existing?.avatarUrl,
      lastLogin: new Date().toISOString(),
    };

    if (!existing) {
      const newAccount: RegisteredAccount = {
        id: newUser.id,
        name: newUser.name,
        email: trimmedEmail,
        password: password || '',
        role: 'Owner',
        provider,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };
      this.saveAccounts([...accounts, newAccount]);
    }

    this.saveUser(newUser);
    return { success: true, user: newUser, message: 'Account created successfully!' };
  }

  static authenticate(
    email: string,
    password: string
  ): { success: boolean; user?: User; message: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const accounts = this.getAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      // First-time owner setup or quick auto-creation if no accounts exist
      if (accounts.length === 0 && password.length >= 4) {
        return this.registerAccount(trimmedEmail.split('@')[0], trimmedEmail, password, 'email');
      }
      return {
        success: false,
        message: 'No account found with this email. Please switch to Create Account.',
      };
    }

    if (existing.password && existing.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const user: User = {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role,
      avatarUrl: existing.avatarUrl,
      provider: existing.provider,
      lastLogin: new Date().toISOString(),
    };

    this.saveUser(user);
    return { success: true, user, message: 'Welcome back!' };
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
