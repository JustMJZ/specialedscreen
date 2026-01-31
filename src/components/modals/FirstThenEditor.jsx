import React, { useState } from 'react';

const FirstThenEditor = ({ firstThen, onUpdate, onClose }) => {
  const [editing, setEditing] = useState({ ...firstThen });
  const activities = [
    { icon: '📚', label: 'Reading' }, { icon: '✏️', label: 'Writing' }, { icon: '🔢', label: 'Math' },
    { icon: '🎨', label: 'Art' }, { icon: '🎵', label: 'Music' }, { icon: '🎮', label: 'Free Time' },
    { icon: '🧩', label: 'Puzzles' }, { icon: '💻', label: 'Computer' }, { icon: '🏃', label: 'PE' },
    { icon: '🍎', label: 'Snack' }, { icon: '🥪', label: 'Lunch' }, { icon: '🧹', label: 'Clean Up' },
  ];
  const isCustomFirst = !activities.some(a => a.icon === editing.firstIcon && a.label === editing.firstLabel);
  const isCustomThen = !activities.some(a => a.icon === editing.thenIcon && a.label === editing.thenLabel);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit First/Then</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <div className="mb-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">FIRST</label>
            <div className="flex flex-wrap gap-1">
              {activities.map(a => (
                <button key={a.icon} onClick={() => setEditing(p => ({ ...p, firstIcon: a.icon, firstLabel: a.label }))}
                  className={`px-2 py-1 rounded text-xs ${editing.firstIcon === a.icon && editing.firstLabel === a.label ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
              <button onClick={() => setEditing(p => ({ ...p, firstIcon: '📝', firstLabel: '' }))}
                className={`px-2 py-1 rounded text-xs ${isCustomFirst ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                ✏️ Custom
              </button>
            </div>
            {isCustomFirst && (
              <div className="flex gap-1 mt-1">
                <input type="text" value={editing.firstIcon} onChange={(e) => setEditing(p => ({ ...p, firstIcon: e.target.value }))}
                  className="w-10 px-1 py-1 border rounded text-center text-sm" placeholder="📝" maxLength={2} />
                <input type="text" value={editing.firstLabel} onChange={(e) => setEditing(p => ({ ...p, firstLabel: e.target.value }))}
                  className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Activity name" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-green-600 mb-1">THEN</label>
            <div className="flex flex-wrap gap-1">
              {activities.map(a => (
                <button key={a.icon} onClick={() => setEditing(p => ({ ...p, thenIcon: a.icon, thenLabel: a.label }))}
                  className={`px-2 py-1 rounded text-xs ${editing.thenIcon === a.icon && editing.thenLabel === a.label ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
              <button onClick={() => setEditing(p => ({ ...p, thenIcon: '📝', thenLabel: '' }))}
                className={`px-2 py-1 rounded text-xs ${isCustomThen ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                ✏️ Custom
              </button>
            </div>
            {isCustomThen && (
              <div className="flex gap-1 mt-1">
                <input type="text" value={editing.thenIcon} onChange={(e) => setEditing(p => ({ ...p, thenIcon: e.target.value }))}
                  className="w-10 px-1 py-1 border rounded text-center text-sm" placeholder="📝" maxLength={2} />
                <input type="text" value={editing.thenLabel} onChange={(e) => setEditing(p => ({ ...p, thenLabel: e.target.value }))}
                  className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Activity name" />
              </div>
            )}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editing); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

export default FirstThenEditor;
