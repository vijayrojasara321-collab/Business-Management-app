/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  FileCode,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { generateAndroidStudioProjectZip } from '../services/androidProjectGenerator';
import { useToast } from './Toast';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownloadProjectZip = async () => {
    setIsExporting(true);
    try {
      showToast('Compiling Kotlin + Jetpack Compose + Room Project ZIP...');
      const blob = await generateAndroidStudioProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyPersonalBusinessAssistant-AndroidStudio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Android Studio Project ZIP downloaded! Open in Android Studio to generate APK 📱');
    } catch (err) {
      showToast('Failed to generate project ZIP', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">How to Get APK & Install on Phone</h3>
              <p className="text-[11px] text-slate-400">
                Two verified methods to install My Personal Business Assistant on Android
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* METHOD 1: Direct Android Installation (Fastest, no PC needed) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-950 border border-sky-800/40 shadow-md space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                  METHOD 1 (RECOMMENDED • INSTANT)
                </span>
              </div>
              {isInstallable && !isInstalled && (
                <button
                  onClick={install}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Install Now
                </button>
              )}
            </div>

            <h4 className="text-xs font-bold text-white">
              Direct Phone Home Screen App (100% Offline Standalone PWA)
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              You can install this app directly on any Android phone without needing Android Studio or a computer:
            </p>

            <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
              <li>
                Open this app on your Android phone in <strong>Google Chrome</strong>.
              </li>
              <li>
                Tap the Chrome top-right menu (<strong>⋮</strong> three dots).
              </li>
              <li>
                Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </li>
              <li>
                The app icon will appear on your phone's home screen and app launcher. It runs completely offline with full on-device Room/IndexedDB storage!
              </li>
            </ol>
          </div>

          {/* METHOD 2: Native Android Studio Project ZIP -> Build APK */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-800/40 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                METHOD 2 • NATIVE ANDROID STUDIO PROJECT (.ZIP)
              </span>
            </div>

            <h4 className="text-xs font-bold text-white">
              Generate Standalone <code className="text-sky-300 font-mono">.apk</code> via Android Studio
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Download the complete Android Gradle project packaged with Kotlin, Jetpack Compose Material 3, and Room SQLite database:
            </p>

            {/* Direct Download Button */}
            <button
              onClick={handleDownloadProjectZip}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs transition"
            >
              <FileCode className="w-4 h-4" />
              {isExporting ? 'Packaging Project ZIP...' : 'Download Android Studio Project (.zip)'}
            </button>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300 text-[11px]">
              <p className="font-bold text-white">3 Steps to compile your APK:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>
                  <strong className="text-slate-200">Unzip</strong> the downloaded <code className="text-sky-300 font-mono">MyPersonalBusinessAssistant-AndroidStudio-Project.zip</code> file.
                </li>
                <li>
                  Open <strong className="text-slate-200">Android Studio</strong> and select <strong>File &gt; Open...</strong>, choosing the unzipped folder. Let Gradle sync.
                </li>
                <li>
                  Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                </li>
              </ol>
              <div className="mt-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[10px]">
                ✓ Android Studio will generate <code className="font-mono font-bold">app-debug.apk</code> inside <code className="font-mono">app/build/outputs/apk/debug/</code>. Transfer this file to your phone via USB or WhatsApp and tap to install!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
