import React from 'react';

const FirstThen = ({ firstThen, onEdit }) => (
  <div className="rounded-lg p-3 shadow-md relative h-full flex flex-col bg-transparent overflow-hidden">
    <style>{`
      @keyframes arrow-float {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(6px); }
      }
      @keyframes subtle-glow {
        0%, 100% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)); }
        50% { filter: drop-shadow(0 0 16px rgba(255,255,255,0.7)); }
      }
    `}</style>

    <button
      onClick={onEdit}
      className="absolute top-2 right-2 z-[20] text-xs opacity-60 hover:opacity-100 transition-opacity"
      aria-label="Edit first/then"
    >
      ✏️
    </button>

    <div className="flex items-stretch justify-center gap-3 flex-1 min-h-0 relative">
      {/* FIRST card */}
      <div
        className="flex-1 h-full text-center rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3), 0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="text-[9px] font-bold text-white/90 tracking-wider">FIRST</div>
        </div>
        <span
          className="block mb-2"
          style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
          }}
        >
          {firstThen.firstIcon}
        </span>
        <div
          className="text-base font-bold text-white px-3 text-center"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            lineHeight: 1.2
          }}
        >
          {firstThen.firstLabel}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="bg-white rounded-full flex items-center justify-center"
          style={{
            width: 'clamp(48px, 10vw, 64px)',
            height: 'clamp(48px, 10vw, 64px)',
            fontSize: 'clamp(24px, 5vw, 32px)',
            animation: 'arrow-float 2s ease-in-out infinite, subtle-glow 2s ease-in-out infinite',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          ➡️
        </div>
      </div>

      {/* THEN card */}
      <div
        className="flex-1 h-full text-center rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.3), 0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <div className="text-[9px] font-bold text-white/90 tracking-wider">THEN</div>
        </div>
        <span
          className="block mb-2"
          style={{
            fontSize: 'clamp(40px, 8vw, 80px)',
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
          }}
        >
          {firstThen.thenIcon}
        </span>
        <div
          className="text-base font-bold text-white px-3 text-center"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            lineHeight: 1.2
          }}
        >
          {firstThen.thenLabel}
        </div>
      </div>
    </div>
  </div>
);

export default FirstThen;
