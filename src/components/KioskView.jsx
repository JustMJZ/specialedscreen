import React from 'react';
import { AppStateProvider } from '../context/AppStateContext';
import SpecialEdScreen from '../SpecialEdScreen';

// Kiosk mode is just the regular app with isKioskMode prop
// This hides all controls while keeping the exact same layout
const KioskView = () => {
  return (
    <AppStateProvider>
      <SpecialEdScreen isKioskMode={true} />
    </AppStateProvider>
  );
};

export default KioskView;
