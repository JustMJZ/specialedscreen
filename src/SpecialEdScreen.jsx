import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { COLORS } from './constants';
import Header from './components/layout/Header';
import WidgetGrid from './components/layout/WidgetGrid';
import Modals from './components/modals';
import RotationAnnouncement from './components/shared/RotationAnnouncement';

function ScreenLayout() {
  const { showAnnouncement, announcementPhase } = useAppState();

  return (
    <div className="h-screen overflow-hidden p-2 flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} />
      <Modals />
      <Header />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <WidgetGrid />
      </div>
    </div>
  );
}

export default function SpecialEdScreen() {
  return (
    <AppStateProvider>
      <ScreenLayout />
    </AppStateProvider>
  );
}
