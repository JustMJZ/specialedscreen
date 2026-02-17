import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import SpecialEdScreen from './SpecialEdScreen';
import KioskView from './components/KioskView';

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/performanceMonitor').then(({ perfMonitor }) => {
    console.log(
      '📊 Performance monitoring enabled. Use window.__perfMonitor.logSummary() to view metrics.'
    );
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/specialedscreen">
        <Routes>
          <Route path="/" element={<SpecialEdScreen />} />
          <Route path="/kiosk" element={<KioskView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
