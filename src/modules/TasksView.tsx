/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Building2,
  User,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  List,
  CalendarDays,
} from 'lucide-react';
import { TaskItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface TasksViewProps {
  state: AppDatabaseState;
}

export const TasksView: React.FC<TasksViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed' | 'all'>('today');
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [formTask, setFormTask] = useState<Partial<TaskItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = state.tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBiz = businessFilter === 'All' || t.businessId === businessFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    let matchesTab = true;
    if (tab === 'today') {
      matchesTab = t.dueDate === todayStr && t.status !== 'Completed';
    } else if (tab === 'upcoming') {
      matchesTab = t.dueDate > todayStr && t.status !== 'Completed';
    } else if (tab === 'overdue') {
      matchesTab = t.dueDate < todayStr && t.status !== 'Completed';
    } else if (tab === 'completed') {
      matchesTab = t.status === 'Completed';
    }

    return matchesSearch && matchesBiz && matchesPriority && matchesTab;
  });

  const handleOpenAdd = () => {
    setFormTask({
      id: `tsk-${Date.now()}`,
      title: '',
      description: '',
      businessId: state.businesses[0]?.id || '',
      assignedPersonId: state.people[0]?.id || '',
      startDate: todayStr,
      dueDate: todayStr,
      dueTime: '17:00',
      priority: 'High',
      status: 'Pending',
      reminder: true,
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (t: TaskItem) => {
    setFormTask(JSON.parse(JSON.stringify(t)));
    setIsEditing(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTask.title?.trim() || !formTask.dueDate) {
      showToast('Task title and due date are required', 'error');
      return;
    }
    storageService.saveTask(formTask as TaskItem);
    showToast(`Task "${formTask.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteTask = (id: string) => {
    storageService.deleteTask(id);
    showToast('Task deleted');
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = (id: string) => {
    storageService.toggleTaskComplete(id);
    const target = state.tasks.find((t) => t.id === id);
    if (target?.status !== 'Completed') {
      showToast('Task marked as completed! 🎉');
    } else {
      showToast('Task marked as pending');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Task Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Priority execution, deadlines, and multi-business delegation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewType === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewType === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
              title="Calendar view"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs">
        {[
          { id: 'today', label: `Today's Tasks (${state.tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed').length})` },
          { id: 'upcoming', label: `Upcoming (${state.tasks.filter((t) => t.dueDate > todayStr && t.status !== 'Completed').length})` },
          { id: 'overdue', label: `Overdue (${state.tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed').length})` },
          { id: 'completed', label: `Completed (${state.tasks.filter((t) => t.status === 'Completed').length})` },
          { id: 'all', label: `All Tasks (${state.tasks.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
              tab === t.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search and Business Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
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
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List or Calendar View */}
      {viewType === 'list' ? (
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60">
              No tasks matching the selected filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const bizName = state.businesses.find((b) => b.id === task.businessId)?.name;
              const assignedName = state.people.find((p) => p.id === task.assignedPersonId)?.fullName;
              const isCompleted = task.status === 'Completed';
              const isOverdue = task.dueDate < todayStr && !isCompleted;

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-3xl border transition shadow-md flex items-start gap-3 ${
                    isCompleted
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                      : isOverdue
                      ? 'bg-slate-900/90 border-rose-900/40'
                      : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition border ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'border-slate-600 bg-slate-800/60 hover:border-emerald-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </button>

                  {/* Task Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-xs font-bold ${
                              isCompleted ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md border font-bold ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                            {task.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                      <span className={`flex items-center gap-1 font-mono font-medium ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Due: {task.dueDate} {task.dueTime && `@ ${task.dueTime}`}
                      </span>

                      {bizName && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building2 className="w-3 h-3 text-sky-400" />
                          {bizName}
                        </span>
                      )}

                      {assignedName && (
                        <span className="flex items-center gap-1 text-indigo-300">
                          <User className="w-3 h-3 text-indigo-400" />
                          Assigned: {assignedName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar view grouping tasks by date */
        <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Calendar Timeline View
          </p>
          <div className="space-y-3">
            {Array.from(new Set(state.tasks.map((t) => t.dueDate)))
              .sort()
              .map((dateStr) => {
                const tasksForDate = state.tasks.filter((t) => t.dueDate === dateStr);
                return (
                  <div key={dateStr} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 font-mono block mb-2">
                      📅 {dateStr} {dateStr === todayStr && '(Today)'}
                    </span>
                    <div className="space-y-1.5">
                      {tasksForDate.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900 border border-slate-800/80"
                        >
                          <span className={`truncate ${t.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {t.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveTask}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{formTask.id ? 'Edit Task' : 'Add New Task'}</span>
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
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTask.title || ''}
                  onChange={(e) => setFormTask({ ...formTask, title: e.target.value })}
                  placeholder="e.g. Verify Shipping Bill & BL Draft for Dubai Container"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formTask.description || ''}
                  onChange={(e) => setFormTask({ ...formTask, description: e.target.value })}
                  placeholder="Task action items and notes..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Related Business
                  </label>
                  <select
                    value={formTask.businessId || ''}
                    onChange={(e) => setFormTask({ ...formTask, businessId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None / General</option>
                    {state.businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Assigned Person
                  </label>
                  <select
                    value={formTask.assignedPersonId || ''}
                    onChange={(e) => setFormTask({ ...formTask, assignedPersonId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">None</option>
                    {state.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.primaryType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formTask.dueDate || ''}
                    onChange={(e) => setFormTask({ ...formTask, dueDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={formTask.dueTime || ''}
                    onChange={(e) => setFormTask({ ...formTask, dueTime: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Priority
                  </label>
                  <select
                    value={formTask.priority || 'High'}
                    onChange={(e) => setFormTask({ ...formTask, priority: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Status
                  </label>
                  <select
                    value={formTask.status || 'Pending'}
                    onChange={(e) => setFormTask({ ...formTask, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Reference Notes
                </label>
                <input
                  type="text"
                  value={formTask.notes || ''}
                  onChange={(e) => setFormTask({ ...formTask, notes: e.target.value })}
                  placeholder="Instructions or links"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-remind"
                  checked={formTask.reminder || false}
                  onChange={(e) => setFormTask({ ...formTask, reminder: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <label htmlFor="chk-remind" className="text-xs text-slate-300">
                  Enable device notification reminder for this task
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Task
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
            <h3 className="text-base font-bold text-white">Delete Task?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this task?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(deleteConfirmId)}
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
