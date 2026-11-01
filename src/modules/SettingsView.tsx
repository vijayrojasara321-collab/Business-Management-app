/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Download,
  Upload,
  Database,
  Smartphone,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileCode,
  KeyRound,
  ExternalLink,
  DownloadCloud,
} from 'lucide-react';
import { AppDatabaseState, storageService } from '../services/storage';
import { generateAndroidStudioProjectZip } from '../services/androidProjectGenerator';
import { useToast } from '../components/Toast';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  state: AppDatabaseState;
  onToggleViewMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ state, onToggleViewMode }) => {
  const { showToast } = useToast();
  const { isInstallable, install, isInstalled } = usePWAInstall();

  const [pinInput, setPinInput] = useState(state.settings.pinCode || '');
  const [isExportingAndroidZip, setIsExportingAndroidZip] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  // Backup Export
  const handleExportBackup = () => {
    try {
      const json = storageService.exportBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `my_business_assistant_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Complete backup exported successfully! 💾');
    } catch (err) {
      showToast('Failed to export backup', 'error');
    }
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const res = storageService.importBackupJSON(text);
      if (res.success) {
        showToast(res.message);
        setImportSummary(
          `Restored: ${res.stats?.businesses} businesses, ${res.stats?.people} people, ${res.stats?.tasks} tasks, ${res.stats?.orders} orders.`
        );
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Android Studio Project ZIP Export
  const handleDownloadAndroidProject = async () => {
    setIsExportingAndroidZip(true);
    try {
      showToast('Packaging Kotlin + Jetpack Compose + Room Android Project...');
      const blob = await generateAndroidStudioProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'MyPersonalBusinessAssistant-AndroidStudio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Android Studio Project ZIP downloaded! Open in Android Studio to build APK 📱');
    } catch (err) {
      showToast('Failed to generate project ZIP', 'error');
    } finally {
      setIsExportingAndroidZip(false);
    }
  };

  // PIN settings update
  const handleSavePinSettings = (enable: boolean) => {
    if (enable && pinInput.length !== 4) {
      showToast('PIN must be exactly 4 digits', 'error');
      return;
    }
    storageService.updateSettings({
      isPinEnabled: enable,
      pinCode: pinInput,
    });
    showToast(enable ? '4-Digit PIN Lock Enabled! 🔒' : 'PIN Lock Disabled');
  };

  const handleResetData = () => {
    storageService.resetToDefault();
    showToast('Demo enterprise data restored!');
    setShowResetConfirm(false);
  };

  const totalRecords =
    state.businesses.length +
    state.people.length +
    state.directory.length +
    state.tasks.length +
    state.timetable.length +
    state.calls.length +
    state.meetings.length +
    state.followups.length +
    state.messages.length +
    state.credentials.length +
    state.notes.length +
    state.documents.length +
    state.orders.length +
    state.templates.length;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24 text-xs">
      {/* Header bar */}
      <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>App Settings, Security & Offline Backup</span>
        </h2>
        <p className="text-slate-400 mt-0.5">
          Native Android Room configuration, Keystore PIN protection, and full local data export
        </p>
      </div>

      {/* PWA & Mobile Installation Section */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-800/40 shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Install on Android Phone</h3>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Install as a full offline native standalone Android app via Chrome or download the complete Android Studio Kotlin project.
              </p>
            </div>
          </div>

          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold shadow-lg shadow-sky-600/30 flex items-center gap-2 transition flex-shrink-0"
            >
              <DownloadCloud className="w-4 h-4" />
              Install on Device
            </button>
          )}
        </div>

        {isInstalled && (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
            <CheckCircle2 className="w-4 h-4" />
            <span>Currently running in Standalone Installed App mode.</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400">
          <span>How to install on any phone: Tap Chrome menu (⋮) &gt; "Install app" or "Add to Home screen".</span>
          <button
            onClick={onToggleViewMode}
            className="text-sky-400 hover:underline font-semibold"
          >
            Toggle Phone Frame Mode
          </button>
        </div>
      </div>

      {/* Complete Native Android Studio Kotlin Project Generator */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-indigo-900/40 shadow-lg space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Download Android Studio Project (.zip)
              </h3>
              <p className="text-slate-300 mt-0.5 leading-relaxed">
                Contains complete Kotlin, Jetpack Compose Material 3, Room SQLite entities, DAOs, and Gradle scripts. Ready to open in Android Studio and build the standalone APK!
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadAndroidProject}
            disabled={isExportingAndroidZip}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            {isExportingAndroidZip ? 'Packaging ZIP...' : 'Download Project ZIP'}
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <p className="font-semibold text-indigo-300">Quick steps to build APK from this ZIP:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-400">
            <li>Unzip the downloaded project archive on your PC.</li>
            <li>Open Android Studio and click <strong>Open Existing Project</strong>.</li>
            <li>Click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
            <li>Transfer the generated <code className="text-sky-300 font-mono">app-debug.apk</code> to your phone to install!</li>
          </ol>
        </div>
      </div>

      {/* Security & App PIN Lock */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Security & App PIN Lock</h3>
            <p className="text-slate-400 text-[11px]">
              Protect sensitive business credentials and executive passwords with a 4-digit master PIN
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
              Set 4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 1234"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-center tracking-widest text-lg"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => handleSavePinSettings(true)}
              className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl shadow-md transition"
            >
              Enable / Update PIN
            </button>
            {state.settings.isPinEnabled && (
              <button
                onClick={() => handleSavePinSettings(false)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold rounded-xl border border-slate-700"
              >
                Disable
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Current status: {state.settings.isPinEnabled ? '🔒 PIN Protected' : '🔓 Unlocked (No PIN required)'}</span>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Complete Local Backup & Restore</h3>
            <p className="text-slate-400 text-[11px]">
              100% offline device storage. Export all businesses, tasks, credentials, and attachments as a validated JSON file.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export Button */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-3 text-left transition group"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Export Complete Backup</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Save complete dataset (.json) to phone storage
              </p>
            </div>
          </button>

          {/* Import Button */}
          <label className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-3 text-left transition group cursor-pointer">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Restore from Backup</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Select previously exported JSON backup file
              </p>
            </div>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>
        </div>

        {importSummary && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importSummary}</span>
          </div>
        )}
      </div>

      {/* Storage Information & Statistics */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          <span>Local Storage & Room Database Statistics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-lg font-black text-white">{state.businesses.length}</p>
            <p className="text-[10px] text-slate-400">Businesses</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-lg font-black text-white">{state.people.length}</p>
            <p className="text-[10px] text-slate-400">People & Staff</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-lg font-black text-white">{state.tasks.length}</p>
            <p className="text-[10px] text-slate-400">Tasks</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-lg font-black text-white">{totalRecords}</p>
            <p className="text-[10px] text-slate-400">Total Records</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400">
          <span>Engine: IndexedDB (Local Room Equivalent) • Storage: Private App Storage</span>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Sample Data
          </button>
        </div>
      </div>

      {/* About App */}
      <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 space-y-1">
        <p className="font-bold text-slate-400 text-xs">My Personal Business Assistant</p>
        <p className="text-[11px]">Version 1.0.0 • Native Android & Offline Architecture</p>
        <p className="text-[10px] text-slate-600">Zero Cloud Dependencies • 100% Private Device Storage</p>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Reset All Records to Demo Data?</h3>
            <p className="text-xs text-slate-400">
              This will overwrite current records with the default multi-business demo datasets.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
