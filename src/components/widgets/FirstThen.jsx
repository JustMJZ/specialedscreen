import React from 'react';

const FirstThen = ({ firstThen, onEdit }) => (
  <div className="rounded-lg p-2 shadow-md relative h-full flex flex-col">
    <button onClick={onEdit} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs z-10">✏️</button>
    <div className="flex items-center justify-center gap-1 flex-1 min-h-0">
      {/* FIRST card */}
      <div className="flex-1 text-center bg-blue-500 rounded-xl p-2 shadow-lg border-4 border-blue-300 flex flex-col items-center justify-center">
        <div className="text-xs font-black text-white tracking-wider uppercase mb-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>FIRST</div>
        <span className="block" style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1 }}>{firstThen.firstIcon}</span>
        <div className="text-sm font-bold text-white mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{firstThen.firstLabel}</div>
      </div>
      {/* Arrow */}
      <div className="flex-shrink-0 flex items-center justify-center" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
        ➡️
      </div>
      {/* THEN card */}
      <div className="flex-1 text-center bg-green-500 rounded-xl p-2 shadow-lg border-4 border-green-300 flex flex-col items-center justify-center">
        <div className="text-xs font-black text-white tracking-wider uppercase mb-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>THEN</div>
        <span className="block" style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1 }}>{firstThen.thenIcon}</span>
        <div className="text-sm font-bold text-white mt-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{firstThen.thenLabel}</div>
      </div>
    </div>
  </div>
);

export default FirstThen;
