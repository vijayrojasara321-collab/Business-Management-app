/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookUser,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Star,
  Building,
  Edit2,
  Trash2,
  X,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { DirectoryContact } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface DirectoryViewProps {
  state: AppDatabaseState;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [importantOnly, setImportantOnly] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formContact, setFormContact] = useState<Partial<DirectoryContact>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'All',
    'Customer',
    'Supplier',
    'Banker',
    'Auditor',
    'Government',
    'Transporter',
    'Lawyer',
    'Vendor',
    'Investor',
    'Other',
  ];

  const filteredContacts = state.directory.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesImp = !importantOnly || c.isImportant;
    return matchesSearch && matchesCat && matchesImp;
  });

  const handleOpenAdd = () => {
    setFormContact({
      id: `dir-${Date.now()}`,
      name: '',
      category: 'Customer',
      phone: '',
      alternatePhone: '',
      email: '',
      company: '',
      address: '',
      isImportant: false,
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (c: DirectoryContact) => {
    setFormContact(JSON.parse(JSON.stringify(c)));
    setIsEditing(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContact.name?.trim() || !formContact.phone?.trim()) {
      showToast('Name and phone number are required', 'error');
      return;
    }
    storageService.saveDirectoryContact(formContact as DirectoryContact);
    showToast(`Contact "${formContact.name}" saved`);
    setIsEditing(false);
  };

  const handleDeleteContact = (id: string) => {
    storageService.deleteDirectoryContact(id);
    showToast('Contact removed');
    setDeleteConfirmId(null);
  };

  const handleToggleImportant = (c: DirectoryContact) => {
    const updated = { ...c, isImportant: !c.isImportant };
    storageService.saveDirectoryContact(updated);
    showToast(updated.isImportant ? 'Marked as Important' : 'Removed from Important');
  };

  const sanitizePhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookUser className="w-5 h-5 text-amber-400" />
            <span>Contact Directory Book</span>
          </h2>
          <p className="text-xs text-slate-400">
            External customers, suppliers, freight forwarders, bankers & government authorities
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Contact
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
            placeholder="Search directory by name, company, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setImportantOnly(!importantOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              importantOnly
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900/60 text-amber-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${importantOnly ? 'fill-current' : ''}`} />
            Important Only
          </button>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredContacts.map((c) => {
          const cleanPhone = sanitizePhoneForWhatsApp(c.phone);

          return (
            <div
              key={c.id}
              className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-white truncate">{c.name}</h3>
                        {c.isImportant && (
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded font-medium">
                        {c.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleToggleImportant(c)}
                      className={`p-1.5 rounded-lg transition ${
                        c.isImportant ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Toggle important"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      title="Edit contact"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {c.company && (
                  <p className="text-[11px] text-slate-300 font-medium mt-2 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    {c.company}
                  </p>
                )}

                {c.address && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    {c.address}
                  </p>
                )}

                {c.notes && (
                  <p className="text-[10px] text-slate-400 italic mt-2 bg-slate-950/40 p-2 rounded-xl line-clamp-2">
                    {c.notes}
                  </p>
                )}
              </div>

              {/* Direct Communication Action Buttons */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                {/* Phone Dialler Shortcut */}
                <a
                  href={`tel:${c.phone}`}
                  className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                  title="Call using Android phone dialer"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  Call
                </a>

                {/* WhatsApp Direct Shortcut */}
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                  title="Open WhatsApp chat"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  WhatsApp
                </a>

                {/* Email Shortcut */}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    title="Send Email"
                  >
                    <Mail className="w-3 h-3 text-sky-400" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Contact Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveContact}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookUser className="w-4 h-4 text-amber-400" />
                <span>{formContact.id ? 'Edit Directory Contact' : 'Add Directory Contact'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Contact / Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={formContact.name || ''}
                  onChange={(e) => setFormContact({ ...formContact, name: e.target.value })}
                  placeholder="e.g. Vikram Joshi (CHA)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={formContact.category || 'Customer'}
                    onChange={(e) => setFormContact({ ...formContact, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Company / Organisation
                  </label>
                  <input
                    type="text"
                    value={formContact.company || ''}
                    onChange={(e) => setFormContact({ ...formContact, company: e.target.value })}
                    placeholder="e.g. Oceanic Forwarding"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formContact.phone || ''}
                    onChange={(e) => setFormContact({ ...formContact, phone: e.target.value })}
                    placeholder="+91 98250 12345"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formContact.alternatePhone || ''}
                    onChange={(e) => setFormContact({ ...formContact, alternatePhone: e.target.value })}
                    placeholder="+91 98250 67890"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formContact.email || ''}
                  onChange={(e) => setFormContact({ ...formContact, email: e.target.value })}
                  placeholder="contact@company.example"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Office / Physical Address
                </label>
                <input
                  type="text"
                  value={formContact.address || ''}
                  onChange={(e) => setFormContact({ ...formContact, address: e.target.value })}
                  placeholder="Suite, Complex, Port or City"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Important Notes & Context
                </label>
                <textarea
                  rows={2}
                  value={formContact.notes || ''}
                  onChange={(e) => setFormContact({ ...formContact, notes: e.target.value })}
                  placeholder="Special terms, payment terms, or reference details..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-important"
                  checked={formContact.isImportant || false}
                  onChange={(e) => setFormContact({ ...formContact, isImportant: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="chk-important" className="text-xs text-slate-300 font-medium">
                  Mark as Important Contact (shows star badge)
                </label>
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
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Contact
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
            <h3 className="text-base font-bold text-white">Delete Contact?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this contact from your directory?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteContact(deleteConfirmId)}
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
