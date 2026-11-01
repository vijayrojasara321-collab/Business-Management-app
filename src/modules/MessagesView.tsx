/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Copy,
  Share2,
  ExternalLink,
  Mail,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { MessageTemplate } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface MessagesViewProps {
  state: AppDatabaseState;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTemplate, setFormTemplate] = useState<Partial<MessageTemplate>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'All',
    'WhatsApp',
    'SMS',
    'Email',
    'Business Reply',
    'Customer',
    'Supplier',
    'Payment Reminder',
    'Follow-up',
    'Custom',
  ];

  const filteredTemplates = state.messages.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormTemplate({
      id: `msg-${Date.now()}`,
      title: '',
      category: 'WhatsApp',
      content: '',
      language: 'English',
      businessId: state.businesses[0]?.id || '',
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (t: MessageTemplate) => {
    setFormTemplate(JSON.parse(JSON.stringify(t)));
    setIsEditing(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTemplate.title?.trim() || !formTemplate.content?.trim()) {
      showToast('Title and message content are required', 'error');
      return;
    }
    storageService.saveMessageTemplate(formTemplate as MessageTemplate);
    showToast(`Template "${formTemplate.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    storageService.deleteMessageTemplate(id);
    showToast('Template deleted');
    setDeleteConfirmId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Message copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        });
        showToast('Shared successfully!');
      } catch (err) {
        // user cancelled share
      }
    } else {
      handleCopy(title, text);
    }
  };

  const handleOpenWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleOpenEmail = (title: string, text: string) => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Message Templates</span>
          </h2>
          <p className="text-xs text-slate-400">
            Pre-written professional responses for WhatsApp, Email, Payment Reminders & PO updates
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Template
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
            placeholder="Search templates by title or message keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60 md:col-span-2">
            No templates matching the selected filter.
          </div>
        ) : (
          filteredTemplates.map((t) => {
            const biz = state.businesses.find((b) => b.id === t.businessId);

            return (
              <div
                key={t.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        {t.category}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1.5 leading-snug">
                        {t.title}
                      </h3>
                      {biz && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {biz.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
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

                  {/* Message Preview Box */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {t.content}
                  </div>

                  {t.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-2">Note: {t.notes}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleCopy(t.id, t.content)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                  >
                    {copiedId === t.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {copiedId === t.id ? 'Copied' : 'Copy'}
                  </button>

                  <button
                    onClick={() => handleOpenWhatsApp(t.content)}
                    className="flex-1 py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => handleOpenEmail(t.title, t.content)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    title="Send Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleShare(t.title, t.content)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    title="Native Android Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
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
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>{formTemplate.id ? 'Edit Template' : 'Add Message Template'}</span>
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
                  value={formTemplate.title || ''}
                  onChange={(e) => setFormTemplate({ ...formTemplate, title: e.target.value })}
                  placeholder="e.g. Container Dispatch Notification"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={formTemplate.category || 'WhatsApp'}
                    onChange={(e) => setFormTemplate({ ...formTemplate, category: e.target.value as any })}
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
                    Related Business (optional)
                  </label>
                  <select
                    value={formTemplate.businessId || ''}
                    onChange={(e) => setFormTemplate({ ...formTemplate, businessId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="">Universal / All</option>
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
                  Message Content (Placeholders supported: [Customer Name], [Invoice No], [Amount]) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formTemplate.content || ''}
                  onChange={(e) => setFormTemplate({ ...formTemplate, content: e.target.value })}
                  placeholder="Type your message body..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Usage Notes
                </label>
                <input
                  type="text"
                  value={formTemplate.notes || ''}
                  onChange={(e) => setFormTemplate({ ...formTemplate, notes: e.target.value })}
                  placeholder="When to send, specific email addresses or triggers..."
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
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Template
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
            <h3 className="text-base font-bold text-white">Delete Message Template?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this message template?
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
