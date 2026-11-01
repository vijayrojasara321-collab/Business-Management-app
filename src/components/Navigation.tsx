/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  Clock,
  Menu,
  X,
  PhoneCall,
  Calendar,
  UserCheck,
  MessageSquare,
  KeyRound,
  FileText,
  FolderOpen,
  ShoppingCart,
  BookOpen,
  Settings,
  Search,
  BookUser,
  DownloadCloud,
} from 'lucide-react';
import { AppModule } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ApkExportModal } from './ApkExportModal';

interface NavigationProps {
  currentModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  onOpenSearch: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentModule,
  onSelectModule,
  onOpenSearch,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  const mainBottomTabs: { module: AppModule; label: string; icon: React.ReactNode }[] = [
    { module: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { module: 'businesses', label: 'Businesses', icon: <Building2 className="w-5 h-5" /> },
    { module: 'people', label: 'People', icon: <Users className="w-5 h-5" /> },
    { module: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { module: 'timetable', label: 'Planner', icon: <Clock className="w-5 h-5" /> },
  ];

  const allModulesList: {
    category: string;
    items: { module: AppModule; label: string; icon: React.ReactNode; desc: string }[];
  }[] = [
    {
      category: 'Core Management',
      items: [
        {
          module: 'dashboard',
          label: 'Executive Dashboard',
          icon: <LayoutDashboard className="w-5 h-5 text-sky-400" />,
          desc: 'High-level business overview & metrics',
        },
        {
          module: 'businesses',
          label: 'Business Profiles',
          icon: <Building2 className="w-5 h-5 text-blue-400" />,
          desc: 'Multiple entities, bank accounts, GSTIN, activities',
        },
        {
          module: 'people',
          label: 'People & Associations',
          icon: <Users className="w-5 h-5 text-indigo-400" />,
          desc: 'Partners & employees across multiple businesses',
        },
        {
          module: 'directory',
          label: 'Contact Directory',
          icon: <BookUser className="w-5 h-5 text-amber-400" />,
          desc: 'Customers, suppliers, transporters, lawyers',
        },
      ],
    },
    {
      category: 'Activities & Scheduling',
      items: [
        {
          module: 'tasks',
          label: 'Task Manager',
          icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
          desc: 'Priority, due dates, assignments, status',
        },
        {
          module: 'timetable',
          label: 'Timetable & Daily Planner',
          icon: <Clock className="w-5 h-5 text-teal-400" />,
          desc: 'Day/week schedule & conflict detection',
        },
        {
          module: 'calls',
          label: 'Call Records',
          icon: <PhoneCall className="w-5 h-5 text-green-400" />,
          desc: 'Manual call logger with dialer & follow-up hook',
        },
        {
          module: 'meetings',
          label: 'Meeting Management',
          icon: <Calendar className="w-5 h-5 text-purple-400" />,
          desc: 'Agendas, minutes, decisions & next actions',
        },
        {
          module: 'followups',
          label: 'Follow-up Tracker',
          icon: <UserCheck className="w-5 h-5 text-rose-400" />,
          desc: 'Customer, supplier & partner follow-ups',
        },
      ],
    },
    {
      category: 'Operations & Documents',
      items: [
        {
          module: 'orders',
          label: 'Order Management',
          icon: <ShoppingCart className="w-5 h-5 text-amber-500" />,
          desc: 'Sales and Purchase orders tracking',
        },
        {
          module: 'messages',
          label: 'Message Templates',
          icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
          desc: 'WhatsApp, SMS & email reusable formats',
        },
        {
          module: 'credentials',
          label: 'Secure Credentials',
          icon: <KeyRound className="w-5 h-5 text-yellow-400" />,
          desc: 'Govt portals, bank logins with Keystore encryption',
        },
        {
          module: 'notes',
          label: 'Business Notes',
          icon: <FileText className="w-5 h-5 text-violet-400" />,
          desc: 'SOPs, strategy memos, pinned items',
        },
        {
          module: 'documents',
          label: 'Document Storage',
          icon: <FolderOpen className="w-5 h-5 text-orange-400" />,
          desc: 'PDFs, KYC, certificates, licenses',
        },
        {
          module: 'templates',
          label: 'Document Formats',
          icon: <BookOpen className="w-5 h-5 text-pink-400" />,
          desc: 'Export invoices, letters, contract formats',
        },
      ],
    },
    {
      category: 'System & Security',
      items: [
        {
          module: 'settings',
          label: 'Settings & Offline Backup',
          icon: <Settings className="w-5 h-5 text-slate-400" />,
          desc: 'Full JSON backup, Room DB stats, PIN lock, Android Studio Export',
        },
      ],
    },
  ];

  return (
    <>
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 active:scale-95 transition"
            title="Open all modules menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>My Personal Business Assistant</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Offline Room DB • Native Android Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            title="Download APK / Android Studio Project"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Get APK</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 active:scale-95 transition"
            title="Search anything (Businesses, People, Tasks)"
          >
            <Search className="w-4 h-4" />
          </button>

          {isIOS && (
            <button
              onClick={() => setShowIOSInstall(true)}
              className="px-2 py-1 text-xs text-sky-400 hover:bg-slate-800 rounded-lg border border-slate-700"
            >
              Install on iOS
            </button>
          )}
        </div>
      </header>

      {/* APK & Android Installation Modal */}
      <ApkExportModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />

      {/* iOS Install Guide Modal */}
      {showIOSInstall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
              3. The app will launch in standalone native fullscreen mode!
            </p>
            <button
              onClick={() => setShowIOSInstall(false)}
              className="mt-5 w-full rounded-xl bg-sky-600 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Side Navigation Drawer for all 16 modules */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative w-80 max-w-[85%] h-full bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Biz Assistant</h2>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    100% Offline • 16 Modules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              {allModulesList.map((sec, idx) => (
                <div key={idx}>
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {sec.category}
                  </p>
                  <div className="space-y-1">
                    {sec.items.map((item) => {
                      const isSelected = currentModule === item.module;
                      return (
                        <button
                          key={item.module}
                          onClick={() => {
                            onSelectModule(item.module);
                            setDrawerOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition ${
                            isSelected
                              ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-xl ${
                              isSelected ? 'bg-sky-500/20' : 'bg-slate-800/80'
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.label}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 font-medium">
                My Personal Business Assistant v1.0.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Material 3 Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
        {mainBottomTabs.map((tab) => {
          const isSelected = currentModule === tab.module;
          return (
            <button
              key={tab.module}
              onClick={() => onSelectModule(tab.module)}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition duration-150 ${
                isSelected
                  ? 'text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`px-4 py-1 rounded-full transition-colors ${
                  isSelected ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400'
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
        {/* Extra "More" button to toggle full module menu */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition duration-150 ${
            !mainBottomTabs.some((t) => t.module === currentModule)
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`px-4 py-1 rounded-full transition-colors ${
              !mainBottomTabs.some((t) => t.module === currentModule)
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </nav>

      {/* APK & Android Studio Export Modal */}
      <ApkExportModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </>
  );
};
