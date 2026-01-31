import React, { useState } from 'react';
import { BANNER_COLORS } from '../../constants';

const Banner = ({ text, color, onEdit, onColorChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  if (editing) return (
    <div className="rounded-xl p-3 text-white" style={{ backgroundColor: color }}>
      <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-3 py-2 rounded text-gray-800 text-lg" autoFocus
        onKeyDown={e => { if (e.key === 'Enter') { onEdit(val); setEditing(false); }}} />
      <div className="flex items-center gap-1 mt-2">
        {BANNER_COLORS.map(c => (
          <button key={c} onClick={() => onColorChange(c)}
            className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-white' : ''}`} style={{ backgroundColor: c }} />
        ))}
        <div className="flex-1" />
        <button onClick={() => setEditing(false)} className="px-3 py-1 bg-white/20 rounded text-sm">Cancel</button>
        <button onClick={() => { onEdit(val); setEditing(false); }} className="px-3 py-1 bg-white/30 rounded font-medium text-sm">Save</button>
      </div>
    </div>
  );
  return (
    <div onClick={() => setEditing(true)} className="rounded-xl p-4 text-white text-center cursor-pointer hover:opacity-90 shadow-lg"
      style={{ backgroundColor: color }}>
      <div className="text-2xl" style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800 }}>{text || '\u00A0'}</div>
    </div>
  );
};

export default Banner;
