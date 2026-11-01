/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  FileText,
  Tag,
} from 'lucide-react';
import { BusinessTemplateItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface TemplatesViewProps {
  state: AppDatabaseState;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTmpl, setFormTmpl] = useState<Partial<BusinessTemplateItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'All',
    'Business Letter',
    'Email Format',
    'Quotation Format',
    'Standard Message',
    'Checklist',
    'Contract Outline',
    'Invoice Memo',
    'Custom',
  ];

  const filteredTemplates = state.templates.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormTmpl({
      id: `btmpl-${Date.now()}`,
      title: '',
      category: 'Business Letter',
      content: '',
      tags: ['Corporate', 'Formal'],
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (t: BusinessTemplateItem) => {
    setFormTmpl(JSON.parse(JSON.stringify(t)));
    setIsEditing(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTmpl.title?.trim() || !formTmpl.content?.trim()) {
      showToast('Title and template content are required', 'error');
      return;
    }
    storageService.saveBusinessTemplate(formTmpl as BusinessTemplateItem);
    showToast(`Format "${formTmpl.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    storageService.deleteBusinessTemplate(id);
    showToast('Template deleted');
    setDeleteConfirmId(null);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast('Document format copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-pink-400" />
            <span>Document & Business Formats</span>
          </h2>
          <p className="text-xs text-slate-400">
            Standard corporate letterheads, export invoices, contracts & payment follow-up letters
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Format
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
            placeholder="Search templates by title or content..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-500"
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

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60">
            No formats found. Click "Add Format" to create one.
          </div>
        ) : (
          filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                      {t.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {t.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(t.id, t.content)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedId === t.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {copiedId === t.id ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {t.content}
                </div>

                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {t.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 border border-slate-700 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Template Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveTemplate}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                <span>{formTmpl.id ? 'Edit Document Format' : 'Add Document Format'}</span>
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
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTmpl.title || ''}
                  onChange={(e) => setFormTmpl({ ...formTmpl, title: e.target.value })}
                  placeholder="e.g. Export Commercial Invoice & Packing List"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Category
                </label>
                <select
                  value={formTmpl.category || 'Business Letter'}
                  onChange={(e) => setFormTmpl({ ...formTmpl, category: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
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
                  Template Content (Formatted Text) *
                </label>
                <textarea
                  rows={10}
                  required
                  value={formTmpl.content || ''}
                  onChange={(e) => setFormTmpl({ ...formTmpl, content: e.target.value })}
                  placeholder="Type or paste document outline, variables in [brackets]..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px] leading-relaxed"
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
                className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Format
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
            <h3 className="text-base font-bold text-white">Delete Document Format?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this format?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(deleteConfirmId)}
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
