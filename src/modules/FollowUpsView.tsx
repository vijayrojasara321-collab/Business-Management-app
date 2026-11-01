/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Building2,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { FollowUpItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface FollowUpsViewProps {
  state: AppDatabaseState;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'pending' | 'overdue' | 'completed' | 'all'>('pending');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [formFollowUp, setFormFollowUp] = useState<Partial<FollowUpItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const categories = ['All', 'Customer', 'Supplier', 'Business Partner', 'Employee', 'Other'];

  const filteredFollowUps = state.followups.filter((f) => {
    const matchesSearch =
      f.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || f.contactCategory === categoryFilter;

    let matchesTab = true;
    if (tab === 'pending') {
      matchesTab = f.date >= todayStr && f.status === 'Pending';
    } else if (tab === 'overdue') {
      matchesTab = f.date < todayStr && f.status === 'Pending';
    } else if (tab === 'completed') {
      matchesTab = f.status === 'Completed';
    }

    return matchesSearch && matchesCat && matchesTab;
  });

  const handleOpenAdd = () => {
    setFormFollowUp({
      id: `foll-${Date.now()}`,
      contactName: '',
      contactCategory: 'Customer',
      businessId: state.businesses[0]?.id || '',
      source: 'Manual',
      purpose: '',
      date: todayStr,
      time: '11:00',
      status: 'Pending',
      nextFollowUpDate: todayStr,
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (f: FollowUpItem) => {
    setFormFollowUp(JSON.parse(JSON.stringify(f)));
    setIsEditing(true);
  };

  const handleSaveFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFollowUp.contactName?.trim() || !formFollowUp.date) {
      showToast('Contact name and date are required', 'error');
      return;
    }
    storageService.saveFollowUp(formFollowUp as FollowUpItem);
    showToast(`Follow-up with "${formFollowUp.contactName}" saved`);
    setIsEditing(false);
  };

  const handleDeleteFollowUp = (id: string) => {
    storageService.deleteFollowUp(id);
    showToast('Follow-up deleted');
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = (f: FollowUpItem) => {
    const isComp = f.status === 'Completed';
    const updated: FollowUpItem = { ...f, status: isComp ? 'Pending' : 'Completed' };
    storageService.saveFollowUp(updated);
    showToast(isComp ? 'Follow-up marked pending' : 'Follow-up resolved & completed! 🎉');
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-rose-400" />
            <span>Follow-up Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">
            Never miss customer, supplier, bank, or partner commitments
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Follow-up
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          {
            id: 'pending',
            label: `Pending (${state.followups.filter((f) => f.date >= todayStr && f.status === 'Pending').length})`,
          },
          {
            id: 'overdue',
            label: `Overdue (${state.followups.filter((f) => f.date < todayStr && f.status === 'Pending').length})`,
          },
          {
            id: 'completed',
            label: `Completed (${state.followups.filter((f) => f.status === 'Completed').length})`,
          },
          { id: 'all', label: `All (${state.followups.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              tab === t.id
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search follow-ups by contact, purpose or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Follow-up Cards */}
      <div className="space-y-3">
        {filteredFollowUps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60">
            No follow-ups found in this view.
          </div>
        ) : (
          filteredFollowUps.map((f) => {
            const biz = state.businesses.find((b) => b.id === f.businessId);
            const isCompleted = f.status === 'Completed';
            const isOverdue = f.date < todayStr && !isCompleted;

            return (
              <div
                key={f.id}
                className={`p-4 rounded-3xl border transition shadow-md flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-900/50'
                    : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleComplete(f)}
                    className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition border ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'border-slate-600 bg-slate-800/60 hover:border-rose-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xs font-bold ${
                          isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {f.contactName}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {f.contactCategory}
                      </span>
                      {f.source !== 'Manual' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">
                          From {f.source}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-200 mt-1">{f.purpose}</p>

                    {f.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{f.notes}</p>
                    )}

                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span className={`flex items-center gap-1 font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Target: {f.date} {f.time && `@ ${f.time}`}
                      </span>
                      {biz && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3 h-3 text-sky-400" />
                          {biz.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(f.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Follow-up Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveFollowUp}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-400" />
                <span>{formFollowUp.id ? 'Edit Follow-up' : 'Add Follow-up'}</span>
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
                  value={formFollowUp.contactName || ''}
                  onChange={(e) => setFormFollowUp({ ...formFollowUp, contactName: e.target.value })}
                  placeholder="e.g. Al-Mansoor Foodstuff Dubai"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Contact Category
                  </label>
                  <select
                    value={formFollowUp.contactCategory || 'Customer'}
                    onChange={(e) => setFormFollowUp({ ...formFollowUp, contactCategory: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formFollowUp.businessId || ''}
                    onChange={(e) => setFormFollowUp({ ...formFollowUp, businessId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None</option>
                    {state.businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Purpose of Follow-up *
                </label>
                <input
                  type="text"
                  required
                  value={formFollowUp.purpose || ''}
                  onChange={(e) => setFormFollowUp({ ...formFollowUp, purpose: e.target.value })}
                  placeholder="e.g. Collect Swift copy of LC amendment MT707"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formFollowUp.date || todayStr}
                    onChange={(e) => setFormFollowUp({ ...formFollowUp, date: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Target Time
                  </label>
                  <input
                    type="time"
                    value={formFollowUp.time || '11:00'}
                    onChange={(e) => setFormFollowUp({ ...formFollowUp, time: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Notes & Context
                </label>
                <textarea
                  rows={2}
                  value={formFollowUp.notes || ''}
                  onChange={(e) => setFormFollowUp({ ...formFollowUp, notes: e.target.value })}
                  placeholder="Additional context or critical deadlines..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Follow-up
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
            <h3 className="text-base font-bold text-white">Delete Follow-up?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this follow-up item?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFollowUp(deleteConfirmId)}
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
