import React from 'react';

const VoiceLevel = ({ level, onChange }) => {
  const levels = [
    { id: 0, label: 'Silent', icon: '🤫', color: '#EF4444', bg: '#FEE2E2' },
    { id: 1, label: 'Whisper', icon: '🤭', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 2, label: 'Talk', icon: '💬', color: '#10B981', bg: '#D1FAE5' },
    { id: 3, label: 'Loud', icon: '📢', color: '#3B82F6', bg: '#DBEAFE' },
  ];

  return (
    <div className="rounded-lg p-2 shadow-md h-full">
      <div className="text-xs font-bold text-gray-500 mb-1">🔈 VOICE LEVEL</div>
      <div className="flex gap-1">
        {levels.map(l => (
          <button key={l.id} onClick={() => onChange(l.id)}
            className={`flex-1 py-1 rounded text-center transition-all ${level === l.id ? 'ring-2 ring-offset-1 scale-105' : 'opacity-60'}`}
            style={{ backgroundColor: level === l.id ? l.bg : '#ffffff', ringColor: l.color, boxShadow: level === l.id ? `0 2px 8px ${l.color}40` : '0 1px 2px rgba(0,0,0,0.1)' }}>
            <div className="text-base">{l.icon}</div>
            <div className="text-xs font-bold" style={{ color: l.color }}>{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceLevel;
