import React, { useState, useEffect, useRef, useMemo } from 'react';

const FEELINGS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😰', label: 'Worried' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🤔', label: 'Confused' },
];

const FeelingsCheckin = ({ students }) => {
  const [activeStudent, setActiveStudent] = useState(null);
  const [selections, setSelections] = useState({});
  const popupRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [cooldownActive, setCooldownActive] = useState(false);
  const cooldownTimerRef = useRef(null);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Close popup on outside click
  useEffect(() => {
    if (!activeStudent) return;
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setActiveStudent(null);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeStudent]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const hasSelections = Object.keys(selections).length > 0;

  // Calculate optimal grid columns based on student count and container aspect ratio
  const cols = useMemo(() => {
    const count = (students || []).length;
    if (count === 0) return 1;
    let best = 1;
    let bestScore = Infinity;
    for (let c = 1; c <= count; c++) {
      const rows = Math.ceil(count / c);
      const cellW = size.w / c;
      const cellH = size.h / rows;
      const cellAspect = cellW / cellH;
      const score = Math.abs(Math.log(cellAspect)) + (rows * c - count) * 0.05;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }, [(students || []).length, size.w, size.h]);

  const avatarSize = useMemo(() => {
    const count = (students || []).length;
    if (count === 0) return 80;
    const rows = Math.ceil(count / cols);
    const cellW = size.w / cols;
    const cellH = size.h / rows;
    return Math.max(48, Math.min(cellW * 0.55, (cellH - 28) * 0.6, 160));
  }, [(students || []).length, cols, size.w, size.h]);

  const fontSize = Math.max(14, Math.min(avatarSize * 0.45, 32));
  const emojiSize = Math.max(20, Math.min(avatarSize * 0.75, 100));
  const initialsSize = Math.max(12, Math.min(avatarSize * 0.35, 36));
  const bubbleSize = Math.max(28, avatarSize * 0.5);
  const bubbleEmoji = Math.max(14, bubbleSize * 0.55);

  const pickFeeling = (feeling) => {
    if (!activeStudent) return;
    setSelections((prev) => ({ ...prev, [activeStudent.id]: feeling }));
    setActiveStudent(null);

    // Activate cooldown to prevent accidental double-taps
    setCooldownActive(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setCooldownActive(false);
    }, 400); // 400ms cooldown
  };

  const renderAvatar = (student) => {
    if (student.photo) {
      return (
        <img
          src={student.photo}
          alt={student.name}
          className="rounded-full object-cover border-4 border-gray-300"
          style={{ width: avatarSize, height: avatarSize }}
        />
      );
    }
    if (student.emoji) {
      return (
        <div
          className="rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-300"
          style={{ width: avatarSize, height: avatarSize, fontSize: emojiSize }}
        >
          {student.emoji}
        </div>
      );
    }
    return (
      <div
        className="rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 border-4 border-blue-300"
        style={{ width: avatarSize, height: avatarSize, fontSize: initialsSize }}
      >
        {student.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-full w-full relative overflow-hidden">
      <style>{`
        @keyframes bubble-pop {
          0% { transform: scale(0) translateX(-50%); opacity: 0; }
          50% { transform: scale(1.15) translateX(-50%); }
          100% { transform: scale(1) translateX(-50%); opacity: 1; }
        }
        @keyframes bubble-fade {
          0% { opacity: 1; transform: scale(1) translateX(-50%); }
          100% { opacity: 0; transform: scale(0.7) translateX(-50%) translateY(-8px); }
        }
        .thought-bubble {
          animation: bubble-pop 0.35s ease-out forwards;
        }
        .thought-bubble.fading {
          animation: bubble-fade 0.5s ease-in forwards;
        }
      `}</style>

      {!students || students.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400 text-lg">
          Add students in the roster to use Feelings Check-in
        </div>
      ) : (
        <div
          className="h-full w-full grid place-items-center"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(students.length / cols)}, 1fr)`,
          }}
        >
          {students.map((student) => {
            const sel = selections[student.id];
            return (
              <button
                key={student.id}
                onClick={() => {
                  if (!cooldownActive) setActiveStudent(student);
                }}
                disabled={cooldownActive}
                className="flex flex-col items-center justify-center gap-1 rounded-xl hover:bg-gray-100/60 active:bg-gray-200/60 transition-colors cursor-pointer p-2 relative disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* Thought bubble */}
                {sel && (
                  <div
                    className="thought-bubble absolute flex flex-col items-center cursor-pointer"
                    style={{
                      bottom: '100%',
                      left: '50%',
                      marginBottom: -4,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSelections((prev) => {
                        const updated = { ...prev };
                        delete updated[student.id];
                        return updated;
                      });
                    }}
                  >
                    <div
                      className="bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors"
                      style={{ width: bubbleSize, height: bubbleSize, fontSize: bubbleEmoji }}
                    >
                      {sel.emoji}
                    </div>
                    {/* Tail dots */}
                    <div className="flex flex-col items-center" style={{ marginTop: -2 }}>
                      <div
                        className="rounded-full bg-white border border-gray-200"
                        style={{ width: bubbleSize * 0.22, height: bubbleSize * 0.22 }}
                      />
                      <div
                        className="rounded-full bg-white border border-gray-200"
                        style={{
                          width: bubbleSize * 0.13,
                          height: bubbleSize * 0.13,
                          marginTop: -1,
                        }}
                      />
                    </div>
                  </div>
                )}
                {renderAvatar(student)}
                <span
                  className="font-semibold text-gray-700 truncate max-w-full leading-tight"
                  style={{ fontSize }}
                >
                  {student.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Clear all button */}
      {!activeStudent && (
        <button
          onClick={() => hasSelections && setSelections({})}
          disabled={!hasSelections}
          className={`absolute bottom-3 right-3 z-10 rounded-full px-4 py-2 text-sm font-semibold shadow-md transition-colors ${
            hasSelections
              ? 'bg-white/90 hover:bg-red-50 border border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-600 cursor-pointer'
              : 'bg-white/50 border border-gray-200 text-gray-300 cursor-default'
          }`}
        >
          Clear All
        </button>
      )}

      {/* Feelings popup */}
      {activeStudent && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/25">
          <div
            ref={popupRef}
            className="bg-white rounded-3xl shadow-2xl p-6"
            style={{ maxWidth: Math.min(size.w * 0.95, 1200) }}
          >
            <div
              className="text-center font-bold text-gray-700 mb-4"
              style={{ fontSize: Math.max(18, Math.min(size.w * 0.03, 28)) }}
            >
              How does {activeStudent.name.split(' ')[0]} feel?
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {FEELINGS.map((f) => (
                <button
                  key={f.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    pickFeeling(f);
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all cursor-pointer"
                  style={{
                    padding: Math.max(12, size.w * 0.015),
                    minWidth: Math.max(80, size.w * 0.08),
                  }}
                >
                  <span style={{ fontSize: Math.max(40, Math.min(size.w * 0.06, 64)) }}>
                    {f.emoji}
                  </span>
                  <span
                    className="font-semibold text-gray-600"
                    style={{ fontSize: Math.max(12, Math.min(size.w * 0.016, 18)) }}
                  >
                    {f.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeelingsCheckin;
