import React from 'react';
import { STORAGE_KEY } from '../hooks/usePersistedState';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: 12, padding: 32,
            maxWidth: 480, width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>Something went wrong</div>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              The app ran into an unexpected error. You can try reloading, or reset
              all data to defaults if the problem persists.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
                  backgroundColor: 'white', cursor: 'pointer', fontSize: 14,
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontSize: 14,
                }}
              >
                Reset to Defaults
              </button>
            </div>
            <details style={{ marginTop: 24, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}>
                Error details
              </summary>
              <pre style={{
                marginTop: 8, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8,
                fontSize: 11, overflow: 'auto', maxHeight: 120, whiteSpace: 'pre-wrap',
              }}>
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
