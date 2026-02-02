import React, { useState } from 'react';

const QuickMessage = ({ message, onEdit, fontSize = 16, onFontSizeChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(message);

  const presets = [
    'Great job! ⭐', 'Remember: Quiet voices 🤫', 'Clean up time! 🧹', 'Line up! 🚶', 'Eyes on teacher 👀',
    'Hands to yourself ✋', 'Walking feet please 🦶', 'You can do it! 💪', 'Almost done! 🏁', 'Take a deep breath 🧘',
    'Be kind to each other 💛', 'Time to focus 🎯', 'Great listening! 👂', 'Show me ready! ✅', 'Brain break! 🧠'
  ];

  if (editing) {
    return (
      <div className="rounded-lg p-2 shadow-md h-full">
        <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-2 py-1 rounded text-sm border text-gray-800 mb-1" autoFocus />
        <div className="flex flex-wrap gap-1 mb-1">
          {presets.map(p => (
            <button key={p} onClick={() => setVal(p)} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs hover:bg-gray-200">{p}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1 justify-end">
          <div className="flex items-center gap-1">
            <button onClick={() => onFontSizeChange(Math.max(10, fontSize - 2))} className="w-6 h-6 rounded bg-gray-200 text-sm flex items-center justify-center hover:bg-gray-300 font-bold">A−</button>
            <span className="text-xs px-1 text-gray-500">{fontSize}px</span>
            <button onClick={() => onFontSizeChange(Math.min(48, fontSize + 2))} className="w-6 h-6 rounded bg-gray-200 text-sm flex items-center justify-center hover:bg-gray-300 font-bold">A+</button>
          </div>
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300">Cancel</button>
          <button onClick={() => { onEdit(val); setEditing(false); }} className="px-2 py-1 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow h-full">
      <div className="text-xs font-bold text-gray-500">📋 QUICK MESSAGE</div>
      <div
        className="relative z-10 text-center py-1 font-extrabold"
        style={{
          fontSize,
          textShadow: '0 3px 10px rgba(0,0,0,0.25)',
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default QuickMessage;
