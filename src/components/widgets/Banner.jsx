import React, { useState } from 'react';

const Banner = ({ text, fontSize = 28, onEdit, onFontSizeChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  if (editing) return (
    <div className="rounded-xl p-3 h-full">
      <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-3 py-2 rounded text-gray-800 text-lg border" autoFocus
        onKeyDown={e => { if (e.key === 'Enter') { onEdit(val); setEditing(false); }}} />
      <div className="flex items-center gap-1 mt-2 justify-end">
        <div className="flex items-center gap-1">
          <button onClick={() => onFontSizeChange(Math.max(12, fontSize - 4))} className="w-7 h-7 rounded bg-gray-200 text-sm flex items-center justify-center hover:bg-gray-300 font-bold">A−</button>
          <span className="text-xs px-1 text-gray-500">{fontSize}px</span>
          <button onClick={() => onFontSizeChange(Math.min(72, fontSize + 4))} className="w-7 h-7 rounded bg-gray-200 text-sm flex items-center justify-center hover:bg-gray-300 font-bold">A+</button>
        </div>
        <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">Cancel</button>
        <button onClick={() => { onEdit(val); setEditing(false); }} className="px-3 py-1 bg-gray-700 text-white rounded font-medium text-sm hover:bg-gray-800">Save</button>
      </div>
    </div>
  );
  return (
    <div onClick={() => setEditing(true)} className="rounded-xl p-4 text-center cursor-pointer hover:opacity-90 shadow-lg h-full flex items-center justify-center">
      <div style={{ fontSize, fontFamily: "'Baloo 2', cursive", fontWeight: 800 }}>{text || '\u00A0'}</div>
    </div>
  );
};

export default Banner;
