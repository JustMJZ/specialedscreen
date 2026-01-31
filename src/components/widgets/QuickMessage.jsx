import React, { useState } from 'react';

const QuickMessage = ({ message, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(message);

  const presets = ['Great job! ⭐', 'Remember: Quiet voices 🤫', 'Clean up time! 🧹', 'Line up! 🚶', 'Eyes on teacher 👀'];

  if (editing) {
    return (
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2 shadow-md">
        <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-2 py-1 rounded text-sm border mb-1" autoFocus />
        <div className="flex flex-wrap gap-1 mb-1">
          {presets.map(p => (
            <button key={p} onClick={() => setVal(p)} className="px-1.5 py-0.5 bg-white/50 rounded text-xs hover:bg-white/80">{p}</button>
          ))}
        </div>
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs">Cancel</button>
          <button onClick={() => { onEdit(val); setEditing(false); }} className="px-2 py-1 bg-amber-500 text-white rounded text-xs">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)} className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-xs font-bold text-amber-600">📋 QUICK MESSAGE</div>
      <div className="font-bold text-gray-700 text-center py-1">{message}</div>
    </div>
  );
};

export default QuickMessage;
