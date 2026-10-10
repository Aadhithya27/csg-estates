import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Home,
  User,
  Phone,
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Zap,
  Droplets,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { FinanceService } from '../../services/finance';
import { OccupancyStatus, Property, RentalHome } from '../../types';
import { Modal } from '../layout/Modal';
import { useToast } from '../../context/ToastContext';

interface PropertiesListProps {
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: (actionType: string) => void;
}

export const PropertiesList: React.FC<PropertiesListProps> = ({
  setActiveTab,
  onOpenQuickAction,
}) => {
  const {
    properties,
    homes,
    bills,
    payments,
    addProperty,
    updateProperty,
    deleteProperty,
    addHome,
    updateHome,
    deleteHome,
    createBill,
    selectedMonth,
  } = useData();

  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(properties[0]?.id || null);

  // Property Modal State
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propNotes, setPropNotes] = useState('');

  // Rental Home Modal State
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState<RentalHome | null>(null);
  const [homePropertyId, setHomePropertyId] = useState('');
  const [homeHouseNumber, setHomeHouseNumber] = useState('');
  const [homeTenantName, setHomeTenantName] = useState('');
  const [homeTenantPhone, setHomeTenantPhone] = useState('');
  const [homeMonthlyRent, setHomeMonthlyRent] = useState('');
  const [homeSecurityDeposit, setHomeSecurityDeposit] = useState('');
  const [homeElecCharge, setHomeElecCharge] = useState('0');
  const [homeWaterCharge, setHomeWaterCharge] = useState('0');
  const [homeOtherCharges, setHomeOtherCharges] = useState('0');
  const [homeDueDate, setHomeDueDate] = useState('5th of every month');
  const [homeOccupancy, setHomeOccupancy] = useState<OccupancyStatus>('Occupied');
  const [homeNotes, setHomeNotes] = useState('');

  // Home Payment History Modal State
  const [historyHome, setHistoryHome] = useState<RentalHome | null>(null);

  // PROPERTY MODAL HANDLERS
  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setPropName('');
    setPropAddress('');
    setPropCity('');
    setPropNotes('');
    setIsPropModalOpen(true);
  };

  const openEditPropertyModal = (p: Property) => {
    setEditingProperty(p);
    setPropName(p.name);
    setPropAddress(p.address);
    setPropCity(p.city);
    setPropNotes(p.notes || '');
    setIsPropModalOpen(true);
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propAddress) {
      alert('Please fill out property name and address.');
      return;
    }

    if (editingProperty) {
      updateProperty(editingProperty.id, {
        name: propName,
        address: propAddress,
        city: propCity,
        notes: propNotes,
      });
      showToast(`Property "${propName}" updated!`, undefined, 'success');
    } else {
      const created = addProperty({
        name: propName,
        address: propAddress,
        city: propCity,
        notes: propNotes,
      });
      setExpandedPropertyId(created.id);
      showToast(`Property "${propName}" created!`, undefined, 'success');
    }

    setIsPropModalOpen(false);
  };

  const handleDeleteProperty = (p: Property) => {
    if (confirm(`Are you sure you want to delete property "${p.name}"? All homes inside will also be removed.`)) {
      deleteProperty(p.id);
      showToast(`Property "${p.name}" deleted.`, undefined, 'info');
    }
  };

  // RENTAL HOME MODAL HANDLERS
  const openAddHomeModal = (propertyId: string) => {
    setEditingHome(null);
    setHomePropertyId(propertyId);
    setHomeHouseNumber('');
    setHomeTenantName('');
    setHomeTenantPhone('');
    setHomeMonthlyRent('');
    setHomeSecurityDeposit('');
    setHomeElecCharge('0');
    setHomeWaterCharge('0');
    setHomeOtherCharges('0');
    setHomeDueDate('5th of every month');
    setHomeOccupancy('Occupied');
    setHomeNotes('');
    setIsHomeModalOpen(true);
  };

  const openEditHomeModal = (h: RentalHome) => {
    setEditingHome(h);
    setHomePropertyId(h.propertyId);
    setHomeHouseNumber(h.houseNumber);
    setHomeTenantName(h.tenantName || '');
    setHomeTenantPhone(h.tenantPhone || '');
    setHomeMonthlyRent(String(h.monthlyRent));
    setHomeSecurityDeposit(String(h.securityDeposit));
    setHomeElecCharge(String(h.electricityCharge || 0));
    setHomeWaterCharge(String(h.waterCharge || 0));
    setHomeOtherCharges(String(h.otherCharges || 0));
    setHomeDueDate(h.dueDate || '5th of every month');
    setHomeOccupancy(h.occupancyStatus);
    setHomeNotes(h.notes || '');
    setIsHomeModalOpen(true);
  };

  const handleHomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homePropertyId || !homeHouseNumber || !homeMonthlyRent) {
      alert('Please fill out house number and monthly rent.');
      return;
    }

    if (editingHome) {
      updateHome(editingHome.id, {
        propertyId: homePropertyId,
        houseNumber: homeHouseNumber,
        tenantName: homeTenantName,
        tenantPhone: homeTenantPhone,
        monthlyRent: parseFloat(homeMonthlyRent),
        securityDeposit: parseFloat(homeSecurityDeposit) || 0,
        electricityCharge: parseFloat(homeElecCharge) || 0,
        waterCharge: parseFloat(homeWaterCharge) || 0,
        otherCharges: parseFloat(homeOtherCharges) || 0,
        dueDate: homeDueDate,
        occupancyStatus: homeOccupancy,
        notes: homeNotes,
      });
      showToast(`Home "${homeHouseNumber}" updated!`, undefined, 'success');
    } else {
      addHome({
        propertyId: homePropertyId,
        houseNumber: homeHouseNumber,
        tenantName: homeTenantName,
        tenantPhone: homeTenantPhone,
        monthlyRent: parseFloat(homeMonthlyRent),
        securityDeposit: parseFloat(homeSecurityDeposit) || 0,
        electricityCharge: parseFloat(homeElecCharge) || 0,
        waterCharge: parseFloat(homeWaterCharge) || 0,
        otherCharges: parseFloat(homeOtherCharges) || 0,
        dueDate: homeDueDate,
        occupancyStatus: homeOccupancy,
        notes: homeNotes,
      });
      showToast(`Rental Home "${homeHouseNumber}" created!`, undefined, 'success');
    }

    setIsHomeModalOpen(false);
  };

  const handleDeleteHome = (h: RentalHome) => {
    if (confirm(`Are you sure you want to delete "${h.houseNumber}"?`)) {
      deleteHome(h.id);
      showToast(`Home "${h.houseNumber}" deleted.`, undefined, 'info');
    }
  };

  const handleCreateBillForHome = (h: RentalHome) => {
    createBill({
      homeId: h.id,
      propertyId: h.propertyId,
      billingMonth: selectedMonth,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: `${selectedMonth}-05`,
      rentAmount: h.monthlyRent,
      electricityCharge: h.electricityCharge || 0,
      waterCharge: h.waterCharge || 0,
      otherCharges: h.otherCharges || 0,
      previousBalance: 0,
      amountPaid: 0,
    });
    showToast(`Monthly Bill generated for ${h.houseNumber}!`, undefined, 'success');
    setActiveTab('bills');
  };

  // Filter Properties
  const filteredProperties = properties.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Properties & Rental Homes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Main owner section: Add, view, edit & manage properties and houses inside
          </p>
        </div>

        <button
          onClick={openAddPropertyModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property name, address, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* PROPERTY ACCORDION / CARDS LIST */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No properties found. Click "Add New Property" to start.
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const propHomes = homes.filter((h) => h.propertyId === prop.id);
            const isExpanded = expandedPropertyId === prop.id;

            const totalPropRent = propHomes
              .filter((h) => h.occupancyStatus === 'Occupied')
              .reduce((sum, h) => sum + h.monthlyRent, 0);

            return (
              <div
                key={prop.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all"
              >
                {/* Property Header Bar */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-colors border-b border-slate-800/80"
                  onClick={() => setExpandedPropertyId(isExpanded ? null : prop.id)}
                >
                  <div className="flex items-center space-x-3.5 overflow-hidden">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h3 className="text-base font-extrabold text-white truncate">{prop.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{prop.address}, {prop.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="hidden sm:block text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Rent</span>
                      <span className="text-xs font-extrabold text-emerald-400">
                        {FinanceService.formatCurrency(totalPropRent)}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-full">
                      {propHomes.length} Homes
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPropertyModal(prop);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      title="Edit Property"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(prop);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                      title="Delete Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* EXPANDED HOMES LIST INSIDE PROPERTY */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 bg-slate-900/60">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Rental Homes inside {prop.name} ({propHomes.length})
                      </h4>

                      <button
                        onClick={() => openAddHomeModal(prop.id)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rental Home</span>
                      </button>
                    </div>

                    {/* Rental Homes List Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {propHomes.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                          No rental homes added yet inside this property.
                        </div>
                      ) : (
                        propHomes.map((home) => (
                          <div
                            key={home.id}
                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                          >
                            <div>
                              {/* Home Door Header */}
                              <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h5 className="text-sm font-extrabold text-slate-100">{home.houseNumber}</h5>
                                  </div>
                                  <p className="text-xs font-bold text-emerald-400 mt-0.5">
                                    ₹{home.monthlyRent.toLocaleString()}/month
                                  </p>
                                </div>

                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                    home.occupancyStatus === 'Occupied'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : home.occupancyStatus === 'Vacant'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {home.occupancyStatus}
                                </span>
                              </div>

                              {/* Tenant Info */}
                              <div className="py-3 space-y-1.5 text-xs">
                                {home.occupancyStatus === 'Occupied' ? (
                                  <>
                                    <div className="flex items-center space-x-2 text-slate-200">
                                      <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                      <span className="font-bold">{home.tenantName || 'Tenant'}</span>
                                    </div>

                                    {home.tenantPhone && (
                                      <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span>{home.tenantPhone}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-[11px] text-slate-500 italic py-1">
                                    {home.occupancyStatus === 'Vacant'
                                      ? 'Vacant home ready for tenant'
                                      : 'Under maintenance work'}
                                  </p>
                                )}

                                <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-xl space-y-1 text-[11px] mt-2">
                                  <div className="flex justify-between text-slate-400">
                                    <span>Security Deposit:</span>
                                    <span className="font-semibold text-slate-200">₹{home.securityDeposit.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>Electricity / Water:</span>
                                    <span className="font-semibold text-slate-300">
                                      ₹{home.electricityCharge} + ₹{home.waterCharge}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-slate-400">
                                    <span>Due Date:</span>
                                    <span className="font-semibold text-amber-400">{home.dueDate}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                              {home.occupancyStatus === 'Occupied' ? (
                                <button
                                  onClick={() => handleCreateBillForHome(home)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-sm flex items-center space-x-1"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                  <span>Create Bill</span>
                                </button>
                              ) : (
                                <div></div>
                              )}

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => setHistoryHome(home)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg"
                                  title="Payment History"
                                >
                                  <History className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => openEditHomeModal(home)}
                                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                  title="Edit Rental Home"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteHome(home)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                                  title="Delete Rental Home"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT PROPERTY MODAL */}
      <Modal
        isOpen={isPropModalOpen}
        onClose={() => setIsPropModalOpen(false)}
        title={editingProperty ? 'Edit Property' : 'Add New Property'}
        subtitle="Specify building name and address"
        maxWidth="md"
      >
        <form onSubmit={handlePropertySubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Property Name *</label>
            <input
              type="text"
              value={propName}
              onChange={(e) => setPropName(e.target.value)}
              placeholder="e.g. Anna Nagar Building"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Address *</label>
            <input
              type="text"
              value={propAddress}
              onChange={(e) => setPropAddress(e.target.value)}
              placeholder="No. 15, 4th Avenue, Anna Nagar"
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">City</label>
            <input
              type="text"
              value={propCity}
              onChange={(e) => setPropCity(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPropModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
            >
              {editingProperty ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD / EDIT RENTAL HOME MODAL */}
      <Modal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
        title={editingHome ? 'Edit Rental Home' : 'Add Rental Home'}
        subtitle="Manage house number, tenant details & monthly charges"
        maxWidth="lg"
      >
        <form onSubmit={handleHomeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Property *</label>
            <select
              value={homePropertyId}
              onChange={(e) => setHomePropertyId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">House / Unit Number *</label>
              <input
                type="text"
                value={homeHouseNumber}
                onChange={(e) => setHomeHouseNumber(e.target.value)}
                placeholder="e.g. House 101 or Flat 201"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Occupancy Status</label>
              <select
                value={homeOccupancy}
                onChange={(e) => setHomeOccupancy(e.target.value as OccupancyStatus)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenant Name</label>
              <input
                type="text"
                value={homeTenantName}
                onChange={(e) => setHomeTenantName(e.target.value)}
                placeholder="e.g. Full Name"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tenant Phone Number</label>
              <input
                type="text"
                value={homeTenantPhone}
                onChange={(e) => setHomeTenantPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Monthly Charges */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Monthly Base Rent (₹) *</label>
              <input
                type="number"
                value={homeMonthlyRent}
                onChange={(e) => setHomeMonthlyRent(e.target.value)}
                placeholder="e.g. 12000"
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={homeSecurityDeposit}
                onChange={(e) => setHomeSecurityDeposit(e.target.value)}
                placeholder="e.g. 60000"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Electricity Charge (₹)</label>
              <input
                type="number"
                value={homeElecCharge}
                onChange={(e) => setHomeElecCharge(e.target.value)}
                placeholder="1000"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Water Charge (₹)</label>
              <input
                type="number"
                value={homeWaterCharge}
                onChange={(e) => setHomeWaterCharge(e.target.value)}
                placeholder="400"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Due Date Rule</label>
              <input
                type="text"
                value={homeDueDate}
                onChange={(e) => setHomeDueDate(e.target.value)}
                placeholder="5th of every month"
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsHomeModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30"
            >
              {editingHome ? 'Save Changes' : 'Create Rental Home'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RENTAL HOME PAYMENT HISTORY MODAL */}
      {historyHome && (
        <Modal
          isOpen={!!historyHome}
          onClose={() => setHistoryHome(null)}
          title={`Payment History — ${historyHome.houseNumber}`}
          subtitle={`Tenant: ${historyHome.tenantName || 'N/A'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {(() => {
              const homeBills = bills.filter((b) => b.homeId === historyHome.id);

              return (
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="p-3 bg-slate-900 font-bold text-slate-300 grid grid-cols-5 text-center">
                    <span>Month</span>
                    <span>Bill</span>
                    <span>Paid</span>
                    <span>Balance</span>
                    <span>Status</span>
                  </div>

                  {homeBills.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No payment history bills generated yet.</div>
                  ) : (
                    homeBills.map((b) => (
                      <div key={b.id} className="p-3 grid grid-cols-5 text-center items-center font-medium">
                        <span className="text-slate-200">{b.billingMonth}</span>
                        <span className="text-slate-100 font-bold">₹{b.totalAmount.toLocaleString()}</span>
                        <span className="text-emerald-400 font-bold">₹{b.amountPaid.toLocaleString()}</span>
                        <span className="text-rose-400 font-bold">₹{b.remainingAmount.toLocaleString()}</span>
                        <div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              b.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : b.status === 'Partial'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};
