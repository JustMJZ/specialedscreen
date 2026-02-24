import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const KEYFRAMES = `
  @keyframes ra-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ra-fadeout {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes ra-in {
    0%   { transform: scale(0.2) rotate(-12deg); opacity: 0; filter: blur(24px); }
    55%  { transform: scale(1.08) rotate(1.5deg); opacity: 1; filter: blur(0); }
    75%  { transform: scale(0.97) rotate(-0.5deg); }
    100% { transform: scale(1) rotate(0deg); }
  }
`;

const FADE_OUT_MS = 600;

const RotationAnnouncement = ({ show, phase }) => {
  const [visible, setVisible] = useState(show);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setFadingOut(false);
    } else if (visible) {
      setFadingOut(true);
      const t = setTimeout(() => {
        setVisible(false);
        setFadingOut(false);
      }, FADE_OUT_MS);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!visible) return null;

  const fadeAnim = fadingOut
    ? `ra-fadeout ${FADE_OUT_MS}ms ease forwards`
    : 'ra-fadein 0.4s ease forwards';

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9980] pointer-events-none flex items-center justify-center"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      style={{ animation: fadeAnim }}
    >
      <style>{KEYFRAMES}</style>
      <div
        aria-hidden="true"
        style={{
          background: 'rgba(0,0,0,0.82)',
          borderRadius: 20,
          padding: '28px 56px',
          textAlign: 'center',
          animation: 'ra-in 0.72s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        <div style={{
          fontSize: 'clamp(40px, 10vw, 96px)',
          fontWeight: 900,
          fontFamily: "'Baloo 2', cursive",
          color: phase === 'moving' ? '#10b981' : '#a78bfa',
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}>
          {phase === 'moving' ? "LET'S MOVE!" : 'ROTATION TIME!'}
        </div>
        <div style={{
          fontSize: 'clamp(13px, 1.8vw, 20px)',
          color: 'rgba(255,255,255,0.65)',
          marginTop: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          {phase === 'moving' ? 'Walk calmly to your next group' : 'Switch to your next station'}
        </div>
      </div>
      <div className="sr-only">
        {phase === 'moving' ? 'Moving to next station. Walk calmly to your next group.' : 'Rotation time. Time to switch stations.'}
      </div>
    </div>,
    document.body
  );
};

export default React.memo(RotationAnnouncement);
