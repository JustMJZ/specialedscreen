import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';

// Converts #rrggbb to rgba(r,g,b,a) for glow derivation
const hexToRgba = (hex, alpha) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const LEVELS = [
  { id: 0, label: 'SILENT',  icon: '🤫', color: '#ef4444', glow: 'rgba(239,68,68,0.55)',  dim: 'rgba(239,68,68,0.12)',  desc: 'No sound',     segments: 0 },
  { id: 1, label: 'WHISPER', icon: '🤭', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', dim: 'rgba(245,158,11,0.12)', desc: 'Tiny voice',   segments: 3 },
  { id: 2, label: 'TALK',    icon: '🗣️', color: '#22c55e', glow: 'rgba(34,197,94,0.55)',  dim: 'rgba(34,197,94,0.12)',  desc: 'Normal voice', segments: 6 },
  { id: 3, label: 'LOUD',    icon: '📢', color: '#3b82f6', glow: 'rgba(59,130,246,0.55)', dim: 'rgba(59,130,246,0.12)', desc: 'Big voice OK', segments: 9 },
];

const TOTAL_SEGMENTS = 9;

const VoiceLevel = ({ level, onChange }) => {
  const [surge, setSurge] = useState(false);
  const { widgetColors } = useAppState();
  const current = LEVELS[level] || LEVELS[0];

  // If the teacher has set a "Text" color via the widget color picker, use it
  // as the accent for the main display. Selector buttons stay per-level colored.
  const accentHex = widgetColors?.['voiceLevel']?.text || null;
  const fillHex   = widgetColors?.['voiceLevel']?.bg   || null;
  const displayColor = accentHex || current.color;
  const displayGlow  = accentHex ? hexToRgba(accentHex, 0.55) : current.glow;
  const displayDim   = accentHex ? hexToRgba(accentHex, 0.12) : current.dim;

  useEffect(() => {
    setSurge(true);
    const t = setTimeout(() => setSurge(false), 600);
    return () => clearTimeout(t);
  }, [level]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(160deg, #060610 0%, #0d1117 60%, #060610 100%)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes vl-surge {
          0%   { transform: scale(0.78); opacity: 0; filter: blur(8px); }
          50%  { transform: scale(1.12); opacity: 1; filter: blur(0); }
          100% { transform: scale(1);   opacity: 1; filter: blur(0); }
        }
        @keyframes vl-breathe {
          0%, 100% { opacity: 0.8; }
          50%       { opacity: 1;   }
        }
        @keyframes vl-ring {
          0%   { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
        }
        @keyframes vl-scan {
          from { background-position: 0 0; }
          to   { background-position: 0 40px; }
        }
      `}</style>

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 4px)',
        animation: 'vl-scan 3s linear infinite',
      }} />

      {/* Fill color wash — tints dark background without destroying the aesthetic */}
      {fillHex && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: hexToRgba(fillHex, 0.18),
          borderRadius: 'inherit',
        }} />
      )}

      {/* Ambient radial glow */}
      <div style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: '70%', height: '50%',
        background: `radial-gradient(ellipse, ${displayGlow} 0%, transparent 72%)`,
        transition: 'background 0.5s ease',
        pointerEvents: 'none', zIndex: 0,
        animation: 'vl-breathe 2.2s ease-in-out infinite',
      }} />

      {/* ── MAIN DISPLAY ── */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
        padding: '6px 8px 2px',
        gap: 0,
      }}>

        {/* Icon + pulse rings */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          {[0, 0.5].map((delay, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 'clamp(44px, 7vw, 66px)',
              height: 'clamp(44px, 7vw, 66px)',
              borderRadius: '50%',
              border: `1.5px solid ${displayColor}`,
              animation: `vl-ring 2s ${delay}s ease-out infinite`,
              pointerEvents: 'none',
            }} />
          ))}
          <div style={{
            fontSize: 'clamp(36px, 6.5vw, 60px)',
            lineHeight: 1,
            filter: `drop-shadow(0 0 10px ${displayColor})`,
            animation: surge ? 'vl-surge 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
          }}>
            {current.icon}
          </div>
        </div>

        {/* Level name */}
        <div style={{
          fontFamily: "'Fredoka One', 'Baloo 2', cursive",
          fontSize: 'clamp(20px, 4vw, 42px)',
          fontWeight: 900,
          letterSpacing: '0.14em',
          color: displayColor,
          textShadow: `0 0 10px ${displayColor}, 0 0 22px ${displayGlow}`,
          lineHeight: 1,
          animation: 'vl-breathe 2.2s ease-in-out infinite',
          transition: 'color 0.4s ease, text-shadow 0.4s ease',
        }}>
          {current.label}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 'clamp(8px, 1.1vw, 12px)',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: 3,
        }}>
          {current.desc}
        </div>

        {/* Power meter */}
        <div style={{ width: '82%', marginTop: 10 }}>
          <div style={{
            fontSize: 8,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 5,
            fontWeight: 700,
          }}>
            POWER LEVEL
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 18 }}>
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
              const lit = i < current.segments;
              const heightPct = 40 + i * 7;   // 40% → 96% — grows like an EQ
              return (
                <div key={i} style={{
                  flex: 1,
                  height: `${heightPct}%`,
                  borderRadius: 2,
                  background: lit ? displayColor : 'rgba(255,255,255,0.07)',
                  boxShadow: lit ? `0 0 5px ${displayColor}` : 'none',
                  transition: `background 0.25s ${i * 0.025}s ease, box-shadow 0.25s ${i * 0.025}s ease`,
                }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── LEVEL SELECTOR TILES ── */}
      <div style={{
        display: 'flex', gap: 4, padding: '0 6px 6px',
        position: 'relative', zIndex: 1,
      }}>
        {LEVELS.map((l) => {
          const active = level === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onChange(l.id)}
              style={{
                flex: 1,
                padding: '5px 2px 4px',
                borderRadius: 9,
                border: `1.5px solid ${active ? l.color : 'rgba(255,255,255,0.09)'}`,
                background: active
                  ? `linear-gradient(160deg, ${l.dim} 0%, rgba(0,0,0,0.55) 100%)`
                  : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                boxShadow: active ? `0 0 14px ${l.glow}, inset 0 0 10px ${l.dim}` : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <span style={{ fontSize: 'clamp(13px, 2vw, 19px)', lineHeight: 1 }}>{l.icon}</span>
              <span style={{
                fontSize: 'clamp(6px, 0.8vw, 9px)',
                fontWeight: 800,
                letterSpacing: '0.07em',
                color: active ? l.color : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                transition: 'color 0.25s ease',
              }}>
                {l.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VoiceLevel;
