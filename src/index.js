import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import SpecialEdScreen from './SpecialEdScreen';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SpecialEdScreen />
    </ErrorBoundary>
  </React.StrictMode>
);
