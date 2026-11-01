/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Building2,
  Users,
  BookUser,
  CheckSquare,
  Clock,
  Calendar,
  PhoneCall,
  UserCheck,
  ShoppingCart,
  FileText,
  FolderOpen,
  ArrowRight,
  Plus,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { AppDatabaseState } from '../services/storage';
import { AppModule } from '../types';

interface DashboardViewProps {
  state: AppDatabaseState;
  onNavigate: (module: AppModule) => void;
  onQuickAdd: (action: 'business' | 'person' | 'task' | 'meeting' | 'contact') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigate,
  onQuickAdd,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingTasks = state.tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');
  const completedTasks = state.tasks.filter((t) => t.status === 'Completed');
  const todayTasks = state.tasks.filter((t) => t.dueDate === todayStr);

  const todayTimetable = state.timetable.filter((a) => a.date === todayStr);
  const upcomingMeetings = state.meetings.filter((m) => m.status === 'Upcoming');
  const todayCalls = state.calls.filter((c) => c.dateTime.startsWith(todayStr));
  const pendingFollowups = state.followups.filter((f) => f.status === 'Pending');

  // Reminders calculation: tasks due today + registrations expiring soon
  const urgentReminders = [
    ...state.tasks
      .filter((t) => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Completed')
      .map((t) => ({
        id: t.id,
        title: t.title,
        source: 'Urgent Task',
        date: t.dueDate,
        module: 'tasks' as AppModule,
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      })),
    ...state.businesses.flatMap((b) =>
      b.registrations
        .filter((r) => r.expiryDate)
        .map((r) => ({
          id: `${b.id}-${r.id}`,
          title: `${b.name}: ${r.title} renewal`,
          source: 'License Compliance',
          date: r.expiryDate || '',
          module: 'businesses' as AppModule,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        }))
    ),
  ].slice(0, 4);

  return (
    <div className="p-4 space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-5 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                OFFLINE ROOM DB READY
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Executive Briefing & Overview
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Managing {state.businesses.length} enterprise profiles, {state.people.length} active partners & employees, and {pendingTasks.length} pending operations.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onQuickAdd('task')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </button>
            <button
              onClick={() => onQuickAdd('meeting')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Meeting
            </button>
            <button
              onClick={() => onQuickAdd('business')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Business
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (All clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Businesses Card */}
        <div
          onClick={() => onNavigate('businesses')}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white">{state.businesses.length}</p>
            <p className="text-xs text-slate-400 font-medium">Businesses</p>
          </div>
        </div>

        {/* People Card */}
        <div
          onClick={() => onNavigate('people')}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white">{state.people.length}</p>
            <p className="text-xs text-slate-400 font-medium">Partners & Staff</p>
          </div>
        </div>

        {/* Directory Contacts Card */}
        <div
          onClick={() => onNavigate('directory')}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition">
              <BookUser className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white">{state.directory.length}</p>
            <p className="text-xs text-slate-400 font-medium">Directory Contacts</p>
          </div>
        </div>

        {/* Tasks Card */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-3xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 shadow-lg cursor-pointer transition transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              {completedTasks.length} Done
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-white">{pendingTasks.length}</p>
            <p className="text-xs text-slate-400 font-medium">Pending Tasks</p>
          </div>
        </div>
      </div>

      {/* Two-Column Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Today's Timetable & Schedule */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Today's Timetable</h3>
                  <p className="text-[10px] text-slate-400">{todayTimetable.length} scheduled slots</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTimetable.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No schedule entries for today</p>
            ) : (
              <div className="space-y-2">
                {todayTimetable.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </span>
                        {item.isCompleted && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-md">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.startTime} - {item.endTime} ({item.durationMinutes}m) • {item.location || 'Office'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-sky-400 font-medium">
                      {item.startTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings & Follow-ups */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upcoming Meetings</h3>
                  <p className="text-[10px] text-slate-400">{upcomingMeetings.length} on agenda</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('meetings')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming meetings</p>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {m.participantNames} • {m.date} at {m.startTime}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">
                      {m.startTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Communications & Orders Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Calls Snapshot */}
        <div
          onClick={() => onNavigate('calls')}
          className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Today's Calls</p>
              <p className="text-[10px] text-slate-400">{todayCalls.length} calls logged</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
        </div>

        {/* Follow-ups Snapshot */}
        <div
          onClick={() => onNavigate('followups')}
          className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Active Follow-ups</p>
              <p className="text-[10px] text-slate-400">{pendingFollowups.length} pending</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
        </div>

        {/* Recent Orders Snapshot */}
        <div
          onClick={() => onNavigate('orders')}
          className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 cursor-pointer transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Orders & Sales</p>
              <p className="text-[10px] text-slate-400">{state.orders.length} active orders</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />
        </div>
      </div>

      {/* Important Reminders Alert Card */}
      {urgentReminders.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Important Reminders & Compliance
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {urgentReminders.map((rem, i) => (
              <div
                key={i}
                onClick={() => onNavigate(rem.module)}
                className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-800/50 cursor-pointer transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${rem.badgeColor}`}>
                    {rem.source}
                  </span>
                  <p className="text-xs font-semibold text-slate-200 truncate mt-1">
                    {rem.title}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {rem.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added Notes & Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recent Notes */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Recent Notes & SOPs</h3>
            </div>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Open
            </button>
          </div>
          <div className="space-y-2">
            {state.notes.slice(0, 2).map((n) => (
              <div
                key={n.id}
                onClick={() => onNavigate('notes')}
                className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                  <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-md">
                    {n.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-1 line-clamp-1">{n.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Recent Documents</h3>
            </div>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              Open
            </button>
          </div>
          <div className="space-y-2">
            {state.documents.slice(0, 2).map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigate('documents')}
                className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-white truncate block">{d.title}</span>
                  <span className="text-[10px] text-slate-400">{d.category} • {d.uploadDate}</span>
                </div>
                <span className="text-[10px] text-orange-400 font-mono">PDF</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
