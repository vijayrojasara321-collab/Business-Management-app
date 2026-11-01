/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Building2,
  Users,
  CheckSquare,
  BookUser,
  FileText,
  Calendar,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { AppDatabaseState } from '../services/storage';
import { AppModule } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppDatabaseState;
  onNavigate: (module: AppModule) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  state,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matches: {
      type: string;
      title: string;
      subtitle: string;
      module: AppModule;
      icon: React.ReactNode;
    }[] = [];

    // Search Businesses
    state.businesses.forEach((b) => {
      if (
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.registrationNumber.toLowerCase().includes(q)
      ) {
        matches.push({
          type: 'Business',
          title: b.name,
          subtitle: `${b.category} • ${b.type}`,
          module: 'businesses',
          icon: <Building2 className="w-4 h-4 text-sky-400" />,
        });
      }
    });

    // Search People
    state.people.forEach((p) => {
      if (
        p.fullName.toLowerCase().includes(q) ||
        p.designation.toLowerCase().includes(q) ||
        p.phoneNumbers.some((num) => num.includes(q))
      ) {
        matches.push({
          type: 'Person',
          title: p.fullName,
          subtitle: `${p.primaryType} • ${p.designation}`,
          module: 'people',
          icon: <Users className="w-4 h-4 text-indigo-400" />,
        });
      }
    });

    // Search Directory
    state.directory.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phone.includes(q)
      ) {
        matches.push({
          type: 'Contact',
          title: c.name,
          subtitle: `${c.category} • ${c.company || c.phone}`,
          module: 'directory',
          icon: <BookUser className="w-4 h-4 text-amber-400" />,
        });
      }
    });

    // Search Tasks
    state.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) {
        matches.push({
          type: 'Task',
          title: t.title,
          subtitle: `Priority: ${t.priority} • Due: ${t.dueDate}`,
          module: 'tasks',
          icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
        });
      }
    });

    // Search Meetings
    state.meetings.forEach((m) => {
      if (m.title.toLowerCase().includes(q) || m.purpose.toLowerCase().includes(q)) {
        matches.push({
          type: 'Meeting',
          title: m.title,
          subtitle: `Date: ${m.date} ${m.startTime}`,
          module: 'meetings',
          icon: <Calendar className="w-4 h-4 text-purple-400" />,
        });
      }
    });

    // Search Orders
    state.orders.forEach((o) => {
      if (
        o.orderNumber.toLowerCase().includes(q) ||
        o.orderTitle.toLowerCase().includes(q) ||
        o.customerOrSupplier.toLowerCase().includes(q)
      ) {
        matches.push({
          type: 'Order',
          title: `${o.orderNumber} - ${o.orderTitle}`,
          subtitle: `${o.orderType} • ${o.customerOrSupplier}`,
          module: 'orders',
          icon: <ShoppingCart className="w-4 h-4 text-orange-400" />,
        });
      }
    });

    // Search Notes
    state.notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        matches.push({
          type: 'Note',
          title: n.title,
          subtitle: n.category,
          module: 'notes',
          icon: <FileText className="w-4 h-4 text-violet-400" />,
        });
      }
    });

    return matches.slice(0, 15);
  }, [query, state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search businesses, people, tasks, contacts, orders..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Type to search across all 16 business modules
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onNavigate(res.module);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/70 text-left transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition">
                      {res.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {res.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                          {res.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {res.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
