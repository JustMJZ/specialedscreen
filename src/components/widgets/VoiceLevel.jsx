import React, { useState, useEffect } from 'react';

const levels = [
  { id: 0, label: 'Silent', icon: '🤫', color: '#EF4444', bg: '#FEE2E2', bars: 0, desc: 'No talking' },
  { id: 1, label: 'Whisper', icon: '🤭', color: '#F59E0B', bg: '#FEF3C7', bars: 1, desc: 'Tiny voice' },
  { id: 2, label: 'Talk', icon: '🗣️', color: '#10B981', bg: '#D1FAE5', bars: 2, desc: 'Normal voice' },
  { id: 3, label: 'Loud', icon: '📢', color: '#3B82F6', bg: '#DBEAFE', bars: 3, desc: 'Big voice OK' },
];

const VoiceLevel = ({ level, onChange }) => {
  const [bounce, setBounce] = useState(false);
  const current = levels[level] || levels[0];

  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
  }, [level]);

  return (
    <div className="rounded-lg p-2 shadow-md h-full flex flex-col overflow-hidden bg-transparent">
      <style>{`
        @keyframes voice-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes bar-pulse {
          0%, 100% { transform: scaleY(0.7); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* Active level display */}
      <div className="flex-1 flex flex-col items-center justify-center rounded-xl mb-1.5 p-1"
        style={{ backgroundColor: current.bg, border: `3px solid ${current.color}` }}>
        <div style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          lineHeight: 1,
          animation: bounce ? 'voice-bounce 0.4s ease-out' : 'none',
        }}>
          {current.icon}
        </div>
        <div className="font-black uppercase tracking-wider mt-0.5" style={{
          fontSize: 'clamp(14px, 2vw, 22px)',
          color: current.color,
        }}>
          {current.label}
        </div>
        {/* Sound bars */}
        <div className="flex items-end gap-1 mt-1" style={{ height: 18 }}>
          {[1, 2, 3].map(bar => (
            <div key={bar} style={{
              width: 'clamp(6px, 1vw, 10px)',
              height: bar <= current.bars ? `${6 + bar * 4}px` : '4px',
              backgroundColor: bar <= current.bars ? current.color : '#D1D5DB',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              animation: bar <= current.bars ? `bar-pulse ${0.4 + bar * 0.15}s ease-in-out infinite` : 'none',
            }} />
          ))}
        </div>
        <div className="text-xs mt-0.5" style={{ color: current.color, opacity: 0.7 }}>{current.desc}</div>
      </div>

      {/* Level selector buttons */}
      <div className="flex gap-1">
        {levels.map(l => (
          <button key={l.id} onClick={() => onChange(l.id)}
            className="flex-1 py-0.5 rounded-lg text-center transition-all"
            style={{
              backgroundColor: level === l.id ? l.color : 'rgba(0,0,0,0.05)',
              boxShadow: level === l.id ? `0 2px 8px ${l.color}60` : '0 1px 2px rgba(0,0,0,0.1)',
              transform: level === l.id ? 'scale(1.05)' : 'scale(1)',
            }}>
            <div style={{ fontSize: 'clamp(14px, 2vw, 20px)', lineHeight: 1.2 }}>{l.icon}</div>
            <div className="font-bold" style={{
              fontSize: 'clamp(7px, 0.9vw, 10px)',
              color: level === l.id ? '#ffffff' : l.color,
            }}>{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceLevel;
