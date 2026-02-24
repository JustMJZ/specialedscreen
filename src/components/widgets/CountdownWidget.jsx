import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useAppState } from '../../context/AppStateContext';

// ── Urgency levels ────────────────────────────────────────────────────────────
const getUrgency = (ms) => {
  if (ms <= 0) return 'arrived';
  if (ms <= 60000) return 'critical';   // < 1 min
  if (ms <= 5 * 60000) return 'hot';    // 1–5 min
  if (ms <= 15 * 60000) return 'warm';  // 5–15 min
  return 'chill';
};

// ── Event themes ──────────────────────────────────────────────────────────────
const THEMES = {
  lunch:     { emoji: '🍕', parts: ['🍕','🌮','🍔','🍟','🥪'], grad: ['#f97316','#ef4444'] },
  recess:    { emoji: '🏃', parts: ['⚽','🏀','🎾','🏈','🎯'], grad: ['#10b981','#3b82f6'] },
  home:      { emoji: '🏠', parts: ['🏠','⭐','🌟','💫','✨'], grad: ['#8b5cf6','#6366f1'] },
  bus:       { emoji: '🚌', parts: ['🚌','🎒','⭐','🌈','🎉'], grad: ['#f59e0b','#f97316'] },
  snack:     { emoji: '🍪', parts: ['🍪','🍩','🍎','🍌','🍇'], grad: ['#f59e0b','#84cc16'] },
  art:       { emoji: '🎨', parts: ['🎨','🌈','💜','💙','⭐'], grad: ['#ec4899','#8b5cf6'] },
  music:     { emoji: '🎵', parts: ['🎵','🎶','🎸','🎹','🥁'], grad: ['#06b6d4','#8b5cf6'] },
  pe:        { emoji: '⚽', parts: ['⚽','🏃','💪','🏅','⭐'], grad: ['#10b981','#84cc16'] },
  gym:       { emoji: '💪', parts: ['💪','⚽','🏃','🏅','⭐'], grad: ['#10b981','#84cc16'] },
  library:   { emoji: '📚', parts: ['📚','📖','💡','⭐','🌟'], grad: ['#6366f1','#8b5cf6'] },
  science:   { emoji: '🔬', parts: ['🔬','⚗️','🧪','💡','⭐'], grad: ['#06b6d4','#10b981'] },
  party:     { emoji: '🎉', parts: ['🎉','🎊','🎈','⭐','🌟'], grad: ['#ec4899','#f59e0b'] },
  assembly:  { emoji: '🎤', parts: ['🎤','⭐','🌟','🎵','👏'], grad: ['#f59e0b','#ef4444'] },
  dismissal: { emoji: '👋', parts: ['👋','🏠','⭐','🌟','🎉'], grad: ['#8b5cf6','#6366f1'] },
  breakfast: { emoji: '🥞', parts: ['🥞','🥓','🍳','☕','🍊'], grad: ['#f59e0b','#f97316'] },
  default:   { emoji: '⏰', parts: ['⭐','🌟','💫','✨','⚡'], grad: ['#6366f1','#8b5cf6'] },
};

const getTheme = (event) => {
  const lower = (event || '').toLowerCase();
  const key = Object.keys(THEMES).find((k) => k !== 'default' && lower.includes(k));
  return THEMES[key] || THEMES.default;
};

// ── Floating particle ─────────────────────────────────────────────────────────
const Particle = ({ emoji, fast }) => {
  const s = useMemo(() => ({
    left: `${4 + Math.random() * 92}%`,
    fontSize: `${fast ? 14 + Math.random() * 14 : 10 + Math.random() * 10}px`,
    animationDuration: `${fast ? 0.8 + Math.random() * 0.8 : 2.5 + Math.random() * 2.5}s`,
    animationDelay: `${Math.random() * 3}s`,
  }), []);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: '-24px',
        left: s.left,
        fontSize: s.fontSize,
        animation: `cdw-float ${s.animationDuration} ${s.animationDelay} ease-in infinite`,
      }}
    >
      {emoji}
    </div>
  );
};

// ── SVG progress ring ─────────────────────────────────────────────────────────
const Ring = ({ progress, urgency, size = 110 }) => {
  const stroke = Math.max(6, size * (urgency === 'critical' ? 0.09 : 0.07));
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, progress));
  const glow = urgency === 'critical' ? 16 : urgency === 'hot' ? 10 : 5;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="white"
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 ${glow}px rgba(255,255,255,0.9))`,
          transition: 'stroke-dashoffset 1s linear',
        }}
      />
    </svg>
  );
};

// ── Arrived explosion overlay ─────────────────────────────────────────────────
const ArrivedOverlay = ({ event, emoji, onDone }) => {
  const pieces = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    e: ['🎉','🎊','⭐','🌟','✨','💥','🏆','👏'][i % 8],
    left: `${(i / 10) * 90 + 5}%`,
    delay: `${i * 0.06}s`,
    dur: `${1.2 + (i % 3) * 0.2}s`,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center">
      <style>{`
        @keyframes cdw-fall { 0%{transform:translateY(-80px) rotate(0deg);opacity:1} 100%{transform:translateY(105vh) rotate(180deg);opacity:0} }
        @keyframes cdw-arrived { 0%{transform:scale(0.3);opacity:0} 20%{transform:scale(1.2);opacity:1} 80%{transform:scale(1);opacity:1} 100%{transform:scale(1.05);opacity:0} }
      `}</style>
      {pieces.map((p) => (
        <div key={p.id} className="fixed text-3xl" style={{ left: p.left, top: '-60px', animation: `cdw-fall ${p.dur} ${p.delay} ease-in forwards` }}>{p.e}</div>
      ))}
      <div className="text-center px-8 py-6 rounded-3xl" style={{
        background: 'linear-gradient(135deg,#f59e0b,#ec4899,#6366f1)',
        animation: 'cdw-arrived 4s ease forwards',
        boxShadow: '0 0 60px rgba(245,158,11,0.6)',
      }}>
        <div style={{ fontSize: 64 }}>{emoji}</div>
        <div className="font-black text-white mt-1" style={{ fontSize: 'clamp(28px,5vw,52px)', fontFamily:"'Baloo 2',cursive", textShadow:'0 2px 12px rgba(0,0,0,0.3)' }}>
          IT'S {(event || 'TIME').toUpperCase()}!
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main widget ───────────────────────────────────────────────────────────────
const CountdownWidget = ({ event, targetTime, onEdit }) => {
  const { isWidgetLocked } = useAppState();
  const [diff, setDiff] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newEvent, setNewEvent] = useState(event);
  const [newTime, setNewTime] = useState(targetTime);
  const [showArrived, setShowArrived] = useState(false);
  const arrivedFiredRef = useRef(false);
  const prevDiffRef = useRef(null);

  // Container sizing
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 200, h: 150 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const [h, m] = (targetTime || '12:00').split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const d = target - now;
      setDiff(d);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetTime]);

  // Reset arrived gate whenever targetTime changes (new countdown = new arrival)
  useEffect(() => {
    arrivedFiredRef.current = false;
  }, [targetTime]);

  // Fire arrived explosion only when diff crosses the threshold going DOWN
  useEffect(() => {
    if (diff === null) return;
    const prev = prevDiffRef.current;
    if (prev !== null && prev > 2000 && diff <= 2000 && diff > 0 && !arrivedFiredRef.current) {
      arrivedFiredRef.current = true;
      setShowArrived(true);
    }
    prevDiffRef.current = diff;
  }, [diff]);

  if (diff === null) return null;

  const urgency = getUrgency(diff);
  const theme = getTheme(event);

  const totalSecs = Math.floor(diff / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');

  let timeDisplay, subLabel;
  if (urgency === 'arrived') {
    timeDisplay = "NOW!";
    subLabel = `It's ${event}!`;
  } else if (urgency === 'critical') {
    timeDisplay = `${s}s`;
    subLabel = '🔥 RIGHT NOW!!';
  } else if (h > 0) {
    timeDisplay = `${h}:${pad(m)}:${pad(s)}`;
    subLabel = h === 1 ? '1 hour away' : `${h} hours away`;
  } else {
    timeDisplay = `${m}:${pad(s)}`;
    subLabel = m >= 15 ? 'coming up' : m >= 5 ? 'almost time!' : 'get ready!!';
  }

  // Progress fills as event approaches (0 = far, 1 = now)
  const maxMs = 8 * 60 * 60 * 1000;
  const progress = Math.max(0, Math.min(1, 1 - diff / maxMs));

  // Gradient shifts with urgency
  const gradMap = {
    chill:    theme.grad,
    warm:     ['#f97316', '#f59e0b'],
    hot:      ['#ef4444', '#f97316'],
    critical: ['#dc2626', '#ef4444'],
    arrived:  ['#f59e0b', '#ec4899'],
  };
  const [c1, c2] = gradMap[urgency] || theme.grad;

  // Animation class based on urgency
  const wrapAnim =
    urgency === 'critical' ? 'cdw-shake' :
    urgency === 'hot' ? 'cdw-throb' :
    urgency === 'warm' ? 'cdw-breathe' : 'none';

  const particleCount = urgency === 'critical' ? 12 : urgency === 'hot' ? 8 : 5;

  const editTheme = getTheme(newEvent);
  const [ec1, ec2] = editTheme.grad;

  const QUICK_PICKS = [
    'Lunch','Recess','Snack','Home','Bus','Art','Music','PE','Library','Science','Breakfast','Dismissal',
  ];

  // Container-relative font/ring sizing
  const unit = Math.min(size.w, size.h);
  const ringSize = Math.max(64, Math.min(unit * 0.72, 260));
  const emojiFz = Math.max(12, ringSize * 0.18);
  const labelFz = Math.max(9,  ringSize * 0.12);
  const timeFz  = urgency === 'critical' ? Math.max(20, ringSize * 0.42)
                : h > 0                  ? Math.max(13, ringSize * 0.20)
                :                          Math.max(16, ringSize * 0.34);
  const subFz   = Math.max(7,  ringSize * 0.10);

  return (
    <>
      {showArrived && (
        <ArrivedOverlay event={event} emoji={theme.emoji} onDone={() => setShowArrived(false)} />
      )}

      {editing && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setEditing(false)} />
          <div
            className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: `linear-gradient(145deg,${ec1},${ec2})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.2) 0%,transparent 65%)',
            }} />
            <div className="relative p-6 flex flex-col gap-5">
              <div className="flex flex-col items-center gap-1">
                <div style={{ fontSize: 52, lineHeight: 1 }}>{editTheme.emoji}</div>
                <div className="font-black text-white uppercase tracking-widest text-center"
                  style={{ fontSize: 'clamp(16px,4vw,22px)', fontFamily:"'Baloo 2',cursive", minHeight: '1.4em' }}>
                  {newEvent || "What's next?"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/70 text-xs font-bold uppercase tracking-widest px-1">Event Name</label>
                <input
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                  placeholder="e.g. Lunch, Recess, Home..."
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none bg-white/20 text-white placeholder-white/50 border-2 border-white/20 focus:border-white/60 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/70 text-xs font-bold uppercase tracking-widest px-1">Quick Pick</label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PICKS.map((q) => (
                    <button key={q} onClick={() => setNewEvent(q)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all border-2"
                      style={{
                        background: newEvent === q ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
                        borderColor: newEvent === q ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                        color: 'white',
                      }}>
                      {getTheme(q).emoji} {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/70 text-xs font-bold uppercase tracking-widest px-1">Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none bg-white/20 text-white border-2 border-white/20 focus:border-white/60 transition-all"
                  style={{ colorScheme: 'dark' }} />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white/80 transition-all border-2 border-white/20 hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={() => { onEdit(newEvent, newTime); setEditing(false); }}
                  className="flex-[2] py-3 rounded-2xl text-sm font-black text-white transition-all border-2 border-white/40 hover:border-white/80"
                  style={{ background: 'rgba(255,255,255,0.75)' }}>
                  Save Countdown ✓
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div
        ref={containerRef}
        onClick={() => !isWidgetLocked && setEditing(true)}
        className={`rounded-2xl h-full flex flex-col items-center justify-center relative overflow-hidden select-none ${!isWidgetLocked ? 'cursor-pointer' : 'cursor-default'}`}
        style={{ background: `linear-gradient(135deg,${c1},${c2})` }}
      >
        <style>{`
          @keyframes cdw-float  { 0%{transform:translateY(0) scale(1);opacity:.9} 100%{transform:translateY(-120px) scale(0.4);opacity:0} }
          @keyframes cdw-breathe{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
          @keyframes cdw-throb  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
          @keyframes cdw-shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
          @keyframes cdw-flash  { 0%,100%{opacity:1} 50%{opacity:0.55} }
        `}</style>

        {/* Floating particles */}
        {Array.from({ length: particleCount }, (_, i) => (
          <Particle
            key={i}
            emoji={theme.parts[i % theme.parts.length]}
            fast={urgency === 'critical' || urgency === 'hot'}
          />
        ))}

        {/* Soft radial glow overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.18) 0%, transparent 70%)',
        }} />

        {/* Content */}
        <div
          className="relative flex flex-col items-center justify-center gap-1 w-full px-2"
          style={{ animation: wrapAnim !== 'none' ? `${wrapAnim} ${urgency === 'critical' ? '0.35s' : urgency === 'hot' ? '0.8s' : '2s'} ease-in-out infinite` : 'none' }}
        >
          {/* Event name */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: emojiFz }}>{theme.emoji}</span>
            <span className="font-black text-white uppercase tracking-wider drop-shadow"
              style={{ fontSize: labelFz, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
              {event || 'Event'}
            </span>
            <span style={{ fontSize: emojiFz }}>{theme.emoji}</span>
          </div>

          {/* Ring + time */}
          <div className="relative flex items-center justify-center" style={{ width: ringSize, height: ringSize }}>
            <Ring progress={progress} urgency={urgency} size={ringSize} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-black text-white leading-none drop-shadow-lg"
                style={{
                  fontSize: timeFz,
                  fontFamily: "'Baloo 2', cursive",
                  textShadow: '0 2px 10px rgba(0,0,0,0.25)',
                  animation: urgency === 'critical' ? 'cdw-flash 1.4s infinite' : 'none',
                }}
              >
                {timeDisplay}
              </span>
            </div>
          </div>

          {/* Sub label */}
          <div
            className="font-bold text-white/90 uppercase tracking-widest"
            style={{
              fontSize: subFz,
              textShadow: '0 1px 4px rgba(0,0,0,0.2)',
              animation: urgency === 'critical' ? 'cdw-flash 1.2s infinite' : 'none',
            }}
          >
            {subLabel}
          </div>
        </div>

        {/* Edit hint */}
        {!isWidgetLocked && (
          <div className="absolute bottom-1.5 right-2.5 text-white/40 font-medium" style={{ fontSize: Math.max(7, Math.min(10, unit * 0.05)) }}>tap to edit</div>
        )}
      </div>
    </>
  );
};

export default CountdownWidget;
