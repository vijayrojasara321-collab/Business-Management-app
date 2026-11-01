/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppModule } from './types';
import { storageService, AppDatabaseState } from './services/storage';
import { ToastProvider, useToast } from './components/Toast';
import { AndroidFrame } from './components/AndroidFrame';
import { Navigation } from './components/Navigation';
import { SpeedDialFAB } from './components/SpeedDialFAB';
import { SearchModal } from './components/SearchModal';

// Module Views
import { DashboardView } from './modules/DashboardView';
import { BusinessesView } from './modules/BusinessesView';
import { PeopleView } from './modules/PeopleView';
import { DirectoryView } from './modules/DirectoryView';
import { TasksView } from './modules/TasksView';
import { TimetableView } from './modules/TimetableView';
import { CallsView } from './modules/CallsView';
import { MeetingsView } from './modules/MeetingsView';
import { FollowUpsView } from './modules/FollowUpsView';
import { MessagesView } from './modules/MessagesView';
import { CredentialsView } from './modules/CredentialsView';
import { NotesView } from './modules/NotesView';
import { DocumentsView } from './modules/DocumentsView';
import { OrdersView } from './modules/OrdersView';
import { TemplatesView } from './modules/TemplatesView';
import { SettingsView } from './modules/SettingsView';

function AppContent() {
  const [dbState, setDbState] = useState<AppDatabaseState>(storageService.getState());
  const [currentModule, setCurrentModule] = useState<AppModule>('dashboard');
  const [searchOpen, setSearchOpen] = useState(false);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setDbState({ ...storageService.getState() });
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleViewMode = () => {
    const nextMode = dbState.settings.viewMode === 'android_frame' ? 'responsive' : 'android_frame';
    storageService.updateSettings({ viewMode: nextMode });
  };

  const handleQuickAdd = (action: 'business' | 'person' | 'task' | 'meeting' | 'contact' | 'call') => {
    switch (action) {
      case 'business':
        setCurrentModule('businesses');
        break;
      case 'person':
        setCurrentModule('people');
        break;
      case 'task':
        setCurrentModule('tasks');
        break;
      case 'meeting':
        setCurrentModule('meetings');
        break;
      case 'contact':
        setCurrentModule('directory');
        break;
      case 'call':
        setCurrentModule('calls');
        break;
    }
  };

  return (
    <AndroidFrame
      viewMode={dbState.settings.viewMode}
      onToggleViewMode={handleToggleViewMode}
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
        {/* Navigation Top Bar */}
        <Navigation
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {currentModule === 'dashboard' && (
            <DashboardView
              state={dbState}
              onNavigate={(mod) => setCurrentModule(mod)}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {currentModule === 'businesses' && (
            <BusinessesView state={dbState} />
          )}

          {currentModule === 'people' && (
            <PeopleView state={dbState} />
          )}

          {currentModule === 'directory' && (
            <DirectoryView state={dbState} />
          )}

          {currentModule === 'tasks' && (
            <TasksView state={dbState} />
          )}

          {currentModule === 'timetable' && (
            <TimetableView state={dbState} />
          )}

          {currentModule === 'calls' && (
            <CallsView state={dbState} />
          )}

          {currentModule === 'meetings' && (
            <MeetingsView state={dbState} />
          )}

          {currentModule === 'followups' && (
            <FollowUpsView state={dbState} />
          )}

          {currentModule === 'messages' && (
            <MessagesView state={dbState} />
          )}

          {currentModule === 'credentials' && (
            <CredentialsView state={dbState} />
          )}

          {currentModule === 'notes' && (
            <NotesView state={dbState} />
          )}

          {currentModule === 'documents' && (
            <DocumentsView state={dbState} />
          )}

          {currentModule === 'orders' && (
            <OrdersView state={dbState} />
          )}

          {currentModule === 'templates' && (
            <TemplatesView state={dbState} />
          )}

          {currentModule === 'settings' && (
            <SettingsView
              state={dbState}
              onToggleViewMode={handleToggleViewMode}
            />
          )}
        </main>

        {/* Global Floating Action Button with Speed Dial */}
        <SpeedDialFAB
          onAddBusiness={() => handleQuickAdd('business')}
          onAddPerson={() => handleQuickAdd('person')}
          onAddTask={() => handleQuickAdd('task')}
          onAddMeeting={() => handleQuickAdd('meeting')}
          onAddContact={() => handleQuickAdd('contact')}
          onAddCall={() => handleQuickAdd('call')}
        />

        {/* Global Fast Search Modal */}
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          state={dbState}
          onNavigate={(mod) => setCurrentModule(mod)}
        />
      </div>
    </AndroidFrame>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
