import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useAppState } from '../../context/AppStateContext';

const StudentProfileModal = lazy(() => import('../modals/StudentProfileModal'));

const C = {
  coral:     '#FB7F6E',
  coralLight:'#FFF1EF',
  teal:      '#14B8A6',
  cream:     '#FFFBF7',
  border:    '#FDE8E4',
  text:      '#334155',
  muted:     '#94a3b8',
};

function StudentAvatar({ student, size = 44 }) {
  if (student.photo) return (
    <img src={student.photo} alt={student.name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${C.border}` }} />
  );
  if (student.emoji) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: C.coralLight, border: `2px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.48, flexShrink: 0 }}>
      {student.emoji}
    </div>
  );
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${C.coral}, #f97316)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function MiniRing({ progress }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx={20} cy={20} r={r} fill="none" stroke="#F1F5F9" strokeWidth={4} />
      <circle cx={20} cy={20} r={r} fill="none"
        stroke={progress >= 100 ? C.teal : C.coral}
        strokeWidth={4} strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dasharray 0.4s ease' }} />
      <text x={20} y={20} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill={C.muted}>
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

function last7DaysTotal(history) {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    total += (history?.[key] || 0);
  }
  return total;
}

export default function StudentsPanel({ isOpen, onClose }) {
  const {
    globalRoster,
    studentGoals,
    tokenHistory,
    studentNotes,
    studentGoalLadders,
    studentSchedules,
    setStudentGoals,
    setTokenHistory,
    setStudentNotes,
    setStudentGoalLadders,
    setStudentSchedules,
  } = useAppState();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return globalRoster;
    return globalRoster.filter(s => s.name.toLowerCase().includes(q));
  }, [globalRoster, search]);

  // Roster student IDs are the dataKey (floor plan students store rosterId = roster student id)
  const selectedStudent = useMemo(() => globalRoster.find(s => s.id === selectedId), [globalRoster, selectedId]);
  const selectedGoal = selectedId
    ? (studentGoals[selectedId] || { tokens: 0, goal: 5, reward: '', active: false })
    : null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(51,65,85,0.45)',
          zIndex: 210,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Students panel"
        style={{
          position: 'fixed',
          top: 0, right: 0,
          height: '100vh',
          width: 340,
          zIndex: 211,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.24s cubic-bezier(0.4,0,0.2,1)',
          background: C.cream,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: '-6px 0 40px rgba(51,65,85,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 16px 14px',
          background: `linear-gradient(135deg, ${C.coral} 0%, #f97316 100%)`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: 0.2 }}>Students</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
              {globalRoster.length} in roster
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 14,
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, background: '#fff', flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: C.coralLight,
              border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '7px 12px',
              color: C.text, fontSize: 13, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = C.coral}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', background: C.cream }}>
          {globalRoster.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <div style={{ fontSize: 13 }}>No students in the roster yet.</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Add them via the Roster Manager.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 13 }}>
              No match for "{search}"
            </div>
          ) : (
            filtered.map(student => {
              const goal = studentGoals[student.id];
              const hasGoal = goal?.active;
              const progress = hasGoal ? Math.min((goal.tokens / goal.goal) * 100, 100) : 0;
              const weekTokens = last7DaysTotal(tokenHistory?.[student.id]);

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedId(student.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', textAlign: 'left',
                    background: '#fff',
                    border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '10px 10px',
                    cursor: 'pointer', marginBottom: 6,
                    transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                    boxShadow: '0 1px 4px rgba(251,127,110,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.coralLight; e.currentTarget.style.borderColor = C.coral; e.currentTarget.style.boxShadow = '0 2px 8px rgba(251,127,110,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 4px rgba(251,127,110,0.06)'; }}
                >
                  <StudentAvatar student={student} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {student.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {hasGoal
                        ? `${goal.tokens}/${goal.goal} tokens · ${weekTokens} this week`
                        : 'No active goal'}
                    </div>
                  </div>
                  {hasGoal && <MiniRing progress={progress} />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Profile modal — rendered inside this component so it shares state */}
      {selectedId && selectedStudent && (
        <Suspense fallback={null}>
          <StudentProfileModal
            student={selectedStudent}
            goal={selectedGoal}
            tokenHistory={tokenHistory}
            studentNotes={studentNotes}
            studentGoalLadders={studentGoalLadders}
            studentSchedules={studentSchedules}
            dataKey={selectedId}
            onUpdateSchedule={(key, updated) => {
              setStudentSchedules(prev => ({ ...prev, [key]: updated }));
            }}
            onAddToken={() => {
              const g = studentGoals[selectedId] || { tokens: 0, goal: 5, reward: '', active: true };
              if (g.tokens < g.goal) {
                setStudentGoals(prev => ({ ...prev, [selectedId]: { ...g, tokens: g.tokens + 1 } }));
                setTokenHistory(prev => {
                  const h = prev[selectedId] || {};
                  return { ...prev, [selectedId]: { ...h, [today]: (h[today] || 0) + 1 } };
                });
              }
            }}
            onRemoveToken={() => {
              const g = studentGoals[selectedId] || { tokens: 0, goal: 5, reward: '', active: true };
              if (g.tokens > 0) {
                setStudentGoals(prev => ({ ...prev, [selectedId]: { ...g, tokens: g.tokens - 1 } }));
                setTokenHistory(prev => {
                  const h = prev[selectedId] || {};
                  const cur = h[today] || 0;
                  if (cur <= 0) return prev;
                  return { ...prev, [selectedId]: { ...h, [today]: cur - 1 } };
                });
              }
            }}
            onResetTokens={() => {
              const g = studentGoals[selectedId] || { tokens: 0, goal: 5, reward: '', active: true };
              setStudentGoals(prev => ({ ...prev, [selectedId]: { ...g, tokens: 0 } }));
            }}
            onUpdateNotes={(key, text) => {
              setStudentNotes(prev => ({ ...prev, [key]: text }));
            }}
            onUpdateGoalLadder={(key, updated) => {
              setStudentGoalLadders(prev => ({ ...prev, [key]: updated }));
            }}
            onClose={() => setSelectedId(null)}
          />
        </Suspense>
      )}
    </>
  );
}
