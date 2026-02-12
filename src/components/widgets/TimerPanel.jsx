import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { ROTATION_SOUNDS, playSound } from '../../constants/sounds';
import TimerSettingsModal from '../modals/TimerSettingsModal';

const VALID_TIMER_STYLES = ['ring', 'hourglass', 'space', 'ocean', 'arcade', 'classic'];

/* ── Confetti burst on timer completion ── */
const Confetti = ({ active, performanceMode }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active || performanceMode) { setParticles([]); return; }
    const colors = ['#FF8A7A', '#5BC0BE', '#FFD166', '#B39DDB', '#7BC47F', '#FF6B9D', '#45B7D1'];
    const p = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50,
      dx: (Math.random() - 0.5) * 140,
      dy: -Math.random() * 100 - 30,
      rot: Math.random() * 360,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 5,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
    setParticles(p);
    const t = setTimeout(() => setParticles([]), 1600);
    return () => clearTimeout(t);
  }, [active]);
  if (particles.length === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 30 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
          backgroundColor: p.color, borderRadius: p.shape === 'circle' ? '50%' : '2px',
          transform: `rotate(${p.rot}deg)`,
          animation: `confetti-burst 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
        }} />
      ))}
      <style>{`
        @keyframes confetti-burst {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/* ── Ring display ── */
const RingDisplay = ({ progress, mins, secs, barColor, isRunning }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const pulseClass = progress < 0.07 && isRunning ? 'animate-pulse' : '';
  return (
    <div className="flex items-center justify-center flex-1 min-h-0" style={{ color: COLORS.text }}>
      <svg viewBox="0 0 160 160" className={pulseClass} style={{ width: '100%', height: '100%', maxWidth: 320, maxHeight: 320 }}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={barColor} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
        <text x="80" y="80" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 32, fontFamily: "'Fredoka One', cursive", fill: 'currentColor' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </text>
        <text x="80" y="104" textAnchor="middle" style={{ fontSize: 10, fill: 'color-mix(in srgb, currentColor 55%, #9CA3AF 45%)' }}>
          {isRunning ? 'running' : 'paused'}
        </text>
      </svg>
    </div>
  );
};

/* ── Hourglass display ── */
const HourglassDisplay = ({ progress, mins, secs, barColor, isRunning }) => {
  const sandTop = Math.max(0, progress);
  const sandBottom = 1 - progress;
  const pulseClass = progress < 0.07 && isRunning ? 'animate-pulse' : '';
  const sparkles = [
    { top: '20%', left: '30%', delay: '0s' },
    { top: '35%', left: '38%', delay: '0.6s' },
    { top: '50%', left: '32%', delay: '1.1s' },
  ];
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return (
    <div className={`flex items-center justify-center flex-1 min-h-0 w-full h-full ${pulseClass}`} style={{ color: COLORS.text }}>
      <div className="relative hourglass-wrap" style={{ height: '100%', width: '100%' }}>
        <div className="hourglass-glow" />
        <div className="hourglass-shine" />
        {sparkles.map((s, i) => (
          <span
            key={i}
            className="hourglass-sparkle"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
        <svg viewBox="0 0 180 140" preserveAspectRatio="xMidYMid meet" style={{ height: '100%', width: '100%' }}>
        {/* Frame */}
        <rect x="14" y="4" width="72" height="8" rx="4" fill="#8B7355" />
        <rect x="14" y="128" width="72" height="8" rx="4" fill="#8B7355" />
        {/* Glass outline */}
        <path d="M24 14 L24 50 Q24 70 50 70 Q76 70 76 50 L76 14" fill="none" stroke="#C4A882" strokeWidth="3.5" />
        <path d="M24 128 L24 92 Q24 70 50 70 Q76 70 76 92 L76 128" fill="none" stroke="#C4A882" strokeWidth="3.5" />
        {/* Top sand */}
        <clipPath id="topClip">
          <path d="M25 15 L25 49 Q25 69 50 69 Q75 69 75 49 L75 15 Z" />
        </clipPath>
        <rect clipPath="url(#topClip)" x="25" y={15 + (1 - sandTop) * 56} width="50" height={sandTop * 56}
          fill={`url(#sandGradient)`} style={{ transition: 'all 1s linear' }} />
        {/* Bottom sand */}
        <clipPath id="botClip">
          <path d="M25 127 L25 93 Q25 71 50 71 Q75 71 75 93 L75 127 Z" />
        </clipPath>
        <rect clipPath="url(#botClip)" x="25" y={127 - sandBottom * 56} width="50" height={sandBottom * 56}
          fill={`url(#sandGradient)`} style={{ transition: 'all 1s linear' }} />
        {/* Falling stream */}
        {isRunning && progress > 0.01 && (
          <line x1="50" y1="70" x2="50" y2={127 - sandBottom * 56} stroke={barColor} strokeWidth="3" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.35;0.7" dur="0.7s" repeatCount="indefinite" />
          </line>
        )}
        {/* Time text */}
        <text x="130" y="78" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 32, fontFamily: "'Fredoka One', cursive", fill: 'currentColor' }}>
          {timeStr}
        </text>
        <defs>
          <linearGradient id="sandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD166" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      </div>
    </div>
  );
};


/* ── Space display ── */
const SpaceDisplay = ({ progress, mins, secs, isRunning, timePop, onTimeClick }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const angle = clamped * 360;
  const stars = [
    { top: '12%', left: '16%', size: 6, delay: '0s' },
    { top: '20%', left: '70%', size: 4, delay: '0.6s' },
    { top: '48%', left: '82%', size: 5, delay: '1.1s' },
    { top: '64%', left: '14%', size: 4, delay: '0.3s' },
    { top: '78%', left: '52%', size: 6, delay: '0.9s' },
  ];
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="relative w-full h-full rounded-2xl border-2 border-[#7DD3FC] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#312E81] overflow-hidden">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute star-twinkle"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="orbit-ring orbit-ring-lg" />
          <div
            className="absolute rocket-orbit"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div className={`rocket-mini ${isRunning ? 'rocket-mini-wiggle' : ''}`}>
              🚀
              <span className={`rocket-mini-flame ${isRunning ? 'rocket-flame-on' : ''}`}>✨</span>
            </div>
          </div>
          <div className="planet-core">
            <div className="planet-ring" />
            <div className="planet-glow" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onTimeClick}
            className={`space-time ${isRunning ? 'time-float' : ''} ${timePop ? 'time-pop' : ''}`}
            style={{ fontFamily: "'Fredoka One', cursive", color: '#E0F2FE' }}
          >
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Ocean display ── */
const OceanDisplay = ({ progress, mins, secs, barColor, isRunning, timePop, onTimeClick }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const bubbles = [
    { left: '18%', delay: '0s', size: 6 },
    { left: '42%', delay: '0.8s', size: 8 },
    { left: '68%', delay: '1.3s', size: 5 },
  ];
  const fish = [
    { top: '38%', delay: '0s' },
    { top: '58%', delay: '1.2s' },
  ];
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="relative w-full h-full rounded-2xl ocean-bg overflow-hidden">
        <div className="ocean-rays" />
        <div className="ocean-vignette" />
        <div className="ocean-wave ocean-wave-back" />
        <div className="ocean-wave ocean-wave-front" />
        {bubbles.map((b, i) => (
          <span
            key={i}
            className={`ocean-bubble ${isRunning ? 'ocean-bubble-rise' : ''}`}
            style={{ left: b.left, animationDelay: b.delay, width: b.size, height: b.size }}
          />
        ))}
        {fish.map((f, i) => (
          <span
            key={i}
            className={`ocean-fish ${isRunning ? 'ocean-fish-drift' : ''}`}
            style={{ top: f.top, animationDelay: f.delay }}
          >
            🐠
          </span>
        ))}
        <div
          className={`ocean-boat ${isRunning ? 'ocean-boat-bob' : ''}`}
          style={{ left: `calc(${clamped * 100}% - 14px)` }}
        >
          🚤
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onTimeClick}
            className={`ocean-time ${isRunning ? 'time-float' : ''} ${timePop ? 'time-pop' : ''}`}
          >
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </button>
        </div>
        <div className={`ocean-dolphin ${isRunning ? 'ocean-dolphin-jump' : ''}`}>
          🐬
        </div>
        <div className={`ocean-splash ${isRunning ? 'ocean-splash-pop' : ''}`}>
          💦
        </div>
      </div>
    </div>
  );
};

/* ── Arcade display ── */
const ArcadeDisplay = ({ progress, mins, secs, isRunning, timePop, onTimeClick }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="relative w-full h-full rounded-2xl arcade-bg overflow-hidden">
        <div className="arcade-grid" />
        <div className="arcade-glow" />
        <div className="arcade-beam" />
        <div className={`arcade-comet ${isRunning ? 'arcade-comet-fly' : ''}`} style={{ left: `calc(${clamped * 100}% - 12px)` }}>
          ⭐
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={onTimeClick}
            className={`arcade-time ${isRunning ? 'time-float' : ''} ${timePop ? 'time-pop' : ''}`}
          >
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </button>
        </div>
        <div className="arcade-score">{isRunning ? 'LEVEL UP' : 'READY?'}</div>
      </div>
    </div>
  );
};


/* ── Classic display (original) ── */
const ClassicDisplay = ({ progress, mins, secs, barColor, isRunning, blendMode }) => (
  <div className="flex flex-col justify-center flex-1 min-h-0 gap-2" style={{ color: COLORS.text }}>
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 'clamp(48px, 9vw, 80px)', color: 'currentColor', lineHeight: 1, fontFamily: "'Fredoka One', cursive" }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span
        className="text-base px-3 py-1.5 rounded-full"
        style={{
          backgroundColor: blendMode ? 'rgba(0,0,0,0.06)' : isRunning ? '#DCFCE7' : '#F3F4F6',
          color: isRunning ? '#15803D' : '#6B7280',
          border: blendMode ? '1px solid rgba(148,163,184,0.35)' : 'none',
        }}
      >
        {isRunning ? '●' : '○'}
      </span>
    </div>
    <div
      className="h-4 rounded-full overflow-hidden"
      style={{ backgroundColor: blendMode ? 'rgba(0,0,0,0.06)' : '#E5E7EB' }}
    >
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%`, backgroundColor: barColor }} />
    </div>
  </div>
);

/* ── Main TimerPanel ── */
const TimerPanel = () => {
  const {
    timeRemaining, totalTime, isRunning, setIsRunning,
    setTimeRemaining, setTotalTime,
    autoRepeat, setAutoRepeat,
    triggerRotation, isAnimating, isEditMode,
    rotationSound, setRotationSound,
    customSounds, setCustomSounds,
    timerStyle, setTimerStyle,
    soundVolume, setSoundVolume,
    performanceMode,
  } = useAppState();

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timePop, setTimePop] = useState(false);
  const prevTimeRef = useRef(timeRemaining);

  const disabled = isEditMode || isAnimating;
  let barColor = progress < 0.07 ? '#FF8A7A' : progress < 0.15 ? '#FFD166' : '#94A3B8';

  // Detect timer completion for confetti
  useEffect(() => {
    if (prevTimeRef.current > 0 && timeRemaining === 0) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 1800);
      return () => clearTimeout(t);
    }
    prevTimeRef.current = timeRemaining;
  }, [timeRemaining]);

  const triggerTimePop = () => {
    setTimePop(true);
    setTimeout(() => setTimePop(false), 280);
  };

  const displayProps = { progress, mins, secs, barColor, isRunning, timePop, onTimeClick: triggerTimePop };
  const effectiveStyle = VALID_TIMER_STYLES.includes(timerStyle) ? timerStyle : 'ring';
  const isSpace = effectiveStyle === 'space';
  const isOcean = effectiveStyle === 'ocean';
  const isArcade = effectiveStyle === 'arcade';
  const isImmersive = isSpace || isOcean || isArcade;
  const isHourglass = effectiveStyle === 'hourglass';
  const blendMode = !isImmersive && (effectiveStyle === 'ring' || effectiveStyle === 'hourglass' || effectiveStyle === 'classic');

  useEffect(() => {
    if (!VALID_TIMER_STYLES.includes(timerStyle)) {
      setTimerStyle('ring');
    }
  }, [timerStyle, setTimerStyle]);

  const controls = (
    <div className="flex flex-wrap gap-1 justify-center timer-controls">
      <button onClick={() => setIsRunning(!isRunning)} className="timer-btn timer-btn-primary"
        style={{ backgroundColor: isRunning ? '#FF8A7A' : '#5BC0BE', opacity: disabled ? 0.5 : 1 }} disabled={disabled}>
        {isRunning ? '⏸ Pause' : '▶ Start'}
      </button>
      <button onClick={() => setTimeRemaining(totalTime)} className="timer-btn timer-btn-ghost"
        style={{ opacity: disabled ? 0.5 : 1 }} disabled={disabled}>↺</button>
      <button onClick={triggerRotation} className="timer-btn timer-btn-ghost"
        style={{ backgroundColor: isAnimating ? '#FEF3C7' : '#E5E7EB', color: isAnimating ? '#D97706' : '#374151', opacity: isEditMode ? 0.5 : 1 }} disabled={disabled}>
        ⏭ Next
      </button>
    </div>
  );

  return (
    <div className={`rounded-lg p-0 shadow-md flex flex-col gap-1 h-full relative timer-immersive ${blendMode ? 'timer-blend' : ''}`}>
      <style>{`
        @keyframes timer-breathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        @keyframes timer-glow {
          0% { box-shadow: 0 0 0 rgba(91,192,190,0.0); }
          50% { box-shadow: 0 0 18px rgba(91,192,190,0.35); }
          100% { box-shadow: 0 0 0 rgba(91,192,190,0.0); }
        }
        @keyframes timer-tick {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes time-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes time-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes rocket-wiggle {
          0% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0); }
        }
        @keyframes rocket-flame {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        @keyframes planet-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.45); }
          50% { box-shadow: 0 0 22px rgba(56,189,248,0.55); }
        }
        @keyframes hourglass-shimmer {
          0% { transform: translateX(-20%); opacity: 0.1; }
          50% { opacity: 0.35; }
          100% { transform: translateX(120%); opacity: 0.1; }
        }
        @keyframes hourglass-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        @keyframes ocean-wave {
          0% { background-position: 0 0; }
          100% { background-position: 60px 0; }
        }
        @keyframes ocean-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes ocean-bubble {
          0% { transform: translateY(0) scale(0.8); opacity: 0.6; }
          100% { transform: translateY(-18px) scale(1); opacity: 0; }
        }
        @keyframes arcade-grid {
          0% { background-position: 0 0; }
          100% { background-position: 80px 80px; }
        }
        @keyframes arcade-comet {
          0%, 100% { transform: translateY(0) scale(0.9); opacity: 0.7; }
          50% { transform: translateY(-6px) scale(1); opacity: 1; }
        }
        @keyframes ocean-dolphin {
          0% { transform: translate(-20%, 20%) rotate(-8deg); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translate(20%, -20%) rotate(8deg); }
          80% { opacity: 1; }
          100% { transform: translate(60%, 10%) rotate(0deg); opacity: 0; }
        }
        @keyframes ocean-splash {
          0% { transform: scale(0.6); opacity: 0; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes ocean-fish {
          0% { transform: translateX(-20px); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .timer-running .timer-shell {
          animation: timer-breathe 2.4s ease-in-out infinite;
        }
        .timer-running .timer-accent {
          animation: timer-glow 2.4s ease-in-out infinite;
        }
        .timer-tick {
          animation: timer-tick 0.2s ease-out;
        }
        .timer-shell {
          border-radius: 16px;
          padding: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.9));
          border: 1px solid rgba(148,163,184,0.35);
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
          min-height: 0;
          position: relative;
          overflow: hidden;
        }
        .timer-shell::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 40%),
                      radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2), transparent 40%);
          pointer-events: none;
          opacity: 0.8;
        }
        .timer-blend .timer-shell {
          background: transparent;
        }
        .timer-blend .timer-shell::after {
          opacity: 0;
        }
        .space-shell {
          position: relative;
          flex: 1;
          min-height: 0;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .space-shell-body {
          flex: 1;
          min-height: 0;
        }
        .timer-shell.theme-space {
          border-color: rgba(125, 211, 252, 0.45);
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.35), inset 0 0 24px rgba(14, 165, 233, 0.25);
        }
        .timer-shell.theme-race {
          border-color: rgba(148,163,184,0.5);
          box-shadow: inset 0 0 20px rgba(0,0,0,0.08);
        }
        .timer-shell.theme-hourglass {
          border-color: rgba(251,191,36,0.55);
          box-shadow: 0 0 18px rgba(251,191,36,0.35), inset 0 0 18px rgba(245,158,11,0.2);
        }
        .timer-shell.theme-emoji {
          border-color: rgba(250,204,21,0.55);
          box-shadow: 0 0 18px rgba(250,204,21,0.35);
        }
        .timer-shell.theme-ring,
        .timer-shell.theme-classic {
          border-color: rgba(148,163,184,0.45);
        }
        .hourglass-wrap {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hourglass-glow {
          position: absolute;
          width: 70%;
          height: 80%;
          background: radial-gradient(circle, rgba(251,191,36,0.35), transparent 65%);
          filter: blur(6px);
          opacity: 0.9;
        }
        .hourglass-shine {
          position: absolute;
          width: 35%;
          height: 90%;
          left: 10%;
          top: 5%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.35) 40%, transparent 60%);
          transform: translateX(-20%);
          animation: hourglass-shimmer 3.6s ease-in-out infinite;
          pointer-events: none;
        }
        .hourglass-sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: radial-gradient(circle, #FFF7D6 0%, #FBBF24 60%, transparent 70%);
          animation: hourglass-sparkle 1.8s ease-in-out infinite;
          pointer-events: none;
        }
        .hourglass-time {
          font-size: clamp(24px, 5vw, 42px);
          font-weight: 900;
          color: currentColor;
          text-shadow: 0 2px 8px rgba(251,191,36,0.3);
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: visible;
        }
        .timer-immersive {
          padding: 0;
        }
        .timer-display {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          flex: 1;
          min-height: 0;
        }
        .space-chip {
          position: absolute;
          top: 8px;
          font-size: 10px;
          font-weight: 700;
          color: #E0F2FE;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(148,163,184,0.35);
          padding: 4px 8px;
          border-radius: 999px;
          backdrop-filter: blur(6px);
          z-index: 5;
        }
        .space-chip-left {
          left: 8px;
        }
        .space-chip-right {
          right: 8px;
        }
        .space-controls {
          position: absolute;
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          z-index: 5;
        }
        .timer-controls {
          gap: 6px;
        }
        .timer-btn {
          padding: 6px 12px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 12px;
          color: #0F172A;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(148,163,184,0.4);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .timer-blend .timer-btn {
          background: rgba(0,0,0,0.06);
          border-color: rgba(148,163,184,0.45);
        }
        .timer-btn-primary {
          color: #ffffff;
          box-shadow: 0 6px 14px rgba(91,192,190,0.35);
        }
        .timer-btn-ghost {
          background: rgba(255,255,255,0.85);
        }
        .timer-blend .timer-btn-ghost {
          background: rgba(0,0,0,0.06);
        }
        .star-twinkle {
          background: radial-gradient(circle, #FFFFFF 0%, #E0F2FE 60%, transparent 70%);
          border-radius: 999px;
          animation: star-twinkle 1.6s ease-in-out infinite;
        }
        .orbit-ring {
          width: 180px;
          height: 180px;
          border: 2px dashed rgba(148,163,184,0.5);
          border-radius: 999px;
        }
        .orbit-ring-lg {
          width: 200px;
          height: 200px;
        }
        .rocket-orbit {
          position: absolute;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .rocket-mini {
          font-size: 20px;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
        }
        .rocket-mini-wiggle {
          animation: rocket-wiggle 0.8s ease-in-out infinite;
        }
        .rocket-mini-flame {
          margin-left: 2px;
        }
        .rocket-flame-on {
          animation: rocket-flame 0.5s ease-in-out infinite;
        }
        .planet-core {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle at 30% 30%, #A5B4FC 0%, #6366F1 60%, #4338CA 100%);
          border-radius: 999px;
          position: relative;
          animation: planet-pulse 2.2s ease-in-out infinite;
        }
        .planet-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 94px;
          height: 34px;
          transform: translate(-50%, -50%) rotate(-12deg);
          border: 2px solid rgba(191,219,254,0.8);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }
        .planet-glow {
          position: absolute;
          inset: -10px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(56,189,248,0.25), transparent 70%);
        }
        .ocean-bg {
          background: linear-gradient(180deg, #CFFAFE 0%, #A5F3FC 45%, #38BDF8 100%);
          border: 2px solid rgba(14,116,144,0.35);
        }
        .ocean-rays {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(255,255,255,0.12) 60%, transparent 100%);
          opacity: 0.5;
          pointer-events: none;
        }
        .ocean-vignette {
          position: absolute;
          inset: 0;
          box-shadow: inset 0 -30px 40px rgba(2, 132, 199, 0.35);
          pointer-events: none;
        }
        .ocean-wave {
          position: absolute;
          left: 0;
          right: 0;
          height: 35%;
          bottom: 0;
          background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0 20px, transparent 20px 40px);
          animation: ocean-wave 2.4s linear infinite;
          opacity: 0.35;
        }
        .ocean-wave-back {
          bottom: 20%;
          opacity: 0.25;
          animation-duration: 3.2s;
        }
        .ocean-wave-front {
          bottom: 6%;
        }
        .ocean-boat {
          position: absolute;
          bottom: 18%;
          font-size: 20px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .ocean-boat-bob {
          animation: ocean-bob 1.4s ease-in-out infinite;
        }
        .ocean-bubble {
          position: absolute;
          bottom: 26%;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0.2));
        }
        .ocean-bubble-rise {
          animation: ocean-bubble 1.8s ease-in-out infinite;
        }
        .ocean-fish {
          position: absolute;
          left: -10%;
          font-size: 18px;
          opacity: 0;
        }
        .ocean-fish-drift {
          animation: ocean-fish 6s linear infinite;
        }
        .ocean-time {
          font-size: clamp(34px, 7vw, 64px);
          font-family: 'Fredoka One', cursive;
          color: #083344;
          background: transparent;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          letter-spacing: 1px;
          text-shadow: 0 3px 10px rgba(255,255,255,0.7), 0 0 16px rgba(14,165,233,0.45);
          cursor: pointer;
        }
        .ocean-dolphin {
          position: absolute;
          left: 12%;
          bottom: 22%;
          font-size: 20px;
          opacity: 0;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .ocean-dolphin-jump {
          animation: ocean-dolphin 3.8s ease-in-out infinite;
        }
        .ocean-splash {
          position: absolute;
          left: 26%;
          bottom: 14%;
          font-size: 18px;
          opacity: 0;
        }
        .ocean-splash-pop {
          animation: ocean-splash 1.2s ease-out infinite;
        }
        .ocean-chip {
          background: rgba(15, 118, 110, 0.55);
          border-color: rgba(94, 234, 212, 0.35);
          color: #ECFEFF;
        }
        .arcade-chip {
          background: rgba(17, 24, 39, 0.65);
          border-color: rgba(139, 92, 246, 0.45);
          color: #F5D0FE;
        }
        .arcade-bg {
          background: radial-gradient(circle at 30% 20%, rgba(139,92,246,0.35), transparent 45%),
                      radial-gradient(circle at 80% 70%, rgba(34,211,238,0.35), transparent 45%),
                      linear-gradient(180deg, #0F172A 0%, #111827 100%);
          border: 2px solid rgba(139, 92, 246, 0.4);
        }
        .arcade-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: arcade-grid 6s linear infinite;
        }
        .arcade-glow {
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 40px rgba(139,92,246,0.25);
          pointer-events: none;
        }
        .arcade-beam {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: 12%;
          height: 6px;
          background: linear-gradient(90deg, #F472B6, #A78BFA, #22D3EE);
          border-radius: 999px;
          opacity: 0.8;
          box-shadow: 0 0 12px rgba(167,139,250,0.6);
        }
        .arcade-comet {
          position: absolute;
          top: 18%;
          font-size: 18px;
          filter: drop-shadow(0 2px 6px rgba(236, 72, 153, 0.5));
        }
        .arcade-comet-fly {
          animation: arcade-comet 1.6s ease-in-out infinite;
        }
        .arcade-time {
          font-size: clamp(34px, 7vw, 64px);
          font-family: 'Fredoka One', cursive;
          color: #F5D0FE;
          background: transparent;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
          letter-spacing: 1px;
          text-shadow: 0 0 16px rgba(168,85,247,0.65), 0 0 30px rgba(34,211,238,0.35);
          cursor: pointer;
        }
        .space-time {
          font-size: clamp(34px, 7vw, 64px);
          font-weight: 900;
          color: #E0F2FE;
          text-shadow: 0 0 14px rgba(56,189,248,0.7), 0 0 28px rgba(99,102,241,0.45);
          letter-spacing: 1px;
          cursor: pointer;
          background: transparent;
          border: none;
        }
        .time-pop {
          animation: time-pop 0.28s ease-out;
        }
        .time-float {
          animation: time-float 2.6s ease-in-out infinite;
        }
        .space-time,
        .ocean-time,
        .arcade-time {
          transition: transform 0.15s ease, filter 0.2s ease;
          background: transparent;
          border: none;
        }
        .space-time:hover,
        .ocean-time:hover,
        .arcade-time:hover {
          transform: scale(1.03);
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.25));
        }
        .arcade-score {
          position: absolute;
          left: 10px;
          bottom: 10px;
          font-size: 10px;
          font-weight: 800;
          color: #FBCFE8;
          background: rgba(17, 24, 39, 0.6);
          padding: 4px 8px;
          border-radius: 8px;
          letter-spacing: 0.6px;
        }
      `}</style>
      <Confetti active={showConfetti} performanceMode={performanceMode} />

      {/* Timer display — swapped by style */}
      {!isImmersive && (
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="text-[11px] font-bold text-gray-400">⏱ TIMER</div>
          <button
            onClick={() => setShowSettings(true)}
            className={`px-2 py-0.5 rounded text-[10px] ${
              blendMode
                ? 'bg-black/5 text-gray-600 hover:bg-black/10'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            ⚙ Options
          </button>
        </div>
      )}
      {isImmersive ? (
        <div className={`space-shell ${isRunning ? 'timer-running' : ''}`}>
          <div className={`space-chip space-chip-left ${isOcean ? 'ocean-chip' : isArcade ? 'arcade-chip' : ''}`}>
            {isOcean ? '🌊 Ocean' : isArcade ? '🕹️ Arcade' : '🪐 Space'}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className={`space-chip space-chip-right ${isOcean ? 'ocean-chip' : isArcade ? 'arcade-chip' : ''}`}
          >
            ⚙ Options
          </button>
          <div className="space-shell-body">
            {isSpace && <SpaceDisplay {...displayProps} />}
            {isOcean && <OceanDisplay {...displayProps} />}
            {isArcade && <ArcadeDisplay {...displayProps} />}
          </div>
          <div className="space-controls">
            {controls}
          </div>
        </div>
      ) : (
        <div className={`timer-shell timer-accent theme-${effectiveStyle} ${isRunning ? 'timer-running' : ''}`}>
          <div className="timer-display">
            {effectiveStyle === 'ring' && <RingDisplay {...displayProps} />}
            {effectiveStyle === 'hourglass' && <HourglassDisplay {...displayProps} />}
            {effectiveStyle === 'ocean' && <OceanDisplay {...displayProps} />}
            {effectiveStyle === 'arcade' && <ArcadeDisplay {...displayProps} />}
            {effectiveStyle === 'classic' && <ClassicDisplay {...displayProps} blendMode={blendMode} />}
          </div>
        </div>
      )}
      {!isImmersive && (
        <div className="pb-1">
          {controls}
        </div>
      )}

      {/* Settings Modal */}
      <TimerSettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        timerStyle={timerStyle}
        setTimerStyle={setTimerStyle}
        totalTime={totalTime}
        setTotalTime={setTotalTime}
        setTimeRemaining={setTimeRemaining}
        isRunning={isRunning}
        autoRepeat={autoRepeat}
        setAutoRepeat={setAutoRepeat}
        rotationSound={rotationSound}
        setRotationSound={setRotationSound}
        customSounds={customSounds}
        setCustomSounds={setCustomSounds}
        soundVolume={soundVolume}
        setSoundVolume={setSoundVolume}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default TimerPanel;
