import React from 'react';

const FirstThen = ({ firstThen, onEdit }) => (
  <div className="rounded-lg p-1.5 shadow-md relative h-full flex flex-col bg-transparent overflow-hidden">
    <style>{`
      @keyframes arrow-bounce {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        50% { transform: translateX(4px) rotate(-2deg); }
      }
      @keyframes pop-star {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.15); opacity: 1; }
      }
      @keyframes card-pulse {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1px); }
      }
    `}</style>
    
    <button
      onClick={onEdit}
      className="absolute bottom-4 left-4 z-[20] text-[13px] text-black/60 hover:text-black"
      aria-label="Edit first/then"
    >
      ✏️
    </button>
    <div className="flex items-stretch justify-center gap-1 flex-1 min-h-0 relative z-10">
      {/* FIRST card */}
      <div className="flex-1 h-full text-center bg-[#60A5FA] rounded-2xl p-2 shadow-lg border-[3px] border-black flex flex-col items-center justify-center relative z-[1]"
        style={{ animation: 'card-pulse 2.8s ease-in-out infinite' }}>
        <div className="absolute top-1 left-3 bg-black/5 border-[2px] border-black px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider">
          FIRST
        </div>
        <span className="block" style={{ fontSize: 'clamp(34px, 7vw, 72px)', lineHeight: 1 }}>{firstThen.firstIcon}</span>
        <div className="text-sm font-black text-white mt-1 px-2 text-center"
          style={{ textShadow: '0 2px 0 rgba(0,0,0,0.25)' }}>
          {firstThen.firstLabel}
        </div>
        <div className="absolute bottom-1 right-2 text-[10px] text-white/80">⚡</div>
      </div>
      {/* Overlay arrow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
        <div className="px-2 py-1 rounded-full bg-black/5 border-[2px] border-black shadow-sm"
          style={{ fontSize: 'clamp(20px, 4vw, 36px)', animation: 'arrow-bounce 1.6s ease-in-out infinite' }}>
          ➡️
        </div>
      </div>
      {/* THEN card */}
      <div className="flex-1 h-full text-center bg-[#34D399] rounded-2xl p-2 shadow-lg border-[3px] border-black flex flex-col items-center justify-center relative z-[1]"
        style={{ animation: 'card-pulse 2.8s ease-in-out infinite', animationDelay: '0.2s' }}>
        <div className="absolute top-1 right-3 bg-black/5 border-[2px] border-black px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider">
          THEN
        </div>
        <span className="block" style={{ fontSize: 'clamp(34px, 7vw, 72px)', lineHeight: 1 }}>{firstThen.thenIcon}</span>
        <div className="text-sm font-black text-white mt-1 px-2 text-center"
          style={{ textShadow: '0 2px 0 rgba(0,0,0,0.25)' }}>
          {firstThen.thenLabel}
        </div>
        <div className="absolute bottom-1 left-2 text-[10px] text-white/80">💥</div>
      </div>
      <div className="absolute top-1 left-1 text-yellow-400 text-sm" style={{ animation: 'pop-star 1.6s ease-in-out infinite' }}>★</div>
      <div className="absolute bottom-1 right-1 text-pink-400 text-sm" style={{ animation: 'pop-star 1.9s ease-in-out infinite' }}>★</div>
    </div>
  </div>
);

export default FirstThen;
