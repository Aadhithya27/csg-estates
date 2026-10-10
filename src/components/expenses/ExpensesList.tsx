import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Edit3,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FinanceService } from '../../services/finance';
import { Expense } from '../../types';
import { Modal } from '../layout/Modal';
import { useToast } from '../../context/ToastContext';

interface ExpensesListProps {
  onOpenQuickAction: (actionType: string) => void;
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ onOpenQuickAction }) => {
  const {
    expenses,
    properties,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useData();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formPropertyId, setFormPropertyId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormPropertyId(properties[0]?.id || '');
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (e: Expense) => {
    setEditingExpense(e);
    setFormPropertyId(e.propertyId);
    setFormDescription(e.description);
    setFormAmount(String(e.amount));
    setFormDate(e.date);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPropertyId || !formDescription || !formAmount) {
      alert('Please fill out description and amount.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        propertyId: formPropertyId,
        description: formDescription,
        amount: parseFloat(formAmount),
        date: formDate,
      });
      showToast(`Expense updated!`, undefined, 'success');
    } else {
      addExpense({
        propertyId: formPropertyId,
        description: formDescription,
        amount: parseFloat(formAmount),
        date: formDate,
      });
      showToast(`Expense ₹${formAmount} recorded!`, undefined, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (e: Expense) => {
    if (confirm(`Are you sure you want to delete expense "${e.description}"?`)) {
      deleteExpense(e.id);
      showToast(`Expense deleted.`, undefined, 'info');
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const prop = properties.find((p) => p.id === e.propertyId);
    const matchesQuery =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop && prop.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesQuery;
  });

  const totalExpenseSum = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Property Expenses</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log repairs, plumbing, electrical & maintenance bills (affects Net Income)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter & Total Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense description, property..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black rounded-xl text-xs flex items-center space-x-2 shrink-0">
          <TrendingDown className="w-4 h-4" />
          <span>Total Expenses: {FinanceService.formatCurrency(totalExpenseSum)}</span>
        </div>
      </div>

      {/* Expense Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExpenses.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No expenses logged. Click "Add Expense" above.
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const prop = properties.find((p) => p.id === exp.propertyId);

            return (
              <div
                key={exp.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{prop?.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{exp.date}</span>
                  </div>

                  <div className="py-3">
                    <h4 className="text-sm font-bold text-slate-100">{exp.description}</h4>
                    <p className="text-lg font-black text-rose-400 mt-2">
                      -{FinanceService.formatCurrency(exp.amount)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                    title="Edit Expense"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(exp)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Property Expense'}
        subtitle="Log repairs, plumbing, electrical, or painting costs"
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Property *</label>
            <select
              value={formPropertyId}
              onChange={(e) => setFormPropertyId(e.target.value)}
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
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Plumbing repair for House 102"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="2500"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30"
            >
              {editingExpense ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
