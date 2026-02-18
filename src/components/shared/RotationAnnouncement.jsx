import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Pre-computed sparks — deterministic so no Math.random() in render
const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  angle: i * (360 / 22),
  color: ['#f59e0b', '#ec4899', '#8b5cf6', '#38bdf8', '#10b981', '#f97316'][i % 6],
  delay: (i * 0.04).toFixed(2),
  dist: 140 + (i * 13) % 130,
}));

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
  @keyframes ra-ring {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(7); opacity: 0; }
  }
  @keyframes ra-spark {
    0%   { transform: rotate(var(--a)) translateX(0);            opacity: 1; }
    100% { transform: rotate(var(--a)) translateX(var(--d));     opacity: 0; }
  }
  @keyframes ra-grad {
    0%,100% { background-position: 0% 50%; }
    50%     { background-position: 100% 50%; }
  }
  @keyframes ra-pulse {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.04); }
  }
  @keyframes ra-arrow {
    0%   { opacity: 0; transform: translateX(-28px); }
    35%  { opacity: 1; }
    65%  { opacity: 1; }
    100% { opacity: 0; transform: translateX(48px); }
  }
`;

const FADE_OUT_MS = 600;

const RotationAnnouncement = ({ show, phase, performanceMode = false }) => {
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

  // Performance mode: minimal overlay, no effects
  if (performanceMode) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[9980] pointer-events-none flex items-center justify-center"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        style={{ animation: fadeAnim }}
      >
        <style>{KEYFRAMES}</style>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          borderRadius: 20,
          padding: '24px 48px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 900,
            fontFamily: "'Baloo 2',cursive",
            color: phase === 'moving' ? '#10b981' : '#a78bfa',
          }}>
            {phase === 'moving' ? "LET'S MOVE!" : 'ROTATION TIME!'}
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {phase === 'moving' ? 'Walk calmly to your next group' : 'Switch to your next station'}
          </div>
        </div>
        <div className="sr-only">
          {phase === 'moving' ? 'Moving to next station. Walk calmly to your next group.' : 'Rotation time. Time to switch stations.'}
        </div>
      </div>,
      document.body
    );
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9980] pointer-events-none"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      style={{ animation: fadeAnim }}
    >
      <style>{KEYFRAMES}</style>

      {/* Dark radial backdrop */}
      <div style={{
        position: 'fixed', inset: 0,
        background: phase === 'moving'
          ? 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.28) 0%, rgba(6,182,212,0.14) 45%, rgba(0,0,0,0.88) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.32) 0%, rgba(236,72,153,0.16) 45%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* Shockwave rings */}
      {[0, 0.24, 0.48].map((delay, i) => (
        <div key={i} style={{
          position: 'fixed', left: '50%', top: '50%',
          width: 56, height: 56, marginLeft: -28, marginTop: -28,
          border: `${3.5 - i * 0.8}px solid ${phase === 'moving' ? 'rgba(16,185,129,0.95)' : 'rgba(167,139,250,0.95)'}`,
          borderRadius: '50%',
          animation: `ra-ring 1.6s ${delay}s ease-out forwards`,
        }} />
      ))}

      {/* Spark burst — announce phase only */}
      {phase !== 'moving' && SPARKS.map((s) => (
        <div key={s.id} style={{
          position: 'fixed', left: '50%', top: '50%',
          width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5,
          borderRadius: '50%',
          background: s.color,
          boxShadow: `0 0 10px 4px ${s.color}`,
          opacity: 0,
          animation: `ra-spark 1.1s ${s.delay}s cubic-bezier(0.1,0.6,0.3,1) forwards`,
          '--a': `${s.angle}deg`,
          '--d': `${s.dist}px`,
        }} />
      ))}

      {/* Main text — scales in with spring */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ animation: 'ra-in 0.72s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        aria-hidden="true"
      >
        {phase !== 'moving' ? (
          // ── ANNOUNCE PHASE ───────────────────────────────────────────────
          <>
            <div style={{
              fontSize: 'clamp(58px, 14vw, 152px)',
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              lineHeight: 0.82,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 28%, #8b5cf6 62%, #38bdf8 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'ra-grad 2.8s linear infinite, ra-pulse 0.95s ease-in-out infinite',
              filter: 'drop-shadow(0 0 32px rgba(139,92,246,0.75))',
              letterSpacing: '-0.02em',
            }}>
              ROTATION
            </div>
            <div style={{
              fontSize: 'clamp(50px, 12vw, 128px)',
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              lineHeight: 0.82,
              color: '#ffffff',
              letterSpacing: '0.12em',
              textShadow: '0 0 52px rgba(255,255,255,0.55), 0 6px 30px rgba(0,0,0,0.65)',
              animation: 'ra-pulse 0.95s 0.18s ease-in-out infinite',
            }}>
              TIME!
            </div>
            <div style={{
              marginTop: 26,
              fontSize: 'clamp(16px, 2.4vw, 28px)',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}>
              Switch to your next station
            </div>
          </>
        ) : (
          // ── MOVING PHASE ─────────────────────────────────────────────────
          <>
            {/* Cascading arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
              {[0, 0.14, 0.28, 0.14, 0].map((d, i) => (
                <div key={i} style={{
                  fontSize: 'clamp(22px, 4vw, 44px)',
                  color: i === 2 ? '#38bdf8' : '#10b981',
                  filter: `drop-shadow(0 0 10px ${i === 2 ? '#38bdf8' : '#10b981'})`,
                  opacity: 0,
                  animation: `ra-arrow 1.2s ${d}s ease-in-out infinite`,
                }}>›</div>
              ))}
            </div>

            <div style={{
              fontSize: 'clamp(58px, 14vw, 152px)',
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              lineHeight: 0.82,
              color: '#10b981',
              textShadow: '0 0 52px rgba(16,185,129,1), 0 0 100px rgba(16,185,129,0.5), 0 6px 28px rgba(0,0,0,0.55)',
              letterSpacing: '-0.02em',
              animation: 'ra-pulse 0.72s ease-in-out infinite',
            }}>
              LET'S
            </div>
            <div style={{
              fontSize: 'clamp(58px, 14vw, 152px)',
              fontWeight: 900,
              fontFamily: "'Baloo 2', cursive",
              lineHeight: 0.82,
              color: '#38bdf8',
              textShadow: '0 0 52px rgba(56,189,248,1), 0 0 100px rgba(56,189,248,0.5), 0 6px 28px rgba(0,0,0,0.55)',
              letterSpacing: '-0.02em',
              animation: 'ra-pulse 0.72s 0.14s ease-in-out infinite',
            }}>
              MOVE!
            </div>

            <div style={{
              marginTop: 26,
              fontSize: 'clamp(16px, 2.4vw, 28px)',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontWeight: 700,
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}>
              Walk calmly to your next group
            </div>
          </>
        )}
      </div>

      {/* Screen reader text */}
      <div className="sr-only">
        {phase === 'moving'
          ? 'Moving to next station. Walk calmly to your next group.'
          : 'Rotation time. Time to switch stations.'}
      </div>
    </div>,
    document.body
  );
};

export default React.memo(RotationAnnouncement);
