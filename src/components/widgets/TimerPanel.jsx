import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { ROTATION_SOUNDS, playSound } from '../../constants/sounds';

const TIMER_STYLES = [
  { id: 'ring', icon: '⏱️', label: 'Ring' },
  { id: 'hourglass', icon: '⏳', label: 'Sand' },
  { id: 'emoji', icon: '⭐', label: 'Stars' },
  { id: 'classic', icon: '🔢', label: 'Classic' },
];

/* ── Confetti burst on timer completion ── */
const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const colors = ['#FF8A7A', '#5BC0BE', '#FFD166', '#B39DDB', '#7BC47F', '#FF6B9D', '#45B7D1'];
    const p = Array.from({ length: 28 }, (_, i) => ({
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
    <div className="flex items-center justify-center flex-1 min-h-0">
      <svg viewBox="0 0 140 140" className={pulseClass} style={{ width: '100%', height: '100%', maxWidth: 280, maxHeight: 280 }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={barColor} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
        <text x="70" y="66" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 28, fontFamily: "'Fredoka One', cursive", fill: COLORS.text }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </text>
        <text x="70" y="88" textAnchor="middle" style={{ fontSize: 9, fill: '#9CA3AF' }}>
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
  return (
    <div className={`flex flex-col items-center justify-center flex-1 min-h-0 ${pulseClass}`}>
      <svg viewBox="0 0 80 130" style={{ width: '100%', height: '100%', maxWidth: 220, maxHeight: 260 }}>
        {/* Frame */}
        <rect x="10" y="2" width="60" height="6" rx="2" fill="#8B7355" />
        <rect x="10" y="102" width="60" height="6" rx="2" fill="#8B7355" />
        {/* Glass outline */}
        <path d="M18 8 L18 38 Q18 55 40 55 Q62 55 62 38 L62 8" fill="none" stroke="#C4A882" strokeWidth="2.5" />
        <path d="M18 102 L18 72 Q18 55 40 55 Q62 55 62 72 L62 102" fill="none" stroke="#C4A882" strokeWidth="2.5" />
        {/* Top sand */}
        <clipPath id="topClip"><path d="M19 9 L19 37 Q19 54 40 54 Q61 54 61 37 L61 9 Z" /></clipPath>
        <rect clipPath="url(#topClip)" x="19" y={9 + (1 - sandTop) * 45} width="42" height={sandTop * 45}
          fill={barColor} style={{ transition: 'all 1s linear' }} />
        {/* Bottom sand */}
        <clipPath id="botClip"><path d="M19 101 L19 73 Q19 56 40 56 Q61 56 61 73 L61 101 Z" /></clipPath>
        <rect clipPath="url(#botClip)" x="19" y={101 - sandBottom * 45} width="42" height={sandBottom * 45}
          fill={barColor} style={{ transition: 'all 1s linear' }} />
        {/* Falling stream */}
        {isRunning && progress > 0.01 && (
          <line x1="40" y1="54" x2="40" y2={101 - sandBottom * 45} stroke={barColor} strokeWidth="2" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="0.8s" repeatCount="indefinite" />
          </line>
        )}
        {/* Time text inside SVG */}
        <text x="40" y="123" textAnchor="middle" style={{ fontSize: 16, fontFamily: "'Fredoka One', cursive", fill: COLORS.text }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </text>
      </svg>
    </div>
  );
};

/* ── Emoji progress display ── */
const EmojiDisplay = ({ progress, mins, secs, isRunning }) => {
  const totalStars = 10;
  const litCount = Math.ceil(progress * totalStars);
  const pulseClass = progress < 0.07 && isRunning ? 'animate-pulse' : '';
  return (
    <div className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-0 overflow-hidden ${pulseClass}`}>
      <span style={{ fontSize: 42, fontFamily: "'Fredoka One', cursive", color: COLORS.text, lineHeight: 1 }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <div className="flex gap-1 flex-wrap justify-center" style={{ maxWidth: 240 }}>
        {Array.from({ length: totalStars }, (_, i) => {
          const lit = i < litCount;
          return (
            <span key={i} style={{
              fontSize: 24,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: lit ? 'scale(1)' : 'scale(0.5)',
              opacity: lit ? 1 : 0.2,
              filter: lit ? 'none' : 'grayscale(1)',
            }}>
              ⭐
            </span>
          );
        })}
      </div>
      <span className="text-xs text-gray-400">{isRunning ? 'running' : 'paused'}</span>
    </div>
  );
};

/* ── Classic display (original) ── */
const ClassicDisplay = ({ progress, mins, secs, barColor, isRunning }) => (
  <div className="flex flex-col justify-center flex-1 min-h-0 gap-2">
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 'clamp(48px, 9vw, 80px)', color: COLORS.text, lineHeight: 1, fontFamily: "'Fredoka One', cursive" }}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className={`text-base px-3 py-1.5 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {isRunning ? '●' : '○'}
      </span>
    </div>
    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
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
  } = useAppState();

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  const [showCustom, setShowCustom] = useState(false);
  const [customMins, setCustomMins] = useState(Math.floor(totalTime / 60));
  const [customSecs, setCustomSecs] = useState(totalTime % 60);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const prevTimeRef = useRef(timeRemaining);
  const fileInputRef = useRef(null);
  const soundMenuRef = useRef(null);

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

  // Close sound menu on outside click
  useEffect(() => {
    if (!showSoundMenu) return;
    const handler = (e) => {
      if (soundMenuRef.current && !soundMenuRef.current.contains(e.target)) setShowSoundMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSoundMenu]);

  // Sound helpers
  const allSounds = [...ROTATION_SOUNDS, ...customSounds.map(s => ({ id: s.id, name: `🎵 ${s.name}`, type: 'custom' }))];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = window.prompt('Name for this sound:', file.name.replace(/\.[^.]+$/, ''));
    if (!name) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newSound = { id: `custom-${Date.now()}`, name, dataUrl: ev.target.result };
      setCustomSounds([...customSounds, newSound]);
      setRotationSound(newSound.id);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteSound = (id) => {
    if (!window.confirm('Delete this custom sound?')) return;
    setCustomSounds(customSounds.filter(s => s.id !== id));
    if (rotationSound === id) setRotationSound('none');
  };

  const currentSoundName = allSounds.find(s => s.id === rotationSound)?.name || 'None';

  const displayProps = { progress, mins, secs, barColor, isRunning };

  return (
    <div className="rounded-lg p-3 shadow-md flex flex-col gap-2 h-full relative">
      <Confetti active={showConfetti} />

      {/* Style picker */}
      <div className="flex gap-1 justify-center">
        {TIMER_STYLES.map(s => (
          <button key={s.id} onClick={() => setTimerStyle(s.id)}
            className={`px-1.5 py-0.5 text-xs rounded-full font-medium transition-all ${timerStyle === s.id ? 'bg-purple-500 text-white shadow-sm scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Timer display — swapped by style */}
      {timerStyle === 'ring' && <RingDisplay {...displayProps} />}
      {timerStyle === 'hourglass' && <HourglassDisplay {...displayProps} />}
      {timerStyle === 'emoji' && <EmojiDisplay {...displayProps} />}
      {timerStyle === 'classic' && <ClassicDisplay {...displayProps} />}

      {/* Time presets */}
      {!isRunning && !showCustom && (
        <div className="flex gap-1 justify-center flex-wrap">
          {[5, 10, 15, 20].map(m => (
            <button key={m} onClick={() => { setTotalTime(m * 60); setTimeRemaining(m * 60); }}
              className={`px-2 py-0.5 text-xs rounded font-medium ${Math.floor(totalTime / 60) === m && totalTime % 60 === 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`} disabled={disabled}>{m}m</button>
          ))}
          <button onClick={() => { setCustomMins(Math.floor(totalTime / 60)); setCustomSecs(totalTime % 60); setShowCustom(true); }}
            className="px-2 py-0.5 text-xs rounded font-medium bg-purple-100 text-purple-600" disabled={disabled}>⏱️</button>
        </div>
      )}
      {!isRunning && showCustom && (
        <div className="flex items-center justify-center gap-1">
          <input type="number" min="0" max="120" value={customMins} onChange={(e) => setCustomMins(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-10 px-1 py-0.5 border rounded text-center text-sm" />
          <span className="text-xs">:</span>
          <input type="number" min="0" max="59" value={customSecs} onChange={(e) => setCustomSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-10 px-1 py-0.5 border rounded text-center text-sm" />
          <button onClick={() => { const total = customMins * 60 + customSecs; setTotalTime(total); setTimeRemaining(total); setShowCustom(false); }}
            className="px-2 py-0.5 text-xs rounded bg-teal-500 text-white font-medium">✓</button>
          <button onClick={() => setShowCustom(false)} className="px-2 py-0.5 text-xs rounded bg-gray-200">✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        <button onClick={() => setIsRunning(!isRunning)} className="px-4 py-2 rounded-lg font-bold text-white text-sm"
          style={{ backgroundColor: isRunning ? '#FF8A7A' : '#5BC0BE', opacity: disabled ? 0.5 : 1 }} disabled={disabled}>
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={() => setTimeRemaining(totalTime)} className="px-3 py-2 rounded-lg font-bold bg-gray-200 text-gray-700 text-sm"
          style={{ opacity: disabled ? 0.5 : 1 }} disabled={disabled}>↺</button>
        <button onClick={triggerRotation} className="px-3 py-2 rounded-lg font-bold text-sm"
          style={{ backgroundColor: isAnimating ? '#FEF3C7' : '#E5E7EB', color: isAnimating ? '#D97706' : '#374151', opacity: isEditMode ? 0.5 : 1 }} disabled={disabled}>
          ⏭ Next
        </button>
        <button onClick={() => setAutoRepeat(!autoRepeat)} className={`px-3 py-2 rounded-lg font-bold text-sm ${autoRepeat ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
          style={{ opacity: isEditMode ? 0.5 : 1 }} disabled={isEditMode}>{autoRepeat ? '🔁' : '👆'}</button>
        {/* Sound menu button */}
        <div className="relative" ref={soundMenuRef}>
          <button onClick={() => setShowSoundMenu(!showSoundMenu)}
            className={`px-3 py-2 rounded-lg font-bold text-sm ${showSoundMenu ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
            {rotationSound === 'none' ? '🔇' : '🔊'}
          </button>
          {showSoundMenu && (
            <div className="absolute bottom-full right-0 mb-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50" style={{ width: 240 }}>
              <div className="text-xs font-bold text-gray-500 mb-2">ROTATION SOUND</div>
              {/* Sound list */}
              <div className="max-h-36 overflow-y-auto mb-2 space-y-0.5">
                {allSounds.map(sound => (
                  <div key={sound.id} className="flex items-center gap-1">
                    <button onClick={() => { setRotationSound(sound.id); playSound(sound.id, customSounds, soundVolume); }}
                      className={`flex-1 text-left px-2 py-1 text-xs rounded transition-colors ${rotationSound === sound.id ? 'bg-purple-100 text-purple-700 font-bold' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {sound.name}
                    </button>
                    {sound.type === 'custom' && (
                      <button onClick={() => handleDeleteSound(sound.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                    )}
                  </div>
                ))}
              </div>
              {/* Upload */}
              <input ref={fileInputRef} type="file" accept=".mp3,.wav,.ogg" className="hidden" onChange={handleUpload} />
              <button onClick={() => fileInputRef.current.click()}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded text-gray-600 mb-2">+ Upload Sound</button>
              {/* Volume */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">🔈</span>
                <input type="range" min="0" max="1" step="0.05" value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  onMouseUp={() => playSound(rotationSound, customSounds, soundVolume)}
                  onTouchEnd={() => playSound(rotationSound, customSounds, soundVolume)}
                  className="flex-1 h-1.5 accent-purple-500" />
                <span className="text-xs text-gray-400">🔊</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerPanel;
