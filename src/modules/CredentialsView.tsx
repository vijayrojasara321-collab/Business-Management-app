/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  ShieldCheck,
  Lock,
  Edit2,
  Trash2,
  X,
  Building2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { CredentialItem } from '../types';
import { storageService, AppDatabaseState } from '../services/storage';
import { encryptSecret, decryptSecret } from '../services/crypto';
import { useToast } from '../components/Toast';
import { PinLockModal } from '../components/PinLockModal';

interface CredentialsViewProps {
  state: AppDatabaseState;
}

export const CredentialsView: React.FC<CredentialsViewProps> = ({ state }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formCred, setFormCred] = useState<Partial<CredentialItem>>({});
  const [plainPasswordInput, setPlainPasswordInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = ['All', 'Govt Portal', 'Banking', 'Vendor', 'Cloud', 'Social', 'Internal', 'Other'];

  const filteredCredentials = state.credentials.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accountNumberOrRef.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    setFormCred({
      id: `cred-${Date.now()}`,
      title: '',
      loginUrl: 'https://',
      username: '',
      email: '',
      passwordCipher: '',
      accountNumberOrRef: '',
      businessId: state.businesses[0]?.id || '',
      category: 'Govt Portal',
      notes: '',
      createdAt: Date.now(),
    });
    setPlainPasswordInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = async (cred: CredentialItem) => {
    setFormCred(JSON.parse(JSON.stringify(cred)));
    const decrypted = await decryptSecret(cred.passwordCipher, state.settings.pinCode);
    setPlainPasswordInput(decrypted);
    setIsEditing(true);
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCred.title?.trim() || !formCred.username?.trim()) {
      showToast('Title and username are required', 'error');
      return;
    }
    const encrypted = await encryptSecret(plainPasswordInput, state.settings.pinCode);
    const finalCred: CredentialItem = {
      ...(formCred as CredentialItem),
      passwordCipher: encrypted,
    };
    storageService.saveCredential(finalCred);
    showToast(`Credentials for "${finalCred.title}" saved securely`);
    setIsEditing(false);
  };

  const handleDeleteCredential = (id: string) => {
    storageService.deleteCredential(id);
    showToast('Credential removed');
    setDeleteConfirmId(null);
  };

  const handleToggleRevealPassword = async (cred: CredentialItem) => {
    if (!isUnlocked && state.settings.isPinEnabled && state.settings.pinCode) {
      setShowPinModal(true);
      return;
    }

    if (revealedPasswords[cred.id]) {
      const next = { ...revealedPasswords };
      delete next[cred.id];
      setRevealedPasswords(next);
    } else {
      const plain = await decryptSecret(cred.passwordCipher, state.settings.pinCode);
      setRevealedPasswords({ ...revealedPasswords, [cred.id]: plain });
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard! 📋');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyPassword = async (cred: CredentialItem) => {
    const plain =
      revealedPasswords[cred.id] || (await decryptSecret(cred.passwordCipher, state.settings.pinCode));
    handleCopy(`pwd-${cred.id}`, plain);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-yellow-400" />
            <span>Secure Credentials & Keystore</span>
          </h2>
          <p className="text-xs text-slate-400">
            Encrypted on-device passwords for GST, ICEGATE, DGFT & Corporate NetBanking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {state.settings.isPinEnabled && (
            <button
              onClick={() => (isUnlocked ? setIsUnlocked(false) : setShowPinModal(true))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {isUnlocked ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-yellow-400" />}
              {isUnlocked ? 'Keystore Unlocked' : 'Unlock Vault'}
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Credential
          </button>
        </div>
      </div>

      {/* Security Info Badge */}
      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          AES-256 GCM encrypted in local app storage. Passwords are never sent across any network.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by portal name, username, or account reference..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-yellow-500"
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

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCredentials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/60 md:col-span-2">
            No credentials found matching the filter.
          </div>
        ) : (
          filteredCredentials.map((cred) => {
            const biz = state.businesses.find((b) => b.id === cred.businessId);
            const isRevealed = !!revealedPasswords[cred.id];

            return (
              <div
                key={cred.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold">
                        {cred.category}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1.5 leading-snug">
                        {cred.title}
                      </h3>
                      {biz && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {biz.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {cred.loginUrl && (
                        <a
                          href={cred.loginUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                          title="Open login URL in browser"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEdit(cred)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(cred.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Username & Account Row */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Username:</span>
                        <span className="font-mono font-bold text-white">{cred.username}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(`usr-${cred.id}`, cred.username)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                        title="Copy username"
                      >
                        {copiedKey === `usr-${cred.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Password:</span>
                        <span className="font-mono font-bold text-yellow-300">
                          {isRevealed ? revealedPasswords[cred.id] : '••••••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRevealPassword(cred)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                          title={isRevealed ? 'Hide password' : 'Show password'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyPassword(cred)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                          title="Copy password"
                        >
                          {copiedKey === `pwd-${cred.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {cred.accountNumberOrRef && (
                      <p className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                        Ref / Acc: {cred.accountNumberOrRef}
                      </p>
                    )}
                  </div>

                  {cred.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-2">{cred.notes}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PIN Unlock Modal */}
      <PinLockModal
        isOpen={showPinModal}
        correctPin={state.settings.pinCode || '1234'}
        onSuccess={() => {
          setIsUnlocked(true);
          setShowPinModal(false);
          showToast('Keystore vault unlocked! 🔓');
        }}
        onClose={() => setShowPinModal(false)}
        title="Unlock Credentials Vault"
        subtitle="Enter PIN to inspect sensitive passwords"
      />

      {/* Add / Edit Credential Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveCredential}
            className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-yellow-400" />
                <span>{formCred.id ? 'Edit Credential' : 'Add Credential'}</span>
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
                  Service / Portal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formCred.title || ''}
                  onChange={(e) => setFormCred({ ...formCred, title: e.target.value })}
                  placeholder="e.g. DGFT Directorate General of Foreign Trade"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Login URL
                </label>
                <input
                  type="url"
                  value={formCred.loginUrl || ''}
                  onChange={(e) => setFormCred({ ...formCred, loginUrl: e.target.value })}
                  placeholder="https://services.gst.gov.in"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={formCred.category || 'Govt Portal'}
                    onChange={(e) => setFormCred({ ...formCred, category: e.target.value as any })}
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
                    value={formCred.businessId || ''}
                    onChange={(e) => setFormCred({ ...formCred, businessId: e.target.value })}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Username / Login ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCred.username || ''}
                    onChange={(e) => setFormCred({ ...formCred, username: e.target.value })}
                    placeholder="e.g. APEX_SURAT_2026"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={plainPasswordInput}
                    onChange={(e) => setPlainPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={formCred.email || ''}
                    onChange={(e) => setFormCred({ ...formCred, email: e.target.value })}
                    placeholder="accounts@example.com"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Reference / Account No.
                  </label>
                  <input
                    type="text"
                    value={formCred.accountNumberOrRef || ''}
                    onChange={(e) => setFormCred({ ...formCred, accountNumberOrRef: e.target.value })}
                    placeholder="e.g. GSTIN / Cust ID"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                  Security Notes (DSC Token, expiry rules)
                </label>
                <textarea
                  rows={2}
                  value={formCred.notes || ''}
                  onChange={(e) => setFormCred({ ...formCred, notes: e.target.value })}
                  placeholder="e.g. Requires Token #2, changes every 90 days..."
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
                className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded-xl font-bold shadow-md"
              >
                Encrypt & Save
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
            <h3 className="text-base font-bold text-white">Delete Credential?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this login record?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCredential(deleteConfirmId)}
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
