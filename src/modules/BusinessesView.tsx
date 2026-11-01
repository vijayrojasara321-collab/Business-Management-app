/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileCheck,
  Tag,
  Trash2,
  Edit2,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  Palette,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Business, BusinessContact, BankAccount, BusinessRegistration, BusinessActivity } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface BusinessesViewProps {
  state: AppDatabaseState;
  onNavigateToPerson?: (personId: string) => void;
}

const PRESET_ACTIVITIES = [
  'Export – Retail',
  'Export – Wholesale',
  'Export – Industrial Bulk',
  'Import',
  'Domestic Retail',
  'Domestic Wholesale',
  'Sales',
  'Purchase',
  'Marketing',
  'Accounts and Finance',
  'Logistics and Shipping',
  'Documentation',
  'Operations',
  'Production',
  'Quality Assurance',
];

const PRESET_COLORS = ['#0284c7', '#2563eb', '#6366f1', '#7c3aed', '#059669', '#d97706', '#dc2626', '#475569'];

export const BusinessesView: React.FC<BusinessesViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Tab in View Details Modal
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'banking' | 'registrations' | 'activities' | 'associations'>('info');

  // Form State for Add / Edit Business
  const [isEditing, setIsEditing] = useState(false);
  const [formBusiness, setFormBusiness] = useState<Partial<Business>>({});
  const [formTab, setFormTab] = useState<'info' | 'contacts' | 'banking' | 'registrations' | 'activities'>('info');

  // Temporary item inputs for form tabs
  const [newContact, setNewContact] = useState<Partial<BusinessContact>>({
    label: 'Head Office',
    phone: '',
    email: '',
    address: '',
    isPrimary: false,
  });
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  const [newBank, setNewBank] = useState<Partial<BankAccount>>({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    accountType: 'Current',
    upiId: '',
    additionalUpiIds: [],
    isPrimary: false,
  });
  const [showAddBankForm, setShowAddBankForm] = useState(false);

  const [newReg, setNewReg] = useState<Partial<BusinessRegistration>>({
    title: '',
    gstin: '',
    registrationType: 'Regular GST',
    state: '',
    expiryDate: '',
    renewalReminderDays: 30,
    notes: '',
  });
  const [showAddRegForm, setShowAddRegForm] = useState(false);

  const [customActivityInput, setCustomActivityInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(state.businesses.map((b) => b.category)))];

  const filteredBusinesses = state.businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      name: '',
      logoColor: '#0284c7',
      logoIcon: 'Building2',
      category: 'Export & International Trade',
      type: 'Private Limited',
      description: '',
      registrationNumber: '',
      website: '',
      status: 'Active',
      establishmentDate: new Date().toISOString().split('T')[0],
      contacts: [
        {
          id: `cnt-${Date.now()}-1`,
          label: 'Headquarters & Admin Office',
          phone: '',
          email: '',
          address: '',
          isPrimary: true,
        },
      ],
      bankAccounts: [],
      registrations: [],
      activities: [
        { id: `act-${Date.now()}-1`, name: 'Export – Wholesale', isDefault: true },
        { id: `act-${Date.now()}-2`, name: 'Logistics and Shipping', isDefault: true },
        { id: `act-${Date.now()}-3`, name: 'Accounts and Finance', isDefault: true },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFormBusiness(newBiz);
    setFormTab('info');
    setShowAddContactForm(false);
    setShowAddBankForm(false);
    setShowAddRegForm(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (biz: Business) => {
    setFormBusiness(JSON.parse(JSON.stringify(biz)));
    setFormTab('info');
    setShowAddContactForm(false);
    setShowAddBankForm(false);
    setShowAddRegForm(false);
    setIsEditing(true);
  };

  const handleSaveBusiness = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formBusiness.name?.trim()) {
      showToast('Business name is required', 'error');
      setFormTab('info');
      return;
    }
    const finalBiz: Business = {
      ...(formBusiness as Business),
      contacts: formBusiness.contacts || [],
      bankAccounts: formBusiness.bankAccounts || [],
      registrations: formBusiness.registrations || [],
      activities: formBusiness.activities || [],
      updatedAt: Date.now(),
    };
    storageService.saveBusiness(finalBiz);
    showToast(`Business "${finalBiz.name}" saved successfully`);
    setIsEditing(false);
    setSelectedBusiness(finalBiz);
  };

  const handleDeleteBusiness = (id: string) => {
    storageService.deleteBusiness(id);
    showToast('Business removed');
    setDeleteConfirmId(null);
    if (selectedBusiness?.id === id) {
      setSelectedBusiness(null);
    }
  };

  // --- SUB-ITEM HANDLERS FOR ADD/EDIT FORM ---

  // Contacts
  const handleAddContactToForm = () => {
    if (!newContact.phone?.trim() && !newContact.email?.trim()) {
      showToast('Please enter at least a phone or email', 'error');
      return;
    }
    const contactItem: BusinessContact = {
      id: `cnt-${Date.now()}`,
      label: newContact.label || 'Branch Office',
      phone: newContact.phone || '',
      email: newContact.email || '',
      address: newContact.address || '',
      isPrimary: newContact.isPrimary || (formBusiness.contacts || []).length === 0,
    };

    let updatedContacts = [...(formBusiness.contacts || [])];
    if (contactItem.isPrimary) {
      updatedContacts = updatedContacts.map((c) => ({ ...c, isPrimary: false }));
    }
    updatedContacts.push(contactItem);

    setFormBusiness({ ...formBusiness, contacts: updatedContacts });
    setNewContact({ label: 'Branch Office', phone: '', email: '', address: '', isPrimary: false });
    setShowAddContactForm(false);
    showToast('Contact added to business');
  };

  const handleRemoveContactFromForm = (id: string) => {
    const updated = (formBusiness.contacts || []).filter((c) => c.id !== id);
    setFormBusiness({ ...formBusiness, contacts: updated });
  };

  const handleSetPrimaryContactInForm = (id: string) => {
    const updated = (formBusiness.contacts || []).map((c) => ({
      ...c,
      isPrimary: c.id === id,
    }));
    setFormBusiness({ ...formBusiness, contacts: updated });
  };

  // Bank Accounts
  const handleAddBankToForm = () => {
    if (!newBank.bankName?.trim() || !newBank.accountNumber?.trim()) {
      showToast('Bank name and account number are required', 'error');
      return;
    }
    const bankItem: BankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBank.bankName || '',
      accountHolder: newBank.accountHolder || formBusiness.name || '',
      accountNumber: newBank.accountNumber || '',
      ifsc: newBank.ifsc || '',
      branch: newBank.branch || '',
      accountType: newBank.accountType || 'Current',
      upiId: newBank.upiId || '',
      additionalUpiIds: newBank.additionalUpiIds || [],
      isPrimary: newBank.isPrimary || (formBusiness.bankAccounts || []).length === 0,
    };

    let updatedBanks = [...(formBusiness.bankAccounts || [])];
    if (bankItem.isPrimary) {
      updatedBanks = updatedBanks.map((b) => ({ ...b, isPrimary: false }));
    }
    updatedBanks.push(bankItem);

    setFormBusiness({ ...formBusiness, bankAccounts: updatedBanks });
    setNewBank({
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      ifsc: '',
      branch: '',
      accountType: 'Current',
      upiId: '',
      additionalUpiIds: [],
      isPrimary: false,
    });
    setShowAddBankForm(false);
    showToast('Bank account added to business');
  };

  const handleRemoveBankFromForm = (id: string) => {
    const updated = (formBusiness.bankAccounts || []).filter((b) => b.id !== id);
    setFormBusiness({ ...formBusiness, bankAccounts: updated });
  };

  const handleSetPrimaryBankInForm = (id: string) => {
    const updated = (formBusiness.bankAccounts || []).map((b) => ({
      ...b,
      isPrimary: b.id === id,
    }));
    setFormBusiness({ ...formBusiness, bankAccounts: updated });
  };

  // Registrations
  const handleAddRegToForm = () => {
    if (!newReg.title?.trim()) {
      showToast('Registration title is required', 'error');
      return;
    }
    const regItem: BusinessRegistration = {
      id: `reg-${Date.now()}`,
      title: newReg.title || '',
      gstin: newReg.gstin || '',
      registrationType: newReg.registrationType || 'Regular GST',
      state: newReg.state || '',
      expiryDate: newReg.expiryDate || '',
      renewalReminderDays: newReg.renewalReminderDays || 30,
      notes: newReg.notes || '',
    };
    const updated = [...(formBusiness.registrations || []), regItem];
    setFormBusiness({ ...formBusiness, registrations: updated });
    setNewReg({
      title: '',
      gstin: '',
      registrationType: 'Regular GST',
      state: '',
      expiryDate: '',
      renewalReminderDays: 30,
      notes: '',
    });
    setShowAddRegForm(false);
    showToast('Registration/License added');
  };

  const handleRemoveRegFromForm = (id: string) => {
    const updated = (formBusiness.registrations || []).filter((r) => r.id !== id);
    setFormBusiness({ ...formBusiness, registrations: updated });
  };

  // Activities
  const handleAddActivityToForm = (name: string) => {
    if (!name.trim()) return;
    const current = formBusiness.activities || [];
    if (current.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) {
      showToast('Activity already added', 'info');
      return;
    }
    const updated = [...current, { id: `act-${Date.now()}`, name: name.trim() }];
    setFormBusiness({ ...formBusiness, activities: updated });
    setCustomActivityInput('');
  };

  const handleRemoveActivityFromForm = (id: string) => {
    const updated = (formBusiness.activities || []).filter((a) => a.id !== id);
    setFormBusiness({ ...formBusiness, activities: updated });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Business Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            {state.businesses.length} multi-enterprise profiles with complete contact, banking, GSTIN & activity configurations
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Business
        </button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business name, registration number, category..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBusinesses.map((biz) => {
          const associatedPeople = state.people.filter((p) =>
            p.businessAssociations.some((a) => a.businessId === biz.id)
          );
          const primaryContact = biz.contacts.find((c) => c.isPrimary) || biz.contacts[0];
          const primaryBank = biz.bankAccounts.find((b) => b.isPrimary) || biz.bankAccounts[0];

          return (
            <div
              key={biz.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-base flex-shrink-0"
                      style={{ backgroundColor: biz.logoColor || '#0284c7' }}
                    >
                      {biz.name ? biz.name.slice(0, 2).toUpperCase() : 'BZ'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{biz.name}</h3>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            biz.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {biz.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {biz.type} • {biz.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(biz)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit business"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(biz.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete business"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {biz.description || 'No description provided.'}
                </p>

                {/* Key Quick Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  {biz.registrationNumber && (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                      Reg: {biz.registrationNumber}
                    </span>
                  )}
                  {primaryBank && (
                    <span className="px-2 py-0.5 bg-sky-950/60 text-sky-300 rounded-md border border-sky-800/40">
                      {primaryBank.bankName} • {primaryBank.accountNumber.slice(-4)}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-indigo-950/60 text-indigo-300 rounded-md border border-indigo-800/40">
                    {associatedPeople.length} People Linked
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 rounded-md border border-emerald-800/40">
                    {biz.activities.length} Activities
                  </span>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {primaryContact && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-sky-400" />
                      {primaryContact.phone || primaryContact.email}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedBusiness(biz);
                    setActiveTab('info');
                  }}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  View Full Profile <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Business Details Modal (View Mode) */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ backgroundColor: selectedBusiness.logoColor || '#0284c7' }}
                >
                  {selectedBusiness.name ? selectedBusiness.name.slice(0, 2).toUpperCase() : 'BZ'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBusiness.name}</h3>
                  <p className="text-xs text-slate-400">
                    Est: {selectedBusiness.establishmentDate} • {selectedBusiness.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedBusiness);
                  }}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit All Details
                </button>
                <button
                  onClick={() => setSelectedBusiness(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/90 overflow-x-auto text-xs px-2">
              {[
                { id: 'info', label: 'Overview' },
                { id: 'contacts', label: `Contacts (${selectedBusiness.contacts.length})` },
                { id: 'banking', label: `Banking (${selectedBusiness.bankAccounts.length})` },
                { id: 'registrations', label: `GST & Licences (${selectedBusiness.registrations.length})` },
                { id: 'activities', label: `Activities (${selectedBusiness.activities.length})` },
                { id: 'associations', label: 'People Linked' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2.5 font-semibold whitespace-nowrap border-b-2 transition ${
                    activeTab === t.id
                      ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                      About Enterprise
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedBusiness.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Constitution Type</span>
                      <p className="font-semibold text-white mt-0.5">{selectedBusiness.type}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Registration / CIN</span>
                      <p className="font-semibold text-white mt-0.5 font-mono">
                        {selectedBusiness.registrationNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400">Establishment Date</span>
                      <p className="font-semibold text-white mt-0.5 font-mono">
                        {selectedBusiness.establishmentDate}
                      </p>
                    </div>
                    {selectedBusiness.website && (
                      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 col-span-2">
                        <span className="text-[10px] text-slate-400">Official Website</span>
                        <a
                          href={selectedBusiness.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-sky-400 hover:underline mt-0.5 flex items-center gap-1"
                        >
                          {selectedBusiness.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleOpenEdit(selectedBusiness);
                        setFormTab('contacts');
                        setShowAddContactForm(true);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Branch / Contact
                    </button>
                  </div>
                  {selectedBusiness.contacts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No contacts added yet</p>
                  ) : (
                    selectedBusiness.contacts.map((cnt) => (
                      <div
                        key={cnt.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{cnt.label}</span>
                            {cnt.isPrimary && (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                                Primary Office
                              </span>
                            )}
                          </div>
                          {cnt.phone && (
                            <p className="text-slate-300 flex items-center gap-1.5 mt-1">
                              <Phone className="w-3 h-3 text-sky-400" /> {cnt.phone}
                            </p>
                          )}
                          {cnt.email && (
                            <p className="text-slate-300 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-indigo-400" /> {cnt.email}
                            </p>
                          )}
                          {cnt.address && (
                            <p className="text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-rose-400" /> {cnt.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'banking' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleOpenEdit(selectedBusiness);
                        setFormTab('banking');
                        setShowAddBankForm(true);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Bank Account
                    </button>
                  </div>
                  {selectedBusiness.bankAccounts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No bank accounts added</p>
                  ) : (
                    selectedBusiness.bankAccounts.map((bank) => (
                      <div
                        key={bank.id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-sky-400" />
                            <span className="font-bold text-white text-sm">{bank.bankName}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                              {bank.accountType}
                            </span>
                          </div>
                          {bank.isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                              Primary Account
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                          <p>
                            <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                            <span className="font-medium text-white">{bank.accountHolder}</span>
                          </p>
                          <p>
                            <span className="text-slate-500 block text-[10px]">Account Number:</span>
                            <span className="font-mono text-white font-semibold">{bank.accountNumber}</span>
                          </p>
                          <p>
                            <span className="text-slate-500 block text-[10px]">IFSC Code:</span>
                            <span className="font-mono text-white">{bank.ifsc}</span>
                          </p>
                          <p>
                            <span className="text-slate-500 block text-[10px]">Branch:</span>
                            <span className="text-slate-300">{bank.branch}</span>
                          </p>
                          {bank.upiId && (
                            <p className="col-span-2">
                              <span className="text-slate-500 block text-[10px]">Primary UPI ID:</span>
                              <span className="font-mono text-sky-300 font-semibold">{bank.upiId}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'registrations' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        handleOpenEdit(selectedBusiness);
                        setFormTab('registrations');
                        setShowAddRegForm(true);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Registration / License
                    </button>
                  </div>
                  {selectedBusiness.registrations.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No registrations or licenses added</p>
                  ) : (
                    selectedBusiness.registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> {reg.title}
                          </span>
                          {reg.expiryDate && (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">
                              Exp: {reg.expiryDate}
                            </span>
                          )}
                        </div>
                        {reg.gstin && (
                          <p className="font-mono text-sky-300 font-semibold">GSTIN / Number: {reg.gstin}</p>
                        )}
                        {reg.state && <p className="text-slate-400">Jurisdiction / State: {reg.state}</p>}
                        {reg.notes && <p className="text-slate-400 italic text-[11px] mt-1">{reg.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium">Configured Business Operations</span>
                    <button
                      onClick={() => {
                        handleOpenEdit(selectedBusiness);
                        setFormTab('activities');
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Manage Activities
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedBusiness.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-200 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-sky-400" />
                          {act.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'associations' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Associated Partners & Employees
                  </h4>
                  {state.people
                    .filter((p) => p.businessAssociations.some((a) => a.businessId === selectedBusiness.id))
                    .map((person) => {
                      const assoc = person.businessAssociations.find(
                        (a) => a.businessId === selectedBusiness.id
                      )!;
                      return (
                        <div
                          key={person.id}
                          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{person.fullName}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                                {assoc.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-sky-400 mt-0.5">{assoc.designation}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Activities: {assoc.activities.join(', ') || 'General Management'}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Joined: {assoc.joiningDate}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULL COMPLETE TABBED ADD / EDIT BUSINESS MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                  style={{ backgroundColor: formBusiness.logoColor || '#0284c7' }}
                >
                  {formBusiness.name ? formBusiness.name.slice(0, 2).toUpperCase() : 'BZ'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {formBusiness.name ? `Edit Business: ${formBusiness.name}` : 'Add New Enterprise'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Fill in all essential business, contact, banking, and registration details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Section Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/90 overflow-x-auto px-2">
              {[
                { id: 'info', label: '1. Basic Info' },
                { id: 'contacts', label: `2. Contacts (${(formBusiness.contacts || []).length})` },
                { id: 'banking', label: `3. Banking & UPI (${(formBusiness.bankAccounts || []).length})` },
                { id: 'registrations', label: `4. GSTIN & Licences (${(formBusiness.registrations || []).length})` },
                { id: 'activities', label: `5. Activities (${(formBusiness.activities || []).length})` },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setFormTab(tabItem.id as any)}
                  className={`px-3.5 py-2.5 font-semibold whitespace-nowrap border-b-2 transition ${
                    formTab === tabItem.id
                      ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* Form Body - Render selected tab */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: BASIC INFO */}
              {formTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formBusiness.name || ''}
                        onChange={(e) => setFormBusiness({ ...formBusiness, name: e.target.value })}
                        placeholder="e.g. Apex Global Exports Pvt Ltd"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-sky-500 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Category
                      </label>
                      <select
                        value={formBusiness.category || 'Export & International Trade'}
                        onChange={(e) => setFormBusiness({ ...formBusiness, category: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      >
                        <option>Export & International Trade</option>
                        <option>Manufacturing & Industrial</option>
                        <option>Information Technology & SaaS</option>
                        <option>Domestic Wholesale & Trading</option>
                        <option>Logistics & Shipping</option>
                        <option>Agri Processing & Mandi</option>
                        <option>Retail & Distribution</option>
                        <option>Consulting & Professional Services</option>
                        <option>Healthcare & Pharmaceuticals</option>
                        <option>Hospitality & Real Estate</option>
                        <option>Other Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Constitution Type
                      </label>
                      <select
                        value={formBusiness.type || 'Private Limited'}
                        onChange={(e) => setFormBusiness({ ...formBusiness, type: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      >
                        <option>Private Limited</option>
                        <option>Limited Liability Partnership (LLP)</option>
                        <option>Partnership Firm</option>
                        <option>Sole Proprietorship</option>
                        <option>Public Limited</option>
                        <option>Trust / Society / Section 8</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Registration / CIN Number
                      </label>
                      <input
                        type="text"
                        value={formBusiness.registrationNumber || ''}
                        onChange={(e) => setFormBusiness({ ...formBusiness, registrationNumber: e.target.value })}
                        placeholder="e.g. U51909GJ2018PTC104521"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Establishment Date
                      </label>
                      <input
                        type="date"
                        value={formBusiness.establishmentDate || ''}
                        onChange={(e) => setFormBusiness({ ...formBusiness, establishmentDate: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Operating Status
                      </label>
                      <select
                        value={formBusiness.status || 'Active'}
                        onChange={(e) => setFormBusiness({ ...formBusiness, status: e.target.value as any })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Brand Identity Theme Color
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        {PRESET_COLORS.map((clr) => (
                          <button
                            key={clr}
                            type="button"
                            onClick={() => setFormBusiness({ ...formBusiness, logoColor: clr })}
                            className={`w-6 h-6 rounded-full transition transform ${
                              formBusiness.logoColor === clr ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                            }`}
                            style={{ backgroundColor: clr }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={formBusiness.website || ''}
                        onChange={(e) => setFormBusiness({ ...formBusiness, website: e.target.value })}
                        placeholder="https://apexglobal.example.com"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                        Description & Line of Business
                      </label>
                      <textarea
                        rows={3}
                        value={formBusiness.description || ''}
                        onChange={(e) => setFormBusiness({ ...formBusiness, description: e.target.value })}
                        placeholder="Comprehensive summary of products, services, export destinations, facilities..."
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT DETAILS */}
              {formTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Business Branches & Contact Locations
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Add headquarters, factory yards, warehouses, or regional branches
                      </p>
                    </div>
                    {!showAddContactForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(true)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Contact / Branch
                      </button>
                    )}
                  </div>

                  {/* Add Contact Form Card */}
                  {showAddContactForm && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-sky-800/60 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 text-xs">New Contact Location</span>
                        <button
                          type="button"
                          onClick={() => setShowAddContactForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Location Label</label>
                          <input
                            type="text"
                            value={newContact.label || ''}
                            onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                            placeholder="e.g. Headquarters, Factory Unit 2, Port Office"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Phone Number</label>
                          <input
                            type="tel"
                            value={newContact.phone || ''}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            placeholder="+91 98250 12345"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Official Email</label>
                          <input
                            type="email"
                            value={newContact.email || ''}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            placeholder="contact@company.example"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Physical Address</label>
                          <input
                            type="text"
                            value={newContact.address || ''}
                            onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                            placeholder="Suite / Plot / City / State / PIN"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                          <input
                            type="checkbox"
                            checked={newContact.isPrimary || false}
                            onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                            className="rounded text-sky-500"
                          />
                          Set as Primary Contact for this business
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddContactForm(false)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddContactToForm}
                            className="px-4 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold"
                          >
                            Add Location
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List of contacts currently in form */}
                  <div className="space-y-2">
                    {(formBusiness.contacts || []).map((cnt) => (
                      <div
                        key={cnt.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{cnt.label}</span>
                            {cnt.isPrimary ? (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                                Primary Office
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryContactInForm(cnt.id)}
                                className="text-[10px] text-slate-400 hover:text-sky-300 underline"
                              >
                                Make Primary
                              </button>
                            )}
                          </div>
                          {cnt.phone && (
                            <p className="text-slate-300 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-sky-400" /> {cnt.phone}
                            </p>
                          )}
                          {cnt.email && (
                            <p className="text-slate-300 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-indigo-400" /> {cnt.email}
                            </p>
                          )}
                          {cnt.address && (
                            <p className="text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-rose-400" /> {cnt.address}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveContactFromForm(cnt.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: BANKING INFORMATION */}
              {formTab === 'banking' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Banking Accounts & UPI Identifiers
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Maintain multiple bank accounts, overdraft facilities & UPI handles
                      </p>
                    </div>
                    {!showAddBankForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddBankForm(true)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Bank Account
                      </button>
                    )}
                  </div>

                  {/* Add Bank Form Card */}
                  {showAddBankForm && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-sky-800/60 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 text-xs">New Bank Account</span>
                        <button
                          type="button"
                          onClick={() => setShowAddBankForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Bank Name *</label>
                          <input
                            type="text"
                            value={newBank.bankName || ''}
                            onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                            placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Account Holder *</label>
                          <input
                            type="text"
                            value={newBank.accountHolder || formBusiness.name || ''}
                            onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
                            placeholder="Official legal name on account"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Account Number *</label>
                          <input
                            type="text"
                            value={newBank.accountNumber || ''}
                            onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                            placeholder="e.g. 50200034891240"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">IFSC Code *</label>
                          <input
                            type="text"
                            value={newBank.ifsc || ''}
                            onChange={(e) => setNewBank({ ...newBank, ifsc: e.target.value.toUpperCase() })}
                            placeholder="e.g. HDFC0000084"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Branch Location</label>
                          <input
                            type="text"
                            value={newBank.branch || ''}
                            onChange={(e) => setNewBank({ ...newBank, branch: e.target.value })}
                            placeholder="e.g. Athwa Lines, Surat"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Account Type</label>
                          <select
                            value={newBank.accountType || 'Current'}
                            onChange={(e) => setNewBank({ ...newBank, accountType: e.target.value as any })}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          >
                            <option value="Current">Current Account</option>
                            <option value="Savings">Savings Account</option>
                            <option value="OD / CC">Overdraft / Cash Credit (OD/CC)</option>
                            <option value="Escrow">Escrow Account</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Official UPI ID</label>
                          <input
                            type="text"
                            value={newBank.upiId || ''}
                            onChange={(e) => setNewBank({ ...newBank, upiId: e.target.value })}
                            placeholder="e.g. business@hdfcbank"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                          <input
                            type="checkbox"
                            checked={newBank.isPrimary || false}
                            onChange={(e) => setNewBank({ ...newBank, isPrimary: e.target.checked })}
                            className="rounded text-sky-500"
                          />
                          Set as Primary Banking Account
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddBankForm(false)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddBankToForm}
                            className="px-4 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold"
                          >
                            Add Bank
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* List of banks currently in form */}
                  <div className="space-y-2">
                    {(formBusiness.bankAccounts || []).map((bank) => (
                      <div
                        key={bank.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{bank.bankName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                              {bank.accountType}
                            </span>
                            {bank.isPrimary ? (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                Primary Account
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryBankInForm(bank.id)}
                                className="text-[10px] text-slate-400 hover:text-sky-300 underline"
                              >
                                Make Primary
                              </button>
                            )}
                          </div>
                          <p className="text-slate-300 font-mono text-[11px]">
                            A/C: {bank.accountNumber} • IFSC: {bank.ifsc} • Branch: {bank.branch || 'Main'}
                          </p>
                          {bank.upiId && (
                            <p className="text-sky-300 font-mono text-[11px]">UPI: {bank.upiId}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBankFromForm(bank.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Remove bank"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: REGISTRATIONS & GSTIN */}
              {formTab === 'registrations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Registrations, Licenses & Tax Compliance
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Add multiple GSTINs, IEC, APEDA, FSSAI, MSME, or custom trade licenses
                      </p>
                    </div>
                    {!showAddRegForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddRegForm(true)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Registration
                      </button>
                    )}
                  </div>

                  {/* Add Registration Form Card */}
                  {showAddRegForm && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-sky-800/60 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 text-xs">New Licence / GSTIN Record</span>
                        <button
                          type="button"
                          onClick={() => setShowAddRegForm(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Registration Title *</label>
                          <input
                            type="text"
                            value={newReg.title || ''}
                            onChange={(e) => setNewReg({ ...newReg, title: e.target.value })}
                            placeholder="e.g. GSTIN Regular, IEC Code, FSSAI License"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">GSTIN / License Number</label>
                          <input
                            type="text"
                            value={newReg.gstin || ''}
                            onChange={(e) => setNewReg({ ...newReg, gstin: e.target.value.toUpperCase() })}
                            placeholder="e.g. 24AAACA1234E1Z8"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Registration Type</label>
                          <select
                            value={newReg.registrationType || 'Regular GST'}
                            onChange={(e) => setNewReg({ ...newReg, registrationType: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          >
                            <option>Regular GST</option>
                            <option>Composition GST</option>
                            <option>Foreign Trade IEC</option>
                            <option>Export Promotion Council (RCMC)</option>
                            <option>Food Safety (FSSAI)</option>
                            <option>MSME Udyam</option>
                            <option>Shop & Establishment</option>
                            <option>Customs Bond / Warehouse</option>
                            <option>Other Trade License</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Jurisdiction / State</label>
                          <input
                            type="text"
                            value={newReg.state || ''}
                            onChange={(e) => setNewReg({ ...newReg, state: e.target.value })}
                            placeholder="e.g. Gujarat (24) / National"
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Expiry / Renewal Date</label>
                          <input
                            type="date"
                            value={newReg.expiryDate || ''}
                            onChange={(e) => setNewReg({ ...newReg, expiryDate: e.target.value })}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Renewal Reminder (days before)</label>
                          <input
                            type="number"
                            value={newReg.renewalReminderDays || 30}
                            onChange={(e) => setNewReg({ ...newReg, renewalReminderDays: Number(e.target.value) })}
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Compliance Notes</label>
                          <input
                            type="text"
                            value={newReg.notes || ''}
                            onChange={(e) => setNewReg({ ...newReg, notes: e.target.value })}
                            placeholder="e.g. Monthly GSTR-1, LUT letter of undertaking active..."
                            className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddRegForm(false)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddRegToForm}
                          className="px-4 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold"
                        >
                          Add Registration
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of registrations currently in form */}
                  <div className="space-y-2">
                    {(formBusiness.registrations || []).map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{reg.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                              {reg.registrationType}
                            </span>
                            {reg.expiryDate && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                Exp: {reg.expiryDate}
                              </span>
                            )}
                          </div>
                          {reg.gstin && (
                            <p className="text-sky-300 font-mono text-[11px] font-semibold">
                              Number: {reg.gstin}
                            </p>
                          )}
                          {reg.notes && <p className="text-slate-400 italic text-[10px]">{reg.notes}</p>}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRegFromForm(reg.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Remove registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: BUSINESS ACTIVITIES */}
              {formTab === 'activities' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Operating Activities & Divisions
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Configure custom business segments (Export Wholesale, Logistics, Operations, Sales, Finance, etc.)
                    </p>
                  </div>

                  {/* Custom Activity Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customActivityInput}
                      onChange={(e) => setCustomActivityInput(e.target.value)}
                      placeholder="Add custom activity name..."
                      className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddActivityToForm(customActivityInput);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddActivityToForm(customActivityInput)}
                      className="px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Quick-add presets */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase">
                      Quick Add Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ACTIVITIES.map((preset) => {
                        const isAdded = (formBusiness.activities || []).some(
                          (a) => a.name.toLowerCase() === preset.toLowerCase()
                        );
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddActivityToForm(preset)}
                            disabled={isAdded}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition ${
                              isAdded
                                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800'
                                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:text-white'
                            }`}
                          >
                            + {preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configured activities list */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Currently Assigned Activities ({(formBusiness.activities || []).length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(formBusiness.activities || []).map((act) => (
                        <div
                          key={act.id}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-200 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-sky-400" />
                            {act.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivityFromForm(act.id)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                            title="Remove activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              {/* Previous / Next Tab Controls */}
              <div className="flex items-center gap-2">
                {formTab !== 'info' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formTab === 'contacts') setFormTab('info');
                      else if (formTab === 'banking') setFormTab('contacts');
                      else if (formTab === 'registrations') setFormTab('banking');
                      else if (formTab === 'activities') setFormTab('registrations');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous Section
                  </button>
                )}
                {formTab !== 'activities' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formTab === 'info') setFormTab('contacts');
                      else if (formTab === 'contacts') setFormTab('banking');
                      else if (formTab === 'banking') setFormTab('registrations');
                      else if (formTab === 'registrations') setFormTab('activities');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    Next Section <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cancel and Save Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBusiness()}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Business Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Business Profile?</h3>
            <p className="text-xs text-slate-400">
              This will remove this business profile and all its associations. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBusiness(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
