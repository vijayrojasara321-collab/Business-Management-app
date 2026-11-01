/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, BatteryCharging, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode: 'android_frame' | 'responsive';
  onToggleViewMode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  viewMode,
  onToggleViewMode,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (viewMode === 'responsive') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top bar control to switch to Android phone frame */}
        <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">My Personal Business Assistant</span>
            <span className="text-slate-500 hidden sm:inline">• Room Database (Offline)</span>
          </div>
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium text-xs border border-slate-700"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            Switch to Android Phone Frame
          </button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-4 px-2 flex flex-col items-center justify-center">
      {/* Device frame switch controller */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[430px] px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Pixel 9 Pro • Material 3</span>
        </div>
        <button
          onClick={onToggleViewMode}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-medium text-xs border border-slate-700"
        >
          <Monitor className="w-3.5 h-3.5 text-sky-400" />
          Expand to Full Screen
        </button>
      </div>

      {/* Android Device Outer Bezel */}
      <div className="w-full max-w-[430px] h-[890px] bg-slate-900 border-[8px] border-slate-800 rounded-[50px] shadow-2xl shadow-sky-950/40 relative flex flex-col overflow-hidden ring-1 ring-slate-700/60">
        {/* Punch-hole camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 border border-slate-800/80 shadow-inner" />

        {/* Android Material Status Bar */}
        <div className="w-full h-9 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 select-none border-b border-slate-800/40">
          <span>{time || '09:41'}</span>
          <div className="flex items-center gap-2 text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">100%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Device Screen Content */}
        <div className="flex-1 w-full overflow-hidden flex flex-col bg-slate-950 text-slate-100 relative">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="w-full h-5 bg-slate-950 flex items-center justify-center z-30 border-t border-slate-900">
          <div className="w-32 h-1 bg-slate-600/70 rounded-full hover:bg-slate-500 transition" />
        </div>
      </div>
    </div>
  );
};
