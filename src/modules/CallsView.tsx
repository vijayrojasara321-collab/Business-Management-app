/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PhoneCall,
  Plus,
  Search,
  Filter,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Calendar,
  Clock,
  Building2,
  User,
  ArrowUpRight,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { CallRecord, FollowUpItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface CallsViewProps {
  state: AppDatabaseState;
}

export const CallsView: React.FC<CallsViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [formCall, setFormCall] = useState<Partial<CallRecord>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredCalls = state.calls.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      c.callPurpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discussionDetails.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesBiz = businessFilter === 'All' || c.businessId === businessFilter;
    return matchesSearch && matchesStatus && matchesBiz;
  });

  const handleOpenAdd = () => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setFormCall({
      id: `call-${Date.now()}`,
      contactName: '',
      phoneNumber: '',
      businessId: state.businesses[0]?.id || '',
      personId: state.people[0]?.id || '',
      dateTime: `${todayStr} ${timeStr}`,
      callPurpose: '',
      discussionDetails: '',
      status: 'Outgoing',
      durationSeconds: 180,
      nextFollowUpDate: todayStr,
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (c: CallRecord) => {
    setFormCall(JSON.parse(JSON.stringify(c)));
    setIsEditing(true);
  };

  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCall.contactName?.trim() || !formCall.phoneNumber?.trim()) {
      showToast('Contact name and phone number are required', 'error');
      return;
    }
    storageService.saveCall(formCall as CallRecord);
    showToast(`Call record for "${formCall.contactName}" logged`);
    setIsEditing(false);
  };

  const handleDeleteCall = (id: string) => {
    storageService.deleteCall(id);
    showToast('Call record removed');
    setDeleteConfirmId(null);
  };

  const handleCreateFollowUpFromCall = (c: CallRecord) => {
    const newFollowUp: FollowUpItem = {
      id: `foll-${Date.now()}`,
      contactName: c.contactName,
      contactCategory: 'Other',
      businessId: c.businessId,
      personId: c.personId,
      source: 'Call',
      sourceId: c.id,
      purpose: `Follow-up on Call: ${c.callPurpose || 'Discussion'}`,
      date: c.nextFollowUpDate || todayStr,
      time: '11:00',
      status: 'Pending',
      notes: c.discussionDetails,
      createdAt: Date.now(),
    };
    storageService.saveFollowUp(newFollowUp);
    showToast('Follow-up scheduled from this call! 📋');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Incoming':
        return <PhoneIncoming className="w-4 h-4 text-sky-400" />;
      case 'Outgoing':
        return <PhoneOutgoing className="w-4 h-4 text-emerald-400" />;
      case 'Missed':
        return <PhoneMissed className="w-4 h-4 text-rose-400" />;
      default:
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-green-400" />
            <span>Call Records & Manual Logger</span>
          </h2>
          <p className="text-xs text-slate-400">
            Log call discussions, launch dialer, and schedule immediate follow-ups
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Call
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
            placeholder="Search by contact name, phone, purpose or discussion..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-green-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="All">All Types</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
            <option value="Missed">Missed</option>
            <option value="Scheduled">Scheduled</option>
          </select>
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="All">All Businesses</option>
            {state.businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calls List */}
      <div className="space-y-3">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60">
            No call records found. Click "Log Call" to record a conversation.
          </div>
        ) : (
          filteredCalls.map((call) => {
            const biz = state.businesses.find((b) => b.id === call.businessId);
            const person = state.people.find((p) => p.id === call.personId);

            return (
              <div
                key={call.id}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        {getStatusIcon(call.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">{call.contactName}</h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {call.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {call.phoneNumber} • {call.dateTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* One tap call phone dialer */}
                      <a
                        href={`tel:${call.phoneNumber}`}
                        className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition"
                        title="Redial phone"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(call)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(call.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {call.callPurpose && (
                    <p className="text-xs font-semibold text-slate-200 mt-2.5">
                      Purpose: {call.callPurpose}
                    </p>
                  )}

                  {call.discussionDetails && (
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
                      {call.discussionDetails}
                    </p>
                  )}

                  {/* Metadata line */}
                  <div className="mt-2.5 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                    {biz && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        {biz.name}
                      </span>
                    )}
                    {person && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <User className="w-3 h-3 text-indigo-400" />
                        Handled by: {person.fullName}
                      </span>
                    )}
                    {call.durationSeconds && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Quick Follow-up Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {call.nextFollowUpDate
                      ? `Follow-up Date: ${call.nextFollowUpDate}`
                      : 'No follow-up set'}
                  </span>
                  <button
                    onClick={() => handleCreateFollowUpFromCall(call)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <ArrowUpRight className="w-3 h-3 text-sky-400" />
                    Create Follow-up
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Call Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveCall}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-green-400" />
                <span>{formCall.id ? 'Edit Call Record' : 'Log New Call'}</span>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCall.contactName || ''}
                    onChange={(e) => setFormCall({ ...formCall, contactName: e.target.value })}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formCall.phoneNumber || ''}
                    onChange={(e) => setFormCall({ ...formCall, phoneNumber: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Call Status / Direction
                  </label>
                  <select
                    value={formCall.status || 'Outgoing'}
                    onChange={(e) => setFormCall({ ...formCall, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Missed">Missed</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Call Date & Time
                  </label>
                  <input
                    type="text"
                    value={formCall.dateTime || ''}
                    onChange={(e) => setFormCall({ ...formCall, dateTime: e.target.value })}
                    placeholder="YYYY-MM-DD HH:MM"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formCall.businessId || ''}
                    onChange={(e) => setFormCall({ ...formCall, businessId: e.target.value })}
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

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Handled By
                  </label>
                  <select
                    value={formCall.personId || ''}
                    onChange={(e) => setFormCall({ ...formCall, personId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None</option>
                    {state.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Call Purpose
                </label>
                <input
                  type="text"
                  value={formCall.callPurpose || ''}
                  onChange={(e) => setFormCall({ ...formCall, callPurpose: e.target.value })}
                  placeholder="e.g. LC amendment discussion or container booking"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Discussion Points & Decisions
                </label>
                <textarea
                  rows={3}
                  value={formCall.discussionDetails || ''}
                  onChange={(e) => setFormCall({ ...formCall, discussionDetails: e.target.value })}
                  placeholder="Summary of what was discussed, promised or agreed..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formCall.durationSeconds || ''}
                    onChange={(e) => setFormCall({ ...formCall, durationSeconds: Number(e.target.value) })}
                    placeholder="e.g. 180"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formCall.nextFollowUpDate || ''}
                    onChange={(e) => setFormCall({ ...formCall, nextFollowUpDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
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
                className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Call Record
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
            <h3 className="text-base font-bold text-white">Delete Call Record?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this logged call?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCall(deleteConfirmId)}
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
