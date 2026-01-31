import React from 'react';

const VoiceLevel = ({ level, onChange }) => {
  const levels = [
    { id: 0, label: 'Silent', icon: '🤫', color: '#EF4444' },
    { id: 1, label: 'Whisper', icon: '🤭', color: '#F59E0B' },
    { id: 2, label: 'Talk', icon: '💬', color: '#10B981' },
    { id: 3, label: 'Loud', icon: '📢', color: '#3B82F6' },
  ];

  return (
    <div className="bg-white rounded-lg p-2 shadow-md">
      <div className="text-xs font-bold text-gray-500 mb-1">🔈 VOICE LEVEL</div>
      <div className="flex gap-1">
        {levels.map(l => (
          <button key={l.id} onClick={() => onChange(l.id)}
            className={`flex-1 py-1 rounded text-center transition-all ${level === l.id ? 'ring-2 ring-offset-1' : 'opacity-40'}`}
            style={{ backgroundColor: l.color + '20', ringColor: l.color }}>
            <div className="text-base">{l.icon}</div>
            <div className="text-xs font-medium" style={{ color: l.color }}>{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceLevel;
