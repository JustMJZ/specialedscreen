import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { COLORS } from './constants';
import FloatingControls from './components/layout/FloatingControls';
import WidgetGrid from './components/layout/WidgetGrid';
import Modals from './components/modals';
import RotationAnnouncement from './components/shared/RotationAnnouncement';
import KeyboardShortcuts from './components/shared/KeyboardShortcuts';
import WelcomeModal from './components/modals/WelcomeModal';

function ScreenLayout({ isKioskMode }) {
  const { showAnnouncement, announcementPhase, performanceMode, showWelcomeModal, loadTemplate, skipWelcome } = useAppState();

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ backgroundColor: COLORS.background }}
    >
      {!isKioskMode && showWelcomeModal && (
        <WelcomeModal onSelectTemplate={loadTemplate} onSkip={skipWelcome} />
      )}
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} performanceMode={performanceMode} />
      {!isKioskMode && <Modals />}
      {!isKioskMode && <FloatingControls />}
      {!isKioskMode && <KeyboardShortcuts />}

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
