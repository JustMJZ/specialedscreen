import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';

const CLOCK_STYLES = ['digital', 'analog', 'minimal', 'flip'];

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const {
    clockStyle = 'digital',
    setClockStyle,
    showClockDate = true,
    setShowClockDate,
  } = useAppState() || {};
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 200, height: 100 });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Track container size for responsive scaling (debounced to avoid excessive re-renders)
  useEffect(() => {
    if (!containerRef.current) return;
    let rafId = null;
    const observer = new ResizeObserver((entries) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { width, height } = entries[0].contentRect;
        setSize((prev) => {
          // Only update if changed significantly (>1px) to avoid micro-updates
          if (Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1) {
            return { width, height };
          }
          return prev;
        });
      });
    });
    observer.observe(containerRef.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const cycleStyle = () => {
    if (!setClockStyle) return;
    const currentIndex = CLOCK_STYLES.indexOf(clockStyle);
    const nextIndex = (currentIndex + 1) % CLOCK_STYLES.length;
    setClockStyle(CLOCK_STYLES[nextIndex]);
  };

  // Scale factor based on container size
  const scale = Math.min(size.width / 200, size.height / 120);
  const timeSize = Math.max(24, Math.min(72, scale * 36));
  const ampmSize = timeSize * 0.5;
  const dateSize = Math.max(12, Math.min(24, scale * 14));
  const showDateInClock = showClockDate && size.height > 80;

  // Analog clock calculations
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;
  const analogSize = Math.min(size.width * 0.85, size.height * (showDateInClock ? 0.7 : 0.85));

  const renderAnalog = () => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-1">
      <div className="relative" style={{ width: analogSize, height: analogSize }}>
        {/* Clock face */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg border-4 border-slate-300">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const isMain = i % 3 === 0;
            return (
              <div
                key={i}
                className={`absolute bg-slate-600 ${isMain ? 'w-1' : 'w-0.5'}`}
                style={{
                  height: isMain ? '8%' : '4%',
                  left: '50%',
                  top: '4%',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                  transformOrigin: `center ${analogSize / 2 - analogSize * 0.04}px`,
                }}
              />
            );
          })}
          {/* Hour numbers */}
          {[12, 3, 6, 9].map((num) => {
            const angle = ((num === 12 ? 0 : num) * 30 - 90) * (Math.PI / 180);
            const r = 35;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            return (
              <span
                key={num}
                className="absolute font-bold text-slate-700"
                style={{
                  fontSize: Math.max(10, analogSize * 0.12),
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {num}
              </span>
            );
          })}
          {/* Hour hand */}
          <div
            className="absolute bg-slate-800 rounded-full"
            style={{
              width: Math.max(3, analogSize * 0.04),
              height: '25%',
              left: '50%',
              bottom: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${hourDeg}deg)`,
            }}
          />
          {/* Minute hand */}
          <div
            className="absolute bg-slate-700 rounded-full"
            style={{
              width: Math.max(2, analogSize * 0.03),
              height: '35%',
              left: '50%',
              bottom: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
            }}
          />
          {/* Second hand */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: Math.max(1, analogSize * 0.015),
              height: '40%',
              left: '50%',
              bottom: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(-50%) rotate(${secondDeg}deg)`,
            }}
          />
          {/* Center dot */}
          <div
            className="absolute bg-slate-800 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              width: Math.max(8, analogSize * 0.08),
              height: Math.max(8, analogSize * 0.08),
            }}
          />
        </div>
      </div>
      {showDateInClock && (
        <div className="text-center" style={{ fontSize: dateSize }}>
          <span className="font-semibold text-slate-700">{dayName}</span>
          <span className="text-slate-400 mx-1">•</span>
          <span className="text-slate-500">{dateStr}</span>
        </div>
      )}
    </div>
  );

  const renderDigital = () => (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div
        className="font-bold tracking-tight text-slate-800 tabular-nums"
        style={{ fontSize: timeSize }}
      >
        {hours12}:{minutes.toString().padStart(2, '0')}
        <span className="text-slate-500 ml-1" style={{ fontSize: ampmSize }}>
          {ampm}
        </span>
      </div>
      {showDateInClock && (
        <div className="text-center" style={{ fontSize: dateSize }}>
          <span className="font-medium text-slate-600">{dayName}</span>
          <span className="text-slate-400 mx-2">•</span>
          <span className="text-slate-500">{dateStr}</span>
        </div>
      )}
    </div>
  );

  const renderMinimal = () => (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div
        className="font-extralight tracking-tight text-slate-700 tabular-nums"
        style={{ fontSize: timeSize * 1.2 }}
      >
        {hours12}:{minutes.toString().padStart(2, '0')}
      </div>
      <div
        className="font-light text-slate-400 uppercase tracking-widest"
        style={{ fontSize: ampmSize }}
      >
        {ampm}
      </div>
      {showDateInClock && (
        <div className="text-slate-500 mt-1" style={{ fontSize: dateSize }}>
          {dayName}, {dateStr}
        </div>
      )}
    </div>
  );

  const flipCardSize = Math.max(28, Math.min(80, scale * 44));
  const flipFontSize = flipCardSize * 0.6;

  const FlipCard = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-lg flex items-center justify-center"
          style={{ width: flipCardSize, height: flipCardSize * 1.1, padding: flipCardSize * 0.1 }}
        >
          <span
            className="font-bold text-white tabular-nums"
            style={{ fontSize: flipFontSize, fontFamily: 'monospace' }}
          >
            {value.toString().padStart(2, '0')}
          </span>
        </div>
        {/* Flip line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/30" />
        {/* Shine effect */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-lg pointer-events-none"
          style={{ height: '50%' }}
        />
      </div>
      {label && size.height > 100 && (
        <span
          className="text-slate-500 mt-1 uppercase tracking-wider"
          style={{ fontSize: Math.max(8, flipCardSize * 0.2) }}
        >
          {label}
        </span>
      )}
    </div>
  );

  const renderFlip = () => (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2">
      <div className="flex items-center" style={{ gap: flipCardSize * 0.15 }}>
        <FlipCard value={hours12} label="hr" />
        <span
          className="font-bold text-slate-600"
          style={{
            fontSize: flipFontSize,
            marginBottom: size.height > 100 ? flipCardSize * 0.4 : 0,
          }}
        >
          :
        </span>
        <FlipCard value={minutes} label="min" />
        <span
          className="font-bold text-slate-600"
          style={{
            fontSize: flipFontSize,
            marginBottom: size.height > 100 ? flipCardSize * 0.4 : 0,
          }}
        >
          :
        </span>
        <FlipCard value={seconds} label="sec" />
        <div
          className="flex flex-col justify-center"
          style={{
            marginLeft: flipCardSize * 0.2,
            marginBottom: size.height > 100 ? flipCardSize * 0.4 : 0,
          }}
        >
          <span
            className={`font-bold ${ampm === 'AM' ? 'text-amber-500' : 'text-indigo-500'}`}
            style={{ fontSize: flipFontSize * 0.4 }}
          >
            {ampm}
          </span>
        </div>
      </div>
      {showDateInClock && (
        <div className="text-slate-600" style={{ fontSize: dateSize }}>
          {dayName}, {dateStr}
        </div>
      )}
    </div>
  );

  const renderClock = () => {
    switch (clockStyle) {
      case 'analog':
        return renderAnalog();
      case 'minimal':
        return renderMinimal();
      case 'flip':
        return renderFlip();
      default:
        return renderDigital();
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative overflow-hidden"
      onClick={cycleStyle}
      style={{ cursor: setClockStyle ? 'pointer' : 'default' }}
    >
      {renderClock()}
      {/* Settings button */}
      {setShowClockDate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(!showSettings);
          }}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-200/60 hover:bg-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs transition-colors"
          aria-label="Clock settings"
          title="Clock settings"
        >
          ⚙
        </button>
      )}
      {showSettings && setShowClockDate && (
        <div
          className="absolute top-8 right-1 bg-white rounded-lg shadow-xl border p-2 z-50 min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Style</div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            {CLOCK_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setClockStyle(style)}
                className={`px-2 py-1 text-xs rounded capitalize ${clockStyle === style ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {style}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Options</div>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showClockDate}
              onChange={(e) => setShowClockDate(e.target.checked)}
              className="rounded"
            />
            Show date
          </label>
        </div>
      )}
    </div>
  );
};

export default Clock;
