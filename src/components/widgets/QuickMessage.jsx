import React, { useState } from 'react';
import { BANNER_COLORS } from '../../constants';

const QuickMessage = ({ message, onEdit, fontSize = 16, onFontSizeChange, color = '#F59E0B', onColorChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(message);

  const presets = [
    'Great job! ⭐', 'Remember: Quiet voices 🤫', 'Clean up time! 🧹', 'Line up! 🚶', 'Eyes on teacher 👀',
    'Hands to yourself ✋', 'Walking feet please 🦶', 'You can do it! 💪', 'Almost done! 🏁', 'Take a deep breath 🧘',
    'Be kind to each other 💛', 'Time to focus 🎯', 'Great listening! 👂', 'Show me ready! ✅', 'Brain break! 🧠'
  ];

  if (editing) {
    return (
      <div className="rounded-lg p-2 shadow-md h-full text-white" style={{ backgroundColor: color }}>
        <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-2 py-1 rounded text-sm border text-gray-800 mb-1" autoFocus />
        <div className="flex flex-wrap gap-1 mb-1">
          {presets.map(p => (
            <button key={p} onClick={() => setVal(p)} className="px-1.5 py-0.5 bg-white/30 rounded text-xs hover:bg-white/50">{p}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {BANNER_COLORS.map(c => (
            <button key={c} onClick={() => onColorChange(c)}
              className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-white' : ''}`} style={{ backgroundColor: c }} />
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))} className="w-6 h-6 rounded bg-white/20 text-sm flex items-center justify-center hover:bg-white/30">A−</button>
            <span className="text-xs px-1">{fontSize}px</span>
            <button onClick={() => onFontSizeChange(Math.min(48, fontSize + 2))} className="w-6 h-6 rounded bg-white/20 text-sm flex items-center justify-center hover:bg-white/30">A+</button>
          </div>
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-white/20 rounded text-xs">Cancel</button>
          <button onClick={() => { onEdit(val); setEditing(false); }} className="px-2 py-1 bg-white/30 rounded text-xs font-medium">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow h-full text-white"
      style={{ backgroundColor: color }}>
      <div className="text-xs font-bold opacity-80">📋 QUICK MESSAGE</div>
      <div className="font-bold text-center py-1" style={{ fontSize }}>{message}</div>
    </div>
  );
};

export default QuickMessage;
