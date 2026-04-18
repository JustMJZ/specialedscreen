import React, { useEffect, useState } from 'react';

const C = {
  coral:     '#FB7F6E',
  coralLight:'#FFF1EF',
  teal:      '#14B8A6',
  cream:     '#FFFBF7',
  border:    '#FDE8E4',
  text:      '#334155',
  muted:     '#94a3b8',
};

const SIDEBAR_ITEMS = [
  {
    id: 'students',
    label: 'Students',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    action: true,
  },
  {
    id: 'whiteboard',
    label: 'Whiteboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    href: () => window.location.origin + '/specialedscreen/#/whiteboard',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    href: () => window.location.origin + '/specialedscreen/#/notes',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    href: () => window.location.origin + '/specialedscreen/#/schedule',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    action: true,
  },
];

export default function AppSidebar({ isOpen, onClose, onOpenStudents, onOpenTemplates, onOpenSettings }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(51,65,85,0.45)',
          zIndex: 200,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Features menu"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 252,
          zIndex: 201,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.24s cubic-bezier(0.4,0,0.2,1)',
          background: C.cream,
          borderRight: `1px solid ${C.border}`,
          boxShadow: '6px 0 40px rgba(51,65,85,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 16px 14px',
          background: `linear-gradient(135deg, ${C.coral} 0%, #f97316 100%)`,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
          }}>
            Features
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 14,
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', background: C.cream }}>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              onClose={onClose}
              onAction={
                item.id === 'students' ? onOpenStudents :
                item.id === 'templates' ? onOpenTemplates :
                undefined
              }
            />
          ))}
        </nav>

        {/* Bottom — Settings */}
        <div style={{ padding: '10px', borderTop: `1px solid ${C.border}`, background: C.cream, flexShrink: 0 }}>
          <SettingsButton onClick={() => { onClose(); onOpenSettings(); }} />
        </div>
      </div>
    </>
  );
}

function SettingsButton({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '9px 12px', borderRadius: 10,
        background: hovered ? C.coralLight : 'transparent',
        border: `1px solid ${hovered ? C.border : 'transparent'}`,
        cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s',
        color: C.text, textAlign: 'left', boxSizing: 'border-box',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 34, height: 34, borderRadius: 9,
        background: hovered ? C.coral : C.coralLight,
        color: hovered ? '#fff' : C.coral,
        transition: 'background 0.12s, color 0.12s', flexShrink: 0,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Settings</span>
    </button>
  );
}

function SidebarItem({ item, onClose, onAction }) {
  const [hovered, setHovered] = useState(false);

  const iconBox = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: 9,
    background: hovered ? C.coral : C.coralLight,
    flexShrink: 0,
    color: hovered ? '#fff' : C.coral,
    transition: 'background 0.12s, color 0.12s',
  };

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '9px 12px', borderRadius: 10, width: '100%',
    background: hovered ? C.coralLight : 'transparent',
    border: `1px solid ${hovered ? C.border : 'transparent'}`,
    cursor: 'pointer',
    transition: 'background 0.12s, border-color 0.12s',
    marginBottom: 4,
    color: C.text, textAlign: 'left',
    textDecoration: 'none',
    boxSizing: 'border-box',
  };

  if (item.action) {
    return (
      <button
        onClick={() => onAction?.()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...rowStyle, border: `1px solid ${hovered ? C.border : 'transparent'}` }}
      >
        <span style={iconBox}>{item.icon}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.label}</span>
      </button>
    );
  }

  return (
    <a
      href={item.href()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={rowStyle}
    >
      <span style={iconBox}>{item.icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
        {item.label}
      </span>
      {item.badge && (
        <span style={{
          background: `linear-gradient(135deg, ${C.coral}, #f97316)`,
          color: '#fff',
          fontSize: 8,
          fontWeight: 800,
          padding: '2px 5px',
          borderRadius: 4,
          lineHeight: 1.4,
          flexShrink: 0,
        }}>
          {item.badge}
        </span>
      )}
    </a>
  );
}
