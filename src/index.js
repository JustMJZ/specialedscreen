import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import AuthGate from './components/auth/AuthGate';
import SpecialEdScreen from './SpecialEdScreen';

const WhiteboardPage = lazy(() => import('./components/whiteboard/WhiteboardPage'));
const NotesPage = lazy(() => import('./components/notes/NotesPage'));

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
        <AuthGate>
        <Routes>
          <Route path="/" element={<SpecialEdScreen />} />
          <Route
            path="/whiteboard"
            element={
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1e1e2e', color: '#e2e8f0', fontSize: 14 }}>
                  Loading whiteboard…
                </div>
              }>
                <WhiteboardPage />
              </Suspense>
            }
          />
          <Route
            path="/notes"
            element={
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#e2e8f0', fontSize: 14 }}>
                  Loading notes…
                </div>
              }>
                <NotesPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthGate>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
