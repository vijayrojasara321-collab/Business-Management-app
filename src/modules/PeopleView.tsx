/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Briefcase,
  ChevronRight,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { Person, PersonBusinessAssociation } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface PeopleViewProps {
  state: AppDatabaseState;
}

export const PeopleView: React.FC<PeopleViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Partner' | 'Employee' | 'Other'>('All');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formPerson, setFormPerson] = useState<Partial<Person>>({});
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Association Form inside Edit
  const [editingAssocIndex, setEditingAssocIndex] = useState<number | null>(null);
  const [assocBusinessId, setAssocBusinessId] = useState(state.businesses[0]?.id || '');
  const [assocRole, setAssocRole] = useState<'Partner' | 'Employee' | 'Consultant' | 'Director' | 'Advisor' | 'Other'>('Partner');
  const [assocDesignation, setAssocDesignation] = useState('');
  const [assocActivitiesInput, setAssocActivitiesInput] = useState('');
  const [assocJoiningDate, setAssocJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [assocStatus, setAssocStatus] = useState<'Active' | 'Inactive'>('Active');
  const [assocNotes, setAssocNotes] = useState('');

  const filteredPeople = state.people.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneNumbers.some((n) => n.includes(searchQuery)) ||
      p.emailAddresses.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'All' || p.primaryType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenAdd = () => {
    const newPerson: Person = {
      id: `per-${Date.now()}`,
      fullName: '',
      primaryType: 'Partner',
      phoneNumbers: [],
      emailAddresses: [],
      address: '',
      dateOfBirth: '',
      designation: '',
      notes: '',
      status: 'Active',
      businessAssociations: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setFormPerson(newPerson);
    setPhoneInput('');
    setEmailInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Person) => {
    setFormPerson(JSON.parse(JSON.stringify(p)));
    setPhoneInput('');
    setEmailInput('');
    setIsEditing(true);
  };

  const handleAddPhone = () => {
    if (!phoneInput.trim()) return;
    const currentPhones = formPerson.phoneNumbers || [];
    setFormPerson({ ...formPerson, phoneNumbers: [...currentPhones, phoneInput.trim()] });
    setPhoneInput('');
  };

  const handleRemovePhone = (index: number) => {
    const currentPhones = [...(formPerson.phoneNumbers || [])];
    currentPhones.splice(index, 1);
    setFormPerson({ ...formPerson, phoneNumbers: currentPhones });
  };

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;
    const currentEmails = formPerson.emailAddresses || [];
    setFormPerson({ ...formPerson, emailAddresses: [...currentEmails, emailInput.trim()] });
    setEmailInput('');
  };

  const handleRemoveEmail = (index: number) => {
    const currentEmails = [...(formPerson.emailAddresses || [])];
    currentEmails.splice(index, 1);
    setFormPerson({ ...formPerson, emailAddresses: currentEmails });
  };

  // Add / Update Business Association
  const handleSaveAssociation = () => {
    if (!assocBusinessId) {
      showToast('Select a business to associate with', 'error');
      return;
    }
    const activitiesList = assocActivitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newAssoc: PersonBusinessAssociation = {
      businessId: assocBusinessId,
      role: assocRole,
      designation: assocDesignation || assocRole,
      activities: activitiesList,
      joiningDate: assocJoiningDate,
      status: assocStatus,
      notes: assocNotes,
    };

    const currentAssocs = [...(formPerson.businessAssociations || [])];
    if (editingAssocIndex !== null) {
      currentAssocs[editingAssocIndex] = newAssoc;
    } else {
      // Check if already associated with this business
      const existingIdx = currentAssocs.findIndex((a) => a.businessId === assocBusinessId);
      if (existingIdx >= 0) {
        currentAssocs[existingIdx] = newAssoc;
      } else {
        currentAssocs.push(newAssoc);
      }
    }

    setFormPerson({ ...formPerson, businessAssociations: currentAssocs });
    setEditingAssocIndex(null);
    setAssocDesignation('');
    setAssocActivitiesInput('');
    setAssocNotes('');
    showToast('Business association updated');
  };

  const handleRemoveAssociation = (index: number) => {
    const currentAssocs = [...(formPerson.businessAssociations || [])];
    currentAssocs.splice(index, 1);
    setFormPerson({ ...formPerson, businessAssociations: currentAssocs });
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPerson.fullName?.trim()) {
      showToast('Full name is required', 'error');
      return;
    }
    storageService.savePerson(formPerson as Person);
    showToast(`Profile for "${formPerson.fullName}" saved`);
    setIsEditing(false);
    setSelectedPerson(formPerson as Person);
  };

  const handleDeletePerson = (id: string) => {
    storageService.deletePerson(id);
    showToast('Person profile removed');
    setDeleteConfirmId(null);
    if (selectedPerson?.id === id) {
      setSelectedPerson(null);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>People & Multi-Business Associations</span>
          </h2>
          <p className="text-xs text-slate-400">
            One person can manage multiple enterprises with distinct designations & activities
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search person by name, designation, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Partner', 'Employee', 'Other'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                typeFilter === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPeople.map((person) => {
          return (
            <div
              key={person.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-white shadow-md text-base">
                      {person.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{person.fullName}</h3>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            person.primaryType === 'Partner'
                              ? 'bg-purple-500/20 text-purple-300'
                              : person.primaryType === 'Employee'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {person.primaryType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{person.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(person)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      title="Edit person"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(person.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete person"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Multiple Business Associations Cards */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Associated Enterprises ({person.businessAssociations.length}):
                  </span>
                  {person.businessAssociations.map((assoc, idx) => {
                    const bName =
                      state.businesses.find((b) => b.id === assoc.businessId)?.name ||
                      'Associated Entity';
                    return (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            <span className="font-semibold text-slate-200 truncate">{bName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-medium">
                              {assoc.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {assoc.designation} • {assoc.activities.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Contact & View */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {person.phoneNumbers[0] && (
                    <a
                      href={`tel:${person.phoneNumbers[0]}`}
                      className="flex items-center gap-1 hover:text-sky-400"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {person.phoneNumbers[0]}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPerson(person)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  View Profile <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Person Profile Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-white text-sm">
                  {selectedPerson.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPerson.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedPerson.primaryType} • {selectedPerson.designation}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(selectedPerson)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Contact Details */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Phone Numbers:</span>
                    {selectedPerson.phoneNumbers.length ? (
                      selectedPerson.phoneNumbers.map((ph, i) => (
                        <a
                          key={i}
                          href={`tel:${ph}`}
                          className="font-medium text-white block hover:text-sky-400 mt-0.5"
                        >
                          {ph}
                        </a>
                      ))
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Email Addresses:</span>
                    {selectedPerson.emailAddresses.length ? (
                      selectedPerson.emailAddresses.map((em, i) => (
                        <a
                          key={i}
                          href={`mailto:${em}`}
                          className="font-medium text-white block hover:text-sky-400 mt-0.5"
                        >
                          {em}
                        </a>
                      ))
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </div>
                  {selectedPerson.address && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-500 block">Residential Address:</span>
                      <p className="text-slate-200 mt-0.5">{selectedPerson.address}</p>
                    </div>
                  )}
                  {selectedPerson.dateOfBirth && (
                    <div>
                      <span className="text-[10px] text-slate-500 block">Date of Birth:</span>
                      <p className="text-slate-200 mt-0.5 font-mono">{selectedPerson.dateOfBirth}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Business Associations Details */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Multi-Business Associations & Responsibilities
                </h4>
                {selectedPerson.businessAssociations.map((assoc, idx) => {
                  const bName =
                    state.businesses.find((b) => b.id === assoc.businessId)?.name || 'Business';
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-white text-sm">{bName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                          {assoc.role}
                        </span>
                      </div>
                      <p className="text-slate-300">
                        <span className="text-slate-500">Designation in this entity:</span>{' '}
                        <span className="font-semibold text-white">{assoc.designation}</span>
                      </p>
                      <div>
                        <span className="text-slate-500 block text-[10px] mb-1">
                          Assigned Business Activities:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {assoc.activities.map((act, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700"
                            >
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                      {assoc.notes && <p className="text-slate-400 italic text-[11px]">{assoc.notes}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              {selectedPerson.notes && (
                <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-300">
                  <span className="text-[10px] text-slate-500 block mb-1">Confidential Notes:</span>
                  <p className="leading-relaxed">{selectedPerson.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Person Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSavePerson}
            className="w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>{formPerson.id ? 'Edit Person Profile' : 'Add New Person'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPerson.fullName || ''}
                    onChange={(e) => setFormPerson({ ...formPerson, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Classification
                  </label>
                  <select
                    value={formPerson.primaryType || 'Partner'}
                    onChange={(e) => setFormPerson({ ...formPerson, primaryType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Partner">Partner</option>
                    <option value="Employee">Employee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Primary Designation
                  </label>
                  <input
                    type="text"
                    value={formPerson.designation || ''}
                    onChange={(e) => setFormPerson({ ...formPerson, designation: e.target.value })}
                    placeholder="e.g. Managing Partner / Director"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Status
                  </label>
                  <select
                    value={formPerson.status || 'Active'}
                    onChange={(e) => setFormPerson({ ...formPerson, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formPerson.dateOfBirth || ''}
                    onChange={(e) => setFormPerson({ ...formPerson, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formPerson.address || ''}
                    onChange={(e) => setFormPerson({ ...formPerson, address: e.target.value })}
                    placeholder="Residential address"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Multiple Phone Numbers */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Phone Numbers
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98250 00000"
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhone}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formPerson.phoneNumbers || []).map((ph, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                    >
                      {ph}
                      <button
                        type="button"
                        onClick={() => handleRemovePhone(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Multiple Emails */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Email Addresses
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formPerson.emailAddresses || []).map((em, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5"
                    >
                      {em}
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Multi-Business Association Builder Section */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">
                    Business Associations (Assign Roles & Activities)
                  </h4>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-indigo-900/40 space-y-3 mb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Select Business</label>
                      <select
                        value={assocBusinessId}
                        onChange={(e) => setAssocBusinessId(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      >
                        {state.businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Role in Business</label>
                      <select
                        value={assocRole}
                        onChange={(e) => setAssocRole(e.target.value as any)}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      >
                        <option value="Partner">Partner</option>
                        <option value="Employee">Employee</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Director">Director</option>
                        <option value="Advisor">Advisor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Designation in this Business
                      </label>
                      <input
                        type="text"
                        value={assocDesignation}
                        onChange={(e) => setAssocDesignation(e.target.value)}
                        placeholder="e.g. Export Manager / CFO"
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Business Activities (comma separated)
                      </label>
                      <input
                        type="text"
                        value={assocActivitiesInput}
                        onChange={(e) => setAssocActivitiesInput(e.target.value)}
                        placeholder="e.g. Export Wholesale, Logistics, Accounts"
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAssociation}
                    className="w-full py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Save Business Association
                  </button>
                </div>

                {/* List of current associations */}
                <div className="space-y-1.5">
                  {(formPerson.businessAssociations || []).map((assoc, idx) => {
                    const bName =
                      state.businesses.find((b) => b.id === assoc.businessId)?.name || 'Business';
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{bName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-bold">
                              {assoc.role}
                            </span>
                            <span className="text-slate-400 font-medium">({assoc.designation})</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Activities: {assoc.activities.join(', ') || 'General'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssociation(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Person Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Person Profile?</h3>
            <p className="text-xs text-slate-400">
              This will remove this person and their associations from all businesses.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePerson(deleteConfirmId)}
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
