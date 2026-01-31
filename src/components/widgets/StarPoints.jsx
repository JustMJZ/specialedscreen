import React, { useState, useEffect } from 'react';

const StarPoints = ({ points, onAdd, onSubtract, onReset }) => {
  const [sparkle, setSparkle] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (points > 0) {
      setSparkle(true);
      setBounce(true);
      const t1 = setTimeout(() => setSparkle(false), 600);
      const t2 = setTimeout(() => setBounce(false), 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [points]);

  const starDisplay = [];
  const displayCount = Math.min(points, 20);
  for (let i = 0; i < displayCount; i++) {
    starDisplay.push(
      <span key={i} style={{
        fontSize: 'clamp(14px, 2.5vw, 22px)',
        display: 'inline-block',
        animation: sparkle && i === displayCount - 1 ? 'star-pop 0.5s ease-out' : 'none',
        filter: `hue-rotate(${i * 15}deg)`,
      }}>⭐</span>
    );
  }

  return (
    <div className="rounded-lg p-2 shadow-md h-full flex flex-col items-center justify-center relative overflow-hidden">
      <style>{`
        @keyframes star-pop {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.5) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes number-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>

      <div className="text-xs font-black tracking-widest uppercase text-amber-500 mb-1">⭐ CLASS STARS ⭐</div>

      <div className="flex items-center gap-3 mb-1">
        <button onClick={onSubtract}
          className="w-6 h-6 rounded-full bg-red-400 text-white font-bold text-sm shadow hover:bg-red-500 active:scale-90 transition-transform flex items-center justify-center"
          style={{ lineHeight: 1 }}>−</button>

        <div className="text-center" style={{
          animation: bounce ? 'number-bounce 0.4s ease-out' : 'none',
        }}>
          <div className="font-black text-amber-500" style={{
            fontSize: 'clamp(36px, 7vw, 64px)',
            fontFamily: "'Fredoka One', cursive",
            lineHeight: 1,
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          }}>{points}</div>
        </div>

        <button onClick={onAdd}
          className="w-6 h-6 rounded-full bg-green-400 text-white font-bold text-sm shadow hover:bg-green-500 active:scale-90 transition-transform flex items-center justify-center"
          style={{ lineHeight: 1 }}>+</button>
      </div>

      {displayCount > 0 && (
        <div className="flex flex-wrap justify-center gap-0.5 max-w-full">
          {starDisplay}
          {points > 20 && <span className="text-xs font-bold text-amber-500 self-center ml-1">+{points - 20}</span>}
        </div>
      )}

      <button onClick={onReset} className="mt-1 text-xs text-gray-400 hover:text-red-400 transition-colors">Reset</button>
    </div>
  );
};

export default StarPoints;
