import React, { useEffect } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { COLORS } from './constants';
import FloatingControls from './components/layout/FloatingControls';
import WidgetGrid from './components/layout/WidgetGrid';
import Modals from './components/modals';
import RotationAnnouncement from './components/shared/RotationAnnouncement';
import KeyboardShortcuts from './components/shared/KeyboardShortcuts';
import BackupReminder from './components/shared/BackupReminder';
import WelcomeModal from './components/modals/WelcomeModal';

function ScreenLayout({ isKioskMode }) {
  const { showAnnouncement, announcementPhase, showWelcomeModal, loadTemplate, skipWelcome, isDarkMode } = useAppState();

  // Apply dark class to <html> so Tailwind dark: works everywhere,
  // including portal elements rendered to document.body.
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
      {!isKioskMode && showWelcomeModal && (
        <WelcomeModal onSelectTemplate={loadTemplate} onSkip={skipWelcome} />
      )}
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} />
      {!isKioskMode && <Modals />}
      {!isKioskMode && <FloatingControls />}
      {!isKioskMode && <KeyboardShortcuts />}
      {!isKioskMode && <BackupReminder />}

      <div className="flex-1 min-h-0 overflow-hidden">
        <WidgetGrid isKioskMode={isKioskMode} />
      </div>
    </div>
  );
}

export default function SpecialEdScreen({ isKioskMode = false }) {
  return (
    <AppStateProvider>
      <ScreenLayout isKioskMode={isKioskMode} />
    </AppStateProvider>
  );
}
