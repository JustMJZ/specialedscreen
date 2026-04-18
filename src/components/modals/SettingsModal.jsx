import React, { useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { STORAGE_KEY } from '../../hooks/usePersistedState';
import { exportBackup, importBackup } from '../../utils/backupUtils';

const C = {
  coral:     '#FB7F6E',
  coralLight:'#FFF1EF',
  teal:      '#14B8A6',
  cream:     '#FFFBF7',
  border:    '#FDE8E4',
  text:      '#334155',
  muted:     '#94a3b8',
};

function Toggle({ on }) {
  return (
    <div style={{
      width: 36, height: 20, borderRadius: 10, flexShrink: 0,
      background: on ? C.teal : '#E2E8F0',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 19 : 3,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function Section({ label }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, color: C.muted,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '14px 4px 6px',
    }}>{label}</div>
  );
}

function Row({ icon, label, right, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '10px 12px', borderRadius: 10,
      background: 'transparent', border: 'none', cursor: 'pointer',
      textAlign: 'left', marginBottom: 2, transition: 'background 0.12s',
      color: danger ? '#DC2626' : C.text,
    }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#FEF2F2' : C.coralLight}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: 17, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</span>
      {right}
    </button>
  );
}

export default function SettingsModal({ onClose }) {
  const {
    isDarkMode, setIsDarkMode,
    isWidgetLocked, setIsWidgetLocked,
    performanceMode, setPerformanceMode,
    saveCurrentLayoutAsTemplate,
  } = useAppState();

  const fileInputRef = useRef(null);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(51,65,85,0.4)', backdropFilter: 'blur(4px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: 380, maxWidth: '95vw', maxHeight: '90vh',
          background: C.cream, borderRadius: 20,
          boxShadow: '0 20px 60px rgba(251,127,110,0.15), 0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${C.border}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.coral}, #f97316)`,
          padding: '18px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Settings</div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 20px' }}>

          <Section label="Display" />
          <Row icon="🌙" label="Dark Mode"       right={<Toggle on={isDarkMode} />}     onClick={() => setIsDarkMode(!isDarkMode)} />
          <Row icon="🔒" label="Widget Lock"     right={<Toggle on={isWidgetLocked} />} onClick={() => setIsWidgetLocked(!isWidgetLocked)} />
          <Row icon="⚡" label="Performance Mode" right={<Toggle on={performanceMode} />} onClick={() => setPerformanceMode(!performanceMode)} />

          <Section label="Templates" />
          <Row icon="💾" label="Save Current Layout as Template" onClick={() => {
            const name = prompt('Template name:');
            if (!name?.trim()) return;
            const description = prompt('Description (optional):') || '';
            const result = saveCurrentLayoutAsTemplate(name.trim(), description.trim());
            alert(result ? `Template "${name.trim()}" saved!` : 'Failed to save template.');
          }} />

          <Section label="Data" />
          <Row icon="⬇" label="Export Backup" onClick={() => exportBackup()} />
          <Row icon="⬆" label="Import Backup" onClick={() => fileInputRef.current?.click()} />
          <input ref={fileInputRef} type="file" accept=".json" onChange={importBackup} style={{ display: 'none' }} />
          <Row icon="↺" label="Reset to Defaults" danger onClick={() => {
            if (!window.confirm('This will erase all your data and reset everything to defaults. Are you sure?')) return;
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
          }} />

        </div>
      </div>
    </div>
  );
}
