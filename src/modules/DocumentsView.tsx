/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Trash2,
  Edit2,
  X,
  Upload,
  AlertTriangle,
  Building2,
  Calendar,
  Share2,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Layers,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { useToast } from '../components/Toast';

interface DocumentsViewProps {
  state: AppDatabaseState;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [businessFilter, setBusinessFilter] = useState('All');
  const [collapsedBusinesses, setCollapsedBusinesses] = useState<Record<string, boolean>>({});
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DocumentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formDoc, setFormDoc] = useState<Partial<DocumentItem>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'All',
    'Legal & Registration',
    'Tax & Financial',
    'Agreements & Contracts',
    'Identity & KYC',
    'Invoices & Receipts',
    'Certificates',
    'Other',
  ];

  const handleOpenAdd = (preselectedBusinessId?: string) => {
    setFormDoc({
      id: `doc-${Date.now()}`,
      title: '',
      fileName: '',
      fileType: 'application/pdf',
      fileSize: 0,
      fileDataUrl: '',
      description: '',
      uploadDate: new Date().toISOString().split('T')[0],
      businessId: preselectedBusinessId || state.businesses[0]?.id || '',
      category: 'Legal & Registration',
      expiryDate: '',
      reminder: false,
      notes: '',
      createdAt: Date.now(),
    });
    setIsEditing(true);
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormDoc((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileDataUrl: result,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
      showToast(`Selected file "${file.name}" (${Math.round(file.size / 1024)} KB)`);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setFormDoc(JSON.parse(JSON.stringify(doc)));
    setIsEditing(true);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDoc.title?.trim()) {
      showToast('Document title is required', 'error');
      return;
    }
    storageService.saveDocument(formDoc as DocumentItem);
    showToast(`Document "${formDoc.title}" saved`);
    setIsEditing(false);
  };

  const handleDeleteDocument = (id: string) => {
    storageService.deleteDocument(id);
    showToast('Document removed');
    setDeleteConfirmId(null);
    if (selectedPreviewDoc?.id === id) setSelectedPreviewDoc(null);
  };

  const handleDownload = (doc: DocumentItem) => {
    if (!doc.fileDataUrl) {
      showToast('No raw file content stored', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.fileDataUrl;
    a.download = doc.fileName || `${doc.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading "${doc.fileName || doc.title}"`);
  };

  const handleShare = async (doc: DocumentItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: doc.title,
          text: doc.description || doc.title,
        });
        showToast('Document link shared');
      } catch (err) {}
    } else {
      handleDownload(doc);
    }
  };

  const toggleCollapseBusiness = (bizId: string) => {
    setCollapsedBusinesses((prev) => ({ ...prev, [bizId]: !prev[bizId] }));
  };

  // Filter documents based on search and category
  const matchFilter = (doc: DocumentItem) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCat;
  };

  // Group by business
  const businessesToDisplay = state.businesses.filter(
    (b) => businessFilter === 'All' || b.id === businessFilter
  );

  const unassignedDocs = state.documents.filter(
    (d) => (!d.businessId || !state.businesses.some((b) => b.id === d.businessId)) && matchFilter(d)
  );

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-5 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-orange-400" />
            <span>Document Storage by Business</span>
          </h2>
          <p className="text-xs text-slate-400">
            Each business entity manages its own dedicated compliance, export, and KYC document repository
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Upload Document
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
            placeholder="Search documents by title, filename or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium"
          >
            <option value="All">All Businesses</option>
            {state.businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

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
      </div>

      {/* BUSINESS-CENTRIC DOCUMENTS SECTIONS */}
      <div className="space-y-5">
        {businessesToDisplay.map((biz) => {
          const bizDocs = state.documents.filter((d) => d.businessId === biz.id && matchFilter(d));
          const isCollapsed = !!collapsedBusinesses[biz.id];

          return (
            <div
              key={biz.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden transition"
            >
              {/* Business Header Banner */}
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => toggleCollapseBusiness(biz.id)}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-md flex-shrink-0"
                    style={{ backgroundColor: biz.logoColor || '#0284c7' }}
                  >
                    {biz.name ? biz.name.slice(0, 2).toUpperCase() : 'BZ'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">{biz.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {biz.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30">
                        {bizDocs.length} {bizDocs.length === 1 ? 'Document' : 'Documents'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {biz.category} {biz.registrationNumber && `• Reg: ${biz.registrationNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenAdd(biz.id)}
                    className="px-3 py-1.5 bg-orange-600/90 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    Upload for {biz.name.split(' ')[0]}
                  </button>

                  <button
                    onClick={() => toggleCollapseBusiness(biz.id)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                    title={isCollapsed ? 'Expand documents' : 'Collapse documents'}
                  >
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Documents Inside This Business */}
              {!isCollapsed && (
                <div className="p-4">
                  {bizDocs.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 border-dashed">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-300">
                        No documents stored under {biz.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                        Upload GST certificates, import-export licenses, export invoices, or contracts.
                      </p>
                      <button
                        onClick={() => handleOpenAdd(biz.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-xl text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Document Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {bizDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold">
                                  {doc.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <button
                                  onClick={() => handleOpenEdit(doc)}
                                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(doc.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-white mt-2 leading-snug line-clamp-1">
                              {doc.title}
                            </h4>

                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {doc.description || doc.fileName}
                            </p>

                            <div className="mt-2.5 text-[10px] text-slate-400 space-y-1 font-mono">
                              <p className="text-slate-500">
                                Date: {doc.uploadDate} {doc.fileSize ? `(${Math.round(doc.fileSize / 1024)} KB)` : ''}
                              </p>
                              {doc.expiryDate && (
                                <p className="text-amber-400 font-bold">Expires: {doc.expiryDate}</p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                            <button
                              onClick={() => setSelectedPreviewDoc(doc)}
                              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-400" /> Preview
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                              title="Download file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShare(doc)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                              title="Share document"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* General / Unassigned Documents Section */}
        {unassignedDocs.length > 0 && (
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden transition">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm">
                  GEN
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">General & Multi-Entity Documents</h3>
                  <p className="text-[11px] text-slate-400">
                    {unassignedDocs.length} documents not tied to a single specific business
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unassignedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {doc.category}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1.5 truncate">{doc.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{doc.description}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <button
                      onClick={() => setSelectedPreviewDoc(doc)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" /> Preview
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedPreviewDoc.title}</h3>
                <p className="text-slate-400 text-[11px]">
                  {selectedPreviewDoc.fileName} • {selectedPreviewDoc.category}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedPreviewDoc)}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => setSelectedPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center min-h-[300px]">
              {selectedPreviewDoc.fileDataUrl?.startsWith('data:image/') ? (
                <img
                  src={selectedPreviewDoc.fileDataUrl}
                  alt={selectedPreviewDoc.title}
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-lg"
                />
              ) : selectedPreviewDoc.fileDataUrl?.startsWith('data:application/pdf') ? (
                <div className="w-full h-[60vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <iframe
                    src={selectedPreviewDoc.fileDataUrl}
                    className="w-full h-full"
                    title={selectedPreviewDoc.title}
                  />
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-orange-400 mx-auto" />
                  <p className="font-bold text-white text-sm">{selectedPreviewDoc.fileName}</p>
                  <p className="text-slate-400 text-xs">
                    Binary document stored safely in offline Room/IndexedDB vault.
                  </p>
                  <button
                    onClick={() => handleDownload(selectedPreviewDoc)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl"
                  >
                    Download File to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Document Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveDocument}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-orange-400" />
                <span>{formDoc.id ? 'Edit Document Details' : 'Upload Document'}</span>
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
              {/* File Upload Box */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Select File from Phone / Device
                </label>
                <label className="border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/50 transition">
                  <Upload className="w-6 h-6 text-orange-400 mb-1.5" />
                  <span className="font-semibold text-white">
                    {formDoc.fileName ? formDoc.fileName : 'Tap to browse PDF, Image or Document'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {formDoc.fileSize ? `${Math.round(formDoc.fileSize / 1024)} KB` : 'All formats supported'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFilePicked}
                  />
                </label>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={formDoc.title || ''}
                  onChange={(e) => setFormDoc({ ...formDoc, title: e.target.value })}
                  placeholder="e.g. DGFT Import Export Code (IEC) Certificate"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Belongs to Business *
                  </label>
                  <select
                    value={formDoc.businessId || ''}
                    onChange={(e) => setFormDoc({ ...formDoc, businessId: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-sky-400"
                  >
                    <option value="">General / Enterprise Wide</option>
                    {state.businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={formDoc.category || 'Legal & Registration'}
                    onChange={(e) => setFormDoc({ ...formDoc, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Upload Date
                  </label>
                  <input
                    type="date"
                    value={formDoc.uploadDate || ''}
                    onChange={(e) => setFormDoc({ ...formDoc, uploadDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formDoc.expiryDate || ''}
                    onChange={(e) => setFormDoc({ ...formDoc, expiryDate: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Description & Filing Notes
                </label>
                <textarea
                  rows={2}
                  value={formDoc.description || ''}
                  onChange={(e) => setFormDoc({ ...formDoc, description: e.target.value })}
                  placeholder="Notes about document origin, physical file folder location..."
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
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-md"
              >
                Save Document
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
            <h3 className="text-base font-bold text-white">Delete Document?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this document from offline storage?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteConfirmId)}
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
