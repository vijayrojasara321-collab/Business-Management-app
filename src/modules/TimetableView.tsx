/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Calendar,
  Building2,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TimetableActivity } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface TimetableViewProps {
  state: AppDatabaseState;
}

export const TimetableView: React.FC<TimetableViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isEditing, setIsEditing] = useState(false);
  const [formActivity, setFormActivity] = useState<Partial<TimetableActivity>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter activities for selected date
  const dayActivities = state.timetable
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Conflict Detection: check if any two activities on this day overlap in time
  const conflicts: { a: TimetableActivity; b: TimetableActivity }[] = [];
  for (let i = 0; i < dayActivities.length; i++) {
    for (let j = i + 1; j < dayActivities.length; j++) {
      const act1 = dayActivities[i];
      const act2 = dayActivities[j];
      // Overlap condition: act1.start < act2.end and act2.start < act1.end
      if (act1.startTime < act2.endTime && act2.startTime < act1.endTime) {
        conflicts.push({ a: act1, b: act2 });
      }
    }
  }

  const handleOpenAdd = () => {
    setFormActivity({
      id: `time-${Date.now()}`,
      title: '',
      date: selectedDate,
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      businessId: state.businesses[0]?.id || '',
      personId: state.people[0]?.id || '',
      location: 'Office / Conference Call',
      description: '',
      reminder: true,
      isCompleted: false,
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (act: TimetableActivity) => {
    setFormActivity(JSON.parse(JSON.stringify(act)));
    setIsEditing(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActivity.title?.trim() || !formActivity.startTime || !formActivity.endTime) {
      showToast('Activity title and time range are required', 'error');
      return;
    }

    // calculate duration
    const [h1, m1] = formActivity.startTime.split(':').map(Number);
    const [h2, m2] = formActivity.endTime.split(':').map(Number);
    const durationMinutes = Math.max(15, (h2 * 60 + m2) - (h1 * 60 + m1));

    const finalAct: TimetableActivity = {
      ...(formActivity as TimetableActivity),
      durationMinutes,
    };

    storageService.saveTimetableActivity(finalAct);
    showToast(`Activity "${finalAct.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteActivity = (id: string) => {
    storageService.deleteTimetableActivity(id);
    showToast('Activity removed from schedule');
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = (act: TimetableActivity) => {
    const updated = { ...act, isCompleted: !act.isCompleted };
    storageService.saveTimetableActivity(updated);
    showToast(updated.isCompleted ? 'Marked activity as done' : 'Marked activity as pending');
  };

  const handleDateShift = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <span>Timetable & Daily Planner</span>
          </h2>
          <p className="text-xs text-slate-400">
            Time-blocking schedule, executive calendar & conflict detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['day', 'week', 'month'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider text-[10px] ${
                  viewMode === m ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => handleDateShift(-1)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <Calendar className="w-4 h-4 text-teal-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent font-bold text-white text-xs sm:text-sm font-mono cursor-pointer focus:outline-hidden"
          />
          {selectedDate === new Date().toISOString().split('T')[0] && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
              TODAY
            </span>
          )}
        </div>

        <button
          onClick={() => handleDateShift(1)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Overlapping Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-800/80 text-amber-200 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="font-bold">Schedule Conflict Detected!</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              "{conflicts[0].a.title}" ({conflicts[0].a.startTime} - {conflicts[0].a.endTime}) overlaps with "{conflicts[0].b.title}" ({conflicts[0].b.startTime} - {conflicts[0].b.endTime}).
            </p>
          </div>
        </div>
      )}

      {/* Timetable Activity Timeline */}
      <div className="space-y-3">
        {dayActivities.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60">
            No activities scheduled for this date. Click "Add Slot" to plan your day.
          </div>
        ) : (
          dayActivities.map((act) => {
            const biz = state.businesses.find((b) => b.id === act.businessId);
            const person = state.people.find((p) => p.id === act.personId);
            const isConflicting = conflicts.some((c) => c.a.id === act.id || c.b.id === act.id);

            return (
              <div
                key={act.id}
                className={`p-4 rounded-3xl border transition shadow-md flex items-start justify-between gap-3 ${
                  act.isCompleted
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isConflicting
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Time Badge */}
                  <div className="text-center py-1 px-2.5 rounded-2xl bg-slate-950 border border-slate-800 min-w-[70px]">
                    <span className="text-xs font-mono font-bold text-teal-400 block">
                      {act.startTime}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {act.endTime}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                      {act.durationMinutes}m
                    </span>
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xs font-bold ${
                          act.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {act.title}
                      </h3>
                      {isConflicting && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          Conflict
                        </span>
                      )}
                    </div>

                    {act.description && (
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      {biz && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3 h-3 text-sky-400" />
                          {biz.name}
                        </span>
                      )}
                      {person && (
                        <span className="flex items-center gap-1 text-indigo-300">
                          <User className="w-3 h-3 text-indigo-400" />
                          {person.fullName}
                        </span>
                      )}
                      {act.location && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {act.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleComplete(act)}
                    className={`p-1.5 rounded-xl border transition ${
                      act.isCompleted
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title="Toggle completion"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(act)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(act.id)}
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

      {/* Add / Edit Activity Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveActivity}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>{formActivity.id ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</span>
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
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  value={formActivity.title || ''}
                  onChange={(e) => setFormActivity({ ...formActivity, title: e.target.value })}
                  placeholder="e.g. Export Inspection & Port Dispatch Check"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formActivity.date || selectedDate}
                  onChange={(e) => setFormActivity({ ...formActivity, date: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formActivity.startTime || '10:00'}
                    onChange={(e) => setFormActivity({ ...formActivity, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formActivity.endTime || '11:00'}
                    onChange={(e) => setFormActivity({ ...formActivity, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formActivity.businessId || ''}
                    onChange={(e) => setFormActivity({ ...formActivity, businessId: e.target.value })}
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
                    Related Person
                  </label>
                  <select
                    value={formActivity.personId || ''}
                    onChange={(e) => setFormActivity({ ...formActivity, personId: e.target.value })}
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
                  Location / Platform
                </label>
                <input
                  type="text"
                  value={formActivity.location || ''}
                  onChange={(e) => setFormActivity({ ...formActivity, location: e.target.value })}
                  placeholder="e.g. Surat Boardroom / Zoom Link"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Agenda & Description
                </label>
                <textarea
                  rows={2}
                  value={formActivity.description || ''}
                  onChange={(e) => setFormActivity({ ...formActivity, description: e.target.value })}
                  placeholder="Points to discuss or complete..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-time-remind"
                  checked={formActivity.reminder || false}
                  onChange={(e) => setFormActivity({ ...formActivity, reminder: e.target.checked })}
                  className="rounded text-teal-500"
                />
                <label htmlFor="chk-time-remind" className="text-xs text-slate-300">
                  Notify before activity starts
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
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Schedule
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
            <h3 className="text-base font-bold text-white">Delete Timetable Slot?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this scheduled item?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteActivity(deleteConfirmId)}
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
