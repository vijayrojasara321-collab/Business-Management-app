/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Clock,
  Building2,
  Users,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ListFilter,
} from 'lucide-react';
import { MeetingItem, TaskItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface MeetingsViewProps {
  state: AppDatabaseState;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Upcoming' | 'Completed' | 'Cancelled' | 'All'>('Upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formMeeting, setFormMeeting] = useState<Partial<MeetingItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredMeetings = state.meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.participantNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.decisions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormMeeting({
      id: `meet-${Date.now()}`,
      title: '',
      purpose: '',
      businessId: state.businesses[0]?.id || '',
      participantIds: state.people.slice(0, 1).map((p) => p.id),
      participantNames: state.people[0]?.fullName || '',
      date: todayStr,
      startTime: '14:00',
      endTime: '15:00',
      locationOrLink: 'Surat Office / Google Meet',
      agenda: '',
      discussionNotes: '',
      decisions: '',
      nextActions: '',
      followUpDate: '',
      status: 'Upcoming',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (m: MeetingItem) => {
    setFormMeeting(JSON.parse(JSON.stringify(m)));
    setIsEditing(true);
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMeeting.title?.trim() || !formMeeting.date) {
      showToast('Meeting title and date are required', 'error');
      return;
    }
    storageService.saveMeeting(formMeeting as MeetingItem);
    showToast(`Meeting "${formMeeting.title}" saved`);
    setIsEditing(false);
    setSelectedMeeting(formMeeting as MeetingItem);
  };

  const handleDeleteMeeting = (id: string) => {
    storageService.deleteMeeting(id);
    showToast('Meeting removed');
    setDeleteConfirmId(null);
    if (selectedMeeting?.id === id) setSelectedMeeting(null);
  };

  const handleCreateTaskFromNextAction = (m: MeetingItem) => {
    if (!m.nextActions) {
      showToast('No next action recorded in this meeting', 'error');
      return;
    }
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: `Meeting Action: ${m.title}`,
      description: m.nextActions,
      businessId: m.businessId,
      assignedPersonId: m.participantIds[0],
      startDate: todayStr,
      dueDate: m.followUpDate || todayStr,
      dueTime: '17:00',
      priority: 'High',
      status: 'Pending',
      reminder: true,
      notes: `Generated from meeting on ${m.date}`,
      createdAt: Date.now(),
    };
    storageService.saveTask(newTask);
    showToast('Task generated from meeting action items! ✅');
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Meeting Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Agendas, minutes, action items, and cross-module task delegation
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
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
            placeholder="Search meetings by title, agenda, decisions, attendees..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['Upcoming', 'Completed', 'Cancelled', 'All'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60 md:col-span-2">
            No meetings matching the selected filter.
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const biz = state.businesses.find((b) => b.id === m.businessId);

            return (
              <div
                key={m.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            m.status === 'Upcoming'
                              ? 'bg-purple-500/20 text-purple-300'
                              : m.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 font-semibold">
                          {m.date} • {m.startTime} - {m.endTime}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                        {m.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {m.purpose && (
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {m.purpose}
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
                    {biz && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        {biz.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-indigo-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <Users className="w-3 h-3 text-indigo-400" />
                      {m.participantNames}
                    </span>
                    {m.locationOrLink && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        {m.locationOrLink}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {m.nextActions ? (
                    <button
                      onClick={() => handleCreateTaskFromNextAction(m)}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Convert Actions to Task
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500">No actions logged</span>
                  )}
                  <button
                    onClick={() => setSelectedMeeting(m)}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    View Minutes & Notes <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Meeting Minutes Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                  {selectedMeeting.status}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedMeeting.title}</h3>
                <p className="text-slate-400 text-xs">
                  {selectedMeeting.date} • {selectedMeeting.startTime} - {selectedMeeting.endTime}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(selectedMeeting)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">Participants:</span>
                  <span className="font-semibold text-white">{selectedMeeting.participantNames}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Location or Conference URL:</span>
                  <span className="font-semibold text-white truncate block">
                    {selectedMeeting.locationOrLink}
                  </span>
                </div>
              </div>

              {selectedMeeting.agenda && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Agenda
                  </h4>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedMeeting.agenda}
                  </p>
                </div>
              )}

              {selectedMeeting.discussionNotes && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Discussion Minutes & Deliberations
                  </h4>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedMeeting.discussionNotes}
                  </p>
                </div>
              )}

              {selectedMeeting.decisions && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
                  <h4 className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider mb-1">
                    Official Decisions & Agreements
                  </h4>
                  <p className="text-emerald-200 leading-relaxed whitespace-pre-line">
                    {selectedMeeting.decisions}
                  </p>
                </div>
              )}

              {selectedMeeting.nextActions && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1">
                      Action Items & Next Steps
                    </h4>
                    <p className="text-indigo-200 leading-relaxed whitespace-pre-line">
                      {selectedMeeting.nextActions}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateTaskFromNextAction(selectedMeeting)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold whitespace-nowrap self-start"
                  >
                    Convert to Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Meeting Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveMeeting}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formMeeting.id ? 'Edit Meeting' : 'Schedule Meeting'}</span>
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
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  value={formMeeting.title || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, title: e.target.value })}
                  placeholder="e.g. Foreign Trade LC Discounting & Hedging Strategy"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formMeeting.purpose || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, purpose: e.target.value })}
                  placeholder="Core objective of the session..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formMeeting.businessId || ''}
                    onChange={(e) => setFormMeeting({ ...formMeeting, businessId: e.target.value })}
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
                    Status
                  </label>
                  <select
                    value={formMeeting.status || 'Upcoming'}
                    onChange={(e) => setFormMeeting({ ...formMeeting, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Participants (names)
                </label>
                <input
                  type="text"
                  value={formMeeting.participantNames || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, participantNames: e.target.value })}
                  placeholder="e.g. Rahul Sharma, Rajesh Singhal (Banker)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formMeeting.date || todayStr}
                    onChange={(e) => setFormMeeting({ ...formMeeting, date: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formMeeting.startTime || '14:00'}
                    onChange={(e) => setFormMeeting({ ...formMeeting, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formMeeting.endTime || '15:00'}
                    onChange={(e) => setFormMeeting({ ...formMeeting, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Location or Video Meeting URL
                </label>
                <input
                  type="text"
                  value={formMeeting.locationOrLink || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, locationOrLink: e.target.value })}
                  placeholder="e.g. Boardroom / https://meet.google.com/xyz"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Agenda
                </label>
                <textarea
                  rows={2}
                  value={formMeeting.agenda || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, agenda: e.target.value })}
                  placeholder="Key agenda points to discuss..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Discussion Notes & Decisions
                </label>
                <textarea
                  rows={2}
                  value={formMeeting.discussionNotes || ''}
                  onChange={(e) => setFormMeeting({ ...formMeeting, discussionNotes: e.target.value })}
                  placeholder="Agreements and summary..."
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Action Items & Follow-up Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formMeeting.nextActions || ''}
                    onChange={(e) => setFormMeeting({ ...formMeeting, nextActions: e.target.value })}
                    placeholder="Next action items..."
                    className="col-span-2 p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                  <input
                    type="date"
                    value={formMeeting.followUpDate || ''}
                    onChange={(e) => setFormMeeting({ ...formMeeting, followUpDate: e.target.value })}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Meeting
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
            <h3 className="text-base font-bold text-white">Delete Meeting?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this scheduled meeting and its minutes?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeeting(deleteConfirmId)}
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
