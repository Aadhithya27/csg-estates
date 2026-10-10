import { Bill, Expense, Property, RentalHome } from '../types';

export class FinanceService {
  /**
   * Calculate Bill Total & Remaining Balance
   */
  static calculateBillTotals(data: {
    rentAmount: number;
    electricityCharge: number;
    waterCharge: number;
    otherCharges: number;
    previousBalance: number;
    amountPaid: number;
  }) {
    const rent = Math.max(0, data.rentAmount || 0);
    const ele = Math.max(0, data.electricityCharge || 0);
    const water = Math.max(0, data.waterCharge || 0);
    const other = Math.max(0, data.otherCharges || 0);
    const prev = Math.max(0, data.previousBalance || 0);
    const paid = Math.max(0, data.amountPaid || 0);

    const totalAmount = rent + ele + water + other + prev;
    const remainingAmount = Math.max(0, totalAmount - paid);

    let status: 'Paid' | 'Partial' | 'Pending' | 'Overdue' = 'Pending';
    if (paid >= totalAmount && totalAmount > 0) {
      status = 'Paid';
    } else if (paid > 0) {
      status = 'Partial';
    }

    return {
      totalAmount,
      remainingAmount,
      status,
    };
  }

  /**
   * Calculate Dashboard Overview Summaries
   */
  static calculateDashboardMetrics(
    properties: Property[],
    homes: RentalHome[],
    bills: Bill[],
    expenses: Expense[]
  ) {
    const totalProperties = properties.length;
    const totalHomes = homes.length;
    const occupiedHomes = homes.filter((h) => h.occupancyStatus === 'Occupied').length;
    const vacantHomes = homes.filter((h) => h.occupancyStatus === 'Vacant').length;

    // Total Monthly Expected Rent from occupied homes
    const totalMonthlyRent = homes
      .filter((h) => h.occupancyStatus === 'Occupied')
      .reduce((sum, h) => sum + (h.monthlyRent || 0), 0);

    // Total Rent Collected across bills
    const rentCollected = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    // Total Pending Rent across bills
    const pendingRent = bills.reduce((sum, b) => sum + (b.remainingAmount || 0), 0);

    // Total Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Net Income = Collected - Expenses
    const netIncome = rentCollected - totalExpenses;

    return {
      totalProperties,
      totalHomes,
      occupiedHomes,
      vacantHomes,
      totalMonthlyRent,
      rentCollected,
      pendingRent,
      totalExpenses,
      netIncome,
    };
  }

  /**
   * Format Currency helper (UI)
   */
  static formatCurrency(amount: number): string {
    return `₹${new Intl.NumberFormat('en-IN').format(amount || 0)}`;
  }

  /**
   * Format Currency helper for PDF (pure ASCII 'Rs.' to prevent jsPDF font corruption & spacing issues)
   */
  static formatPdfCurrency(amount: number): string {
    const val = Math.round(Number(amount) || 0);
    return `Rs. ${val.toLocaleString('en-IN')}`;
  }
}
