/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Pin,
  Building2,
  User,
  Share2,
  Copy,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { NoteItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface NotesViewProps {
  state: AppDatabaseState;
}

export const NotesView: React.FC<NotesViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [formNote, setFormNote] = useState<Partial<NoteItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['All', 'Operations', 'Strategy & Pricing', 'Legal', 'Technical', 'General'];

  const filteredNotes = state.notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || n.category === categoryFilter;
      const matchesBiz = businessFilter === 'All' || n.businessId === businessFilter;
      return matchesSearch && matchesCat && matchesBiz;
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleOpenAdd = () => {
    setFormNote({
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      category: 'Operations',
      businessId: state.businesses[0]?.id || '',
      personId: state.people[0]?.id || '',
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (n: NoteItem) => {
    setFormNote(JSON.parse(JSON.stringify(n)));
    setIsEditing(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNote.title?.trim() || !formNote.content?.trim()) {
      showToast('Note title and content are required', 'error');
      return;
    }
    storageService.saveNote(formNote as NoteItem);
    showToast(`Note "${formNote.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteNote = (id: string) => {
    storageService.deleteNote(id);
    showToast('Note removed');
    setDeleteConfirmId(null);
  };

  const handleTogglePin = (n: NoteItem) => {
    const updated = { ...n, isPinned: !n.isPinned };
    storageService.saveNote(updated);
    showToast(updated.isPinned ? 'Note pinned to top 📌' : 'Note unpinned');
  };

  const handleShareNote = async (n: NoteItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: n.title,
          text: n.content,
        });
        showToast('Shared successfully!');
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${n.title}\n\n${n.content}`);
      showToast('Note text copied to clipboard! 📋');
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <span>Business Notes & SOPs</span>
          </h2>
          <p className="text-xs text-slate-400">
            Internal procedures, executive memos, technical specifications & meeting notes
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Note
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
            placeholder="Search notes by title or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
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

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60 md:col-span-2">
            No notes found. Click "Create Note" to add one.
          </div>
        ) : (
          filteredNotes.map((note) => {
            const biz = state.businesses.find((b) => b.id === note.businessId);
            const person = state.people.find((p) => p.id === note.personId);

            return (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border shadow-md flex flex-col justify-between transition ${
                  note.isPinned
                    ? 'bg-slate-900/90 border-violet-500/40'
                    : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">
                          {note.category}
                        </span>
                        {note.isPinned && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-0.5">
                            <Pin className="w-2.5 h-2.5 fill-current" /> PINNED
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                        {note.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`p-1.5 rounded-lg transition ${
                          note.isPinned
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {note.content}
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
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
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleShareNote(note)}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share Note
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveNote}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>{formNote.id ? 'Edit Note' : 'Create Business Note'}</span>
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
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={formNote.title || ''}
                  onChange={(e) => setFormNote({ ...formNote, title: e.target.value })}
                  placeholder="e.g. Agricultural Export Packaging SOP"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={formNote.category || 'Operations'}
                    onChange={(e) => setFormNote({ ...formNote, category: e.target.value })}
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
                    value={formNote.businessId || ''}
                    onChange={(e) => setFormNote({ ...formNote, businessId: e.target.value })}
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
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Content (Multi-line text / procedure) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formNote.content || ''}
                  onChange={(e) => setFormNote({ ...formNote, content: e.target.value })}
                  placeholder="Type note content or procedure..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-pin"
                  checked={formNote.isPinned || false}
                  onChange={(e) => setFormNote({ ...formNote, isPinned: e.target.checked })}
                  className="rounded text-violet-500"
                />
                <label htmlFor="chk-pin" className="text-xs text-slate-300 font-medium">
                  Pin this note to the top of the list
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
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Note
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
            <h3 className="text-base font-bold text-white">Delete Note?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this note?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirmId)}
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
