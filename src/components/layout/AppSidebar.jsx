import React, { useEffect, useState } from 'react';

const SIDEBAR_ITEMS = [
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
];

export default function AppSidebar({ isOpen, onClose }) {
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
          background: 'rgba(0,0,0,0.55)',
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
          background: 'rgba(15,23,42,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '6px 0 40px rgba(0,0,0,0.6)',
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
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(148,163,184,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Features
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(148,163,184,0.5)',
              fontSize: 16,
              lineHeight: 1,
              padding: '4px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px' }}>
          {SIDEBAR_ITEMS.map((item) => (
            <SidebarItem key={item.id} item={item} onClose={onClose} />
          ))}
        </nav>
      </div>
    </>
  );
}

function SidebarItem({ item, onClose }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={item.href()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 0.12s',
        marginBottom: 4,
        color: '#e2e8f0',
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 9,
        background: 'rgba(255,255,255,0.08)',
        flexShrink: 0,
        color: '#94a3b8',
      }}>
        {item.icon}
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>
        {item.label}
      </span>
      {item.badge && (
        <span style={{
          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
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
