import React, { useMemo, useState, useEffect, useRef } from 'react';

const DEFAULT_QUESTION = {
  text: "What's your favorite animal?",
  type: 'multi',
  options: ['Cats', 'Dogs', 'Both', 'Not sure'],
  size: 18,
};

const clampOptionsForType = (type, options) => {
  if (type === 'free') return ['Here', 'Absent'];
  if (!Array.isArray(options) || options.length === 0) {
    return type === 'two' ? ['Yes', 'No'] : DEFAULT_QUESTION.options;
  }
  if (type === 'two') return options.slice(0, 2);
  return options.slice(0, 4);
};

const MorningCheckin = ({ students, checkin, onUpdate }) => {
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [showTeacher, setShowTeacher] = useState(false);
  const containerRef = useRef(null);
  const holdTimerRef = useRef(null);
  const holdTriggeredRef = useRef(false);
  const [pendingAbsentId, setPendingAbsentId] = useState(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  const safeCheckin = checkin || { question: DEFAULT_QUESTION, checkedIn: {}, answers: {}, locked: false, showResults: true };
  const question = safeCheckin.question || DEFAULT_QUESTION;
  const optionsByType = question.optionsByType || {};
  const currentOptions = optionsByType[question.type] || question.options || [];
  const options = clampOptionsForType(question.type, currentOptions);
  const questionSize = typeof question.size === 'number' ? question.size : 18;
  const answerGridCols = question.type === 'two' || question.type === 'free' ? 'grid-cols-2' : 'grid-cols-4';
  const answerButtonSize = question.type === 'two' ? 'py-4 text-base' : question.type === 'free' ? 'py-6 text-base' : 'py-2 text-sm';
  const checkedIn = safeCheckin.checkedIn || {};
  const answers = safeCheckin.answers || {};
  const absentIds = safeCheckin.absentIds || {};

  const totalStudents = students.length;
  const checkedCount = students.filter(s => checkedIn[s.id]).length;

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

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
      const score = Math.abs(Math.log(cellAspect)) + (rows * c - count) * 0.2;
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
    return Math.max(48, Math.min(cellW * 0.5, (cellH - 28) * 0.6, 140));
  }, [(students || []).length, cols, size.w, size.h]);

  const nameSize = Math.max(12, Math.min(avatarSize * 0.35, 24));
  const emojiSize = Math.max(20, Math.min(avatarSize * 0.75, 90));
  const initialsSize = Math.max(12, Math.min(avatarSize * 0.35, 28));
  const boxPad = Math.max(18, Math.min(38, avatarSize * 0.48));
  const boxMinWidth = avatarSize + boxPad * 2;
  const boxMinHeight = avatarSize + boxPad * 2 + nameSize + 16;

  const renderAvatar = (student, status, isActive) => {
    const ring = isActive
      ? 'ring-8 ring-blue-500 shadow-lg shadow-blue-500/50'
      : status === 'absent'
        ? 'ring-8 ring-red-500 shadow-lg shadow-red-500/50'
        : status === 'here'
          ? 'ring-8 ring-emerald-500 shadow-lg shadow-emerald-500/50'
          : '';
    if (student.photo) {
      return (
        <img
          src={student.photo}
          alt={student.name}
          className={`rounded-full object-cover border-4 border-gray-300 ${ring}`}
          style={{ width: avatarSize, height: avatarSize }}
        />
      );
    }
    if (student.emoji) {
      return (
        <div
          className={`rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-300 ${ring}`}
          style={{ width: avatarSize, height: avatarSize, fontSize: emojiSize }}
        >
          {student.emoji}
        </div>
      );
    }
    return (
      <div
        className={`rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 border-4 border-blue-300 ${ring}`}
        style={{ width: avatarSize, height: avatarSize, fontSize: initialsSize }}
      >
        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
    );
  };

  const counts = useMemo(() => {
    const next = {};
    options.forEach(opt => { next[opt] = 0; });
    students.forEach(s => {
      const ans = answers[s.id];
      if (absentIds[s.id]) return;
      if (ans && next[ans] !== undefined) next[ans] += 1;
    });
    return next;
  }, [answers, options, students, absentIds]);

  const handleSelectStudent = (studentId) => {
    if (safeCheckin.locked && checkedIn[studentId]) return;
    setActiveStudentId(studentId);
  };

  const applyUpdate = (updater) => {
    if (!onUpdate) return;
    onUpdate(prev => {
      const current = prev || { question: DEFAULT_QUESTION, checkedIn: {}, answers: {}, locked: false, showResults: true };
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...current, ...next };
    });
  };

  const submitAnswer = (option) => {
    if (!activeStudentId) return;
    const isAbsentChoice = question.type === 'free' && option === 'Absent';
    applyUpdate(prev => ({
      ...prev,
      checkedIn: { ...(prev.checkedIn || {}), [activeStudentId]: true },
      absentIds: { ...(prev.absentIds || {}), [activeStudentId]: isAbsentChoice },
      answers: { ...(prev.answers || {}), [activeStudentId]: option },
    }));
    if (isAbsentChoice) setPendingAbsentId(null);
    setActiveStudentId(null);
  };

  const resetCheckin = () => {
    applyUpdate(prev => ({ ...prev, checkedIn: {}, answers: {}, absentIds: {} }));
    setActiveStudentId(null);
  };

  const updateQuestion = (patch) => {
    applyUpdate(prev => {
      const current = { ...DEFAULT_QUESTION, ...(prev.question || {}) };
      const next = { ...current, ...patch };
      return { ...prev, question: next };
    });
  };

  const setOptionsForType = (type, nextOptions) => {
    updateQuestion({
      optionsByType: {
        ...(question.optionsByType || {}),
        [type]: nextOptions,
      },
    });
  };

  return (
    <div ref={containerRef} className="rounded-lg p-2 shadow-md h-full flex flex-col gap-2 relative">
      <div className="flex flex-col gap-1">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Morning Check-In</div>
        <div className="flex items-center gap-2 self-end">
          <div className="text-xs font-bold text-gray-600">{checkedCount} / {totalStudents}</div>
          <button
            onClick={() => setShowTeacher(prev => !prev)}
            className={`text-[10px] px-2 py-0.5 rounded ${showTeacher ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}
          >
            ⚙ Teacher
          </button>
          <button
            onClick={() => applyUpdate(prev => ({ ...prev, locked: !prev.locked }))}
            className={`text-[10px] px-2 py-0.5 rounded ${safeCheckin.locked ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {safeCheckin.locked ? '🔒 Locked' : '🔓 Open'}
          </button>
        </div>
      </div>

      {showTeacher && (
        <div className="rounded-lg border bg-white/80 p-2 text-xs space-y-2">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Question</div>
            <input
              value={question.text || ''}
              onChange={(e) => updateQuestion({ text: e.target.value })}
              className="w-full px-2 py-1 rounded border text-xs"
              placeholder="Question of the Day"
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              { id: 'two', label: '2 Choices' },
              { id: 'multi', label: 'Multi' },
              { id: 'free', label: 'Attendance' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateQuestion({ type: opt.id })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${question.type === opt.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => applyUpdate(prev => ({ ...prev, showResults: !prev.showResults }))}
              className={`ml-auto px-2 py-0.5 rounded text-[10px] ${safeCheckin.showResults ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {safeCheckin.showResults ? '📊 Results' : '🙈 Hidden'}
            </button>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => updateQuestion({ size: Math.max(14, questionSize - 2) })}
                className="w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200"
                title="Smaller text"
              >
                A−
              </button>
              <button
                onClick={() => updateQuestion({ size: Math.min(32, questionSize + 2) })}
                className="w-6 h-6 rounded bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200"
                title="Larger text"
              >
                A+
              </button>
            </div>
          </div>
          {question.type !== 'free' ? (
            <div className="grid grid-cols-2 gap-1">
              {Array.from({ length: question.type === 'two' ? 2 : 4 }, (_, idx) => (
                <input
                  key={`opt-${idx}`}
                  value={options[idx] || ''}
                  onChange={(e) => {
                    const next = [...options];
                    next[idx] = e.target.value;
                    setOptionsForType(question.type, next);
                  }}
                  className="px-2 py-1 rounded border text-xs"
                  placeholder={`Option ${idx + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-gray-400">
              Attendance mode shows Here/Absent buttons.
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button onClick={resetCheckin} className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-600">Reset</button>
            <button
              onClick={() => setShowTeacher(false)}
              className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="rounded-lg border bg-white/70 p-2 min-h-0 flex flex-col flex-[0_0_65%]">
          <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tap your name</div>
          {students.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              Add students in the roster to start check-in.
            </div>
          ) : (
            <div
              className="h-full w-full grid place-items-center"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${Math.ceil(students.length / cols)}, 1fr)`,
              }}
            >
              {students.map(student => {
                const isChecked = !!checkedIn[student.id];
                const isAbsent = !!absentIds[student.id] || pendingAbsentId === student.id;
                const status = isAbsent ? 'absent' : isChecked ? 'here' : 'none';
                const isActive = activeStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    onPointerDown={() => {
                      if (safeCheckin.locked && checkedIn[student.id]) return;
                      holdTriggeredRef.current = false;
                      setPendingAbsentId(null);
                      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
                      holdTimerRef.current = setTimeout(() => {
                        holdTriggeredRef.current = true;
                        setPendingAbsentId(student.id);
                        applyUpdate(prev => ({
                          ...prev,
                          checkedIn: { ...(prev.checkedIn || {}), [student.id]: true },
                          absentIds: { ...(prev.absentIds || {}), [student.id]: true },
                          answers: { ...(prev.answers || {}), [student.id]: '' },
                        }));
                        setActiveStudentId(null);
                      }, 550);
                    }}
                    onPointerUp={() => {
                      if (holdTimerRef.current) {
                        clearTimeout(holdTimerRef.current);
                        holdTimerRef.current = null;
                      }
                      if (holdTriggeredRef.current) {
                        holdTriggeredRef.current = false;
                        setPendingAbsentId(null);
                        return;
                      }
                      handleSelectStudent(student.id);
                    }}
                    onPointerLeave={() => {
                      if (holdTimerRef.current) {
                        clearTimeout(holdTimerRef.current);
                        holdTimerRef.current = null;
                      }
                      holdTriggeredRef.current = false;
                      setPendingAbsentId(null);
                    }}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl hover:bg-gray-100/60 active:bg-gray-200/60 transition-colors cursor-pointer relative"
                    style={{
                      minWidth: boxMinWidth,
                      minHeight: boxMinHeight,
                      padding: boxPad,
                    }}
                  >
                    <div className="relative" style={{ width: avatarSize, height: avatarSize }}>
                      {renderAvatar(student, status, isActive)}
                      {isAbsent ? (
                        <span
                          className="absolute text-sm"
                          style={{ top: 0, right: 0, transform: 'translate(25%, -25%)' }}
                        >
                          🤒
                        </span>
                      ) : isChecked ? (
                        <span
                          className="absolute text-sm"
                          style={{ top: 0, right: 0, transform: 'translate(25%, -25%)' }}
                        >
                          ✅
                        </span>
                      ) : null}
                    </div>
                    <span
                      className="font-semibold text-gray-700 truncate max-w-full leading-tight"
                      style={{ fontSize: nameSize }}
                    >
                      {student.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white/70 p-2 flex flex-col flex-[0_0_35%] min-h-0">
          <div className="text-[11px] font-bold text-gray-600 mb-1 text-center">Question of the Day</div>
          <div className="font-extrabold text-gray-800 mb-2 text-center" style={{ fontSize: questionSize }}>
            {question.text}
          </div>
          <div className="text-[10px] text-gray-500 mb-2">
            {activeStudentId ? `Answering: ${students.find(s => s.id === activeStudentId)?.name || ''}` : 'Select a student to answer'}
          </div>
          <div className={`grid ${answerGridCols} gap-2 flex-1 min-h-0 auto-rows-fr`}>
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => submitAnswer(opt)}
                className={`px-2 rounded-lg border-2 border-blue-200 font-bold bg-white hover:bg-blue-50 h-full ${answerButtonSize}`}
                disabled={!activeStudentId}
              >
                {question.type === 'free' ? (
                  <div className="flex items-center justify-center gap-2">
                    <span style={{ fontSize: 20 }}>{opt === 'Here' ? '✅' : '❌'}</span>
                    <span>{opt}</span>
                  </div>
                ) : (
                  opt
                )}
              </button>
            ))}
          </div>
          {safeCheckin.showResults && (
            <div className="mt-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Live results</div>
              <div className="space-y-1">
                {options.map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <div className="text-[10px] text-gray-500 w-12 truncate">{opt}</div>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-400"
                        style={{ width: `${totalStudents > 0 ? (counts[opt] / totalStudents) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 w-4 text-right">{counts[opt] || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MorningCheckin;
