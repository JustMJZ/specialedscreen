import React, { useState, useEffect } from 'react';

const CountdownWidget = ({ event, targetTime, onEdit }) => {
  const [diff, setDiff] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newEvent, setNewEvent] = useState(event);
  const [newTime, setNewTime] = useState(targetTime);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      setDiff(target - now);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  useEffect(() => {
    if (diff !== null && diff <= 60000) {
      setPulse(true);
    } else {
      setPulse(false);
    }
  }, [diff]);

  if (diff === null) return null;

  const totalMinutes = Math.floor(diff / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const s = Math.floor((diff % 60000) / 1000);

  // Progress: assume max countdown is 8 hours
  const maxMs = 8 * 60 * 60 * 1000;
  const progress = Math.max(0, Math.min(1, 1 - diff / maxMs));

  // Urgency levels
  const isClose = totalMinutes <= 10;
  const isVeryClose = totalMinutes <= 2;
  const isUnderMinute = totalMinutes === 0;

  // Time display
  let timeDisplay;
  if (isUnderMinute) {
    timeDisplay = `${s}s`;
  } else if (h > 0) {
    timeDisplay = `${h}h ${m}m`;
  } else {
    timeDisplay = `${m}m ${s}s`;
  }

  // Fun event emojis
  const eventEmojis = {
    lunch: '🍕', recess: '🏃', home: '🏠', bus: '🚌', snack: '🍪',
    art: '🎨', music: '🎵', pe: '⚽', library: '📚', science: '🔬',
    party: '🎉', assembly: '🎤', dismissal: '👋', breakfast: '🥞',
  };
  const eventLower = event.toLowerCase();
  const matchedEmoji = Object.entries(eventEmojis).find(([key]) => eventLower.includes(key));
  const emoji = matchedEmoji ? matchedEmoji[1] : '⏰';

  // Bar color based on urgency
  const barColor = isVeryClose ? '#EF4444' : isClose ? '#F59E0B' : '#8B5CF6';

  if (editing) {
    return (
      <div className="rounded-lg p-3 shadow-md h-full flex flex-col justify-center">
        <input value={newEvent} onChange={e => setNewEvent(e.target.value)} placeholder="Event name (e.g. Lunch, Recess)"
          className="w-full px-3 py-1.5 rounded text-sm mb-2 border" autoFocus />
        <div className="flex gap-1">
          <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded text-sm border" />
          <button onClick={() => { onEdit(newEvent, newTime); setEditing(false); }}
            className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm font-bold">✓</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1.5 bg-gray-200 rounded text-sm">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setEditing(true)}
      className="rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-all h-full flex flex-col justify-center overflow-hidden relative">

      <style>{`
        @keyframes countdown-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes countdown-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes countdown-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Event name + emoji */}
      <div className="flex items-center justify-center gap-1 mb-1">
        <span style={{ fontSize: 'clamp(16px, 3vw, 28px)' }}>{emoji}</span>
        <span className="font-black text-gray-700 uppercase tracking-wide" style={{
          fontSize: 'clamp(11px, 1.5vw, 16px)',
        }}>{event}</span>
        <span style={{ fontSize: 'clamp(16px, 3vw, 28px)' }}>{emoji}</span>
      </div>

      {/* Big time display */}
      <div className="text-center" style={{
        animation: isVeryClose ? 'countdown-shake 0.3s infinite' : pulse ? 'countdown-pulse 1s infinite' : 'none',
      }}>
        <div className="font-black" style={{
          fontSize: 'clamp(28px, 6vw, 56px)',
          fontFamily: "'Fredoka One', cursive",
          color: barColor,
          lineHeight: 1,
          textShadow: isClose ? `0 0 20px ${barColor}40` : 'none',
        }}>
          {timeDisplay}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden mt-1.5" style={{ backgroundColor: barColor + '20' }}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: barColor,
            boxShadow: isClose ? `0 0 8px ${barColor}` : 'none',
          }}>
          {isClose && (
            <div className="h-full w-full rounded-full" style={{
              animation: 'countdown-glow 1s infinite',
              backgroundColor: 'rgba(255,255,255,0.5)',
            }} />
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center mt-1">
        {isUnderMinute ? (
          <span className="text-xs font-black text-red-500 uppercase tracking-widest" style={{
            animation: 'countdown-pulse 0.5s infinite',
          }}>Almost time!</span>
        ) : isVeryClose ? (
          <span className="text-xs font-bold text-red-400">Get ready!</span>
        ) : isClose ? (
          <span className="text-xs font-bold text-amber-500">Coming up soon!</span>
        ) : (
          <span className="text-xs text-gray-400">tap to edit</span>
        )}
      </div>
    </div>
  );
};

export default CountdownWidget;
