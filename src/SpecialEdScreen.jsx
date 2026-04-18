import React, { useEffect, useState } from 'react';
import { useAppState } from './context/AppStateContext';
import FloatingControls from './components/layout/FloatingControls';
import AppSidebar from './components/layout/AppSidebar';
import StudentsPanel from './components/students/StudentsPanel';
import WidgetGrid from './components/layout/WidgetGrid';
import Modals from './components/modals';
import RotationAnnouncement from './components/shared/RotationAnnouncement';
import KeyboardShortcuts from './components/shared/KeyboardShortcuts';
import BackupReminder from './components/shared/BackupReminder';
import WelcomeModal from './components/modals/WelcomeModal';
import TemplatesModal from './components/modals/TemplatesModal';
import SettingsModal from './components/modals/SettingsModal';

function ScreenLayout() {
  const { showAnnouncement, announcementPhase, showWelcomeModal, loadTemplate, skipWelcome, isDarkMode } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentsPanelOpen, setStudentsPanelOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      {showWelcomeModal && (
        <WelcomeModal onSelectTemplate={loadTemplate} onSkip={skipWelcome} />
      )}
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} />
      <Modals />
      {templatesOpen && (
        <TemplatesModal
          onSelectTemplate={(id) => { loadTemplate(id); setTemplatesOpen(false); }}
          onClose={() => setTemplatesOpen(false)}
        />
      )}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenStudents={() => { setSidebarOpen(false); setStudentsPanelOpen(true); }}
        onOpenTemplates={() => { setSidebarOpen(false); setTemplatesOpen(true); }}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <StudentsPanel isOpen={studentsPanelOpen} onClose={() => setStudentsPanelOpen(false)} />
      <FloatingControls onOpenSidebar={() => setSidebarOpen(true)} />
      <KeyboardShortcuts />
      <BackupReminder />

      <div className="flex-1 min-h-0 overflow-hidden">
        <WidgetGrid />
      </div>
    </div>
  );
}

export default function SpecialEdScreen() {
  return <ScreenLayout />;
}
