/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Plus,
  X,
  Building2,
  UserPlus,
  CheckSquare,
  Calendar,
  Contact,
  PhoneCall,
} from 'lucide-react';

interface SpeedDialFABProps {
  onAddBusiness: () => void;
  onAddPerson: () => void;
  onAddTask: () => void;
  onAddMeeting: () => void;
  onAddContact: () => void;
  onAddCall: () => void;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  onAddBusiness,
  onAddPerson,
  onAddTask,
  onAddMeeting,
  onAddContact,
  onAddCall,
}) => {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: 'Add Call Record',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      onClick: onAddCall,
      bg: 'bg-emerald-950/80 border-emerald-700/50 hover:bg-emerald-900',
    },
    {
      label: 'Add Directory Contact',
      icon: <Contact className="w-4 h-4 text-amber-400" />,
      onClick: onAddContact,
      bg: 'bg-amber-950/80 border-amber-700/50 hover:bg-amber-900',
    },
    {
      label: 'Schedule Meeting',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      onClick: onAddMeeting,
      bg: 'bg-purple-950/80 border-purple-700/50 hover:bg-purple-900',
    },
    {
      label: 'Add New Task',
      icon: <CheckSquare className="w-4 h-4 text-blue-400" />,
      onClick: onAddTask,
      bg: 'bg-blue-950/80 border-blue-700/50 hover:bg-blue-900',
    },
    {
      label: 'Add Partner / Employee',
      icon: <UserPlus className="w-4 h-4 text-cyan-400" />,
      onClick: onAddPerson,
      bg: 'bg-cyan-950/80 border-cyan-700/50 hover:bg-cyan-900',
    },
    {
      label: 'Add New Business',
      icon: <Building2 className="w-4 h-4 text-sky-400" />,
      onClick: onAddBusiness,
      bg: 'bg-sky-950/80 border-sky-700/50 hover:bg-sky-900',
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end pointer-events-auto">
      {/* Backdrop when opened */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30"
        />
      )}

      {/* Speed Dial Menu items */}
      {open && (
        <div className="flex flex-col items-end gap-2.5 mb-3 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {actions.map((act, i) => (
            <div
              key={i}
              onClick={() => {
                setOpen(false);
                act.onClick();
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-md group-hover:bg-slate-800 transition">
                {act.label}
              </span>
              <div
                className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg transition transform group-hover:scale-105 active:scale-95 ${act.bg}`}
              >
                {act.icon}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Material 3 FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 active:scale-95 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center border border-sky-400/30 transition-transform duration-200 z-40"
        title="Add new record"
      >
        {open ? <X className="w-6 h-6 rotate-90" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};
