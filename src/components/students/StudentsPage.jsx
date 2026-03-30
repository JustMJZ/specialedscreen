import React, { useState, useMemo, Suspense, lazy } from 'react';
import { useAppState } from '../../context/AppStateContext';

const StudentProfileModal = lazy(() => import('../modals/StudentProfileModal'));

function StudentAvatar({ student, size = 44 }) {
  if (student.photo) {
    return (
      <img
        src={student.photo}
        alt={student.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  if (student.emoji) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.48, flexShrink: 0,
      }}>
        {student.emoji}
      </div>
    );
  }
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>
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
      <circle cx={20} cy={20} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
      <circle
        cx={20} cy={20} r={r} fill="none"
        stroke={progress >= 100 ? '#10b981' : '#6366f1'}
        strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
      <text x={20} y={20} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="rgba(148,163,184,0.8)">
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

function last7DaysTotal(history) {
  const total = { earned: 0 };
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    total.earned += (history?.[key] || 0);
  }
  return total.earned;
}

export default function StudentsPage() {
  const {
    globalRoster,
    studentGoals,
    tokenHistory,
    studentNotes,
    setStudentGoals,
    setTokenHistory,
    setStudentNotes,
  } = useAppState();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return globalRoster;
    return globalRoster.filter(s => s.name.toLowerCase().includes(q));
  }, [globalRoster, search]);

  const selectedStudent = useMemo(() => globalRoster.find(s => s.id === selectedId), [globalRoster, selectedId]);
  const selectedGoal = selectedId ? (studentGoals[selectedId] || { tokens: 0, goal: 5, reward: '', active: false }) : null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg,#0f172a 0%,#141428 100%)',
      color: '#e2e8f0',
      fontFamily: 'inherit',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,23,42,0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => window.history.back()}
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(148,163,184,0.8)', cursor: 'pointer', fontSize: 13 }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>Students</div>
          <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 1 }}>{globalRoster.length} student{globalRoster.length !== 1 ? 's' : ''} in roster</div>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '7px 12px', color: '#e2e8f0', fontSize: 13,
            outline: 'none', width: 180,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '20px 24px', maxWidth: 800, margin: '0 auto' }}>
        {globalRoster.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(148,163,184,0.4)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No students in the roster yet</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>Add students via the Roster Manager on the main screen.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(148,163,184,0.4)', fontSize: 14 }}>
            No students match "{search}"
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(student => {
              const goal = studentGoals[student.id];
              const hasGoal = goal?.active;
              const progress = hasGoal ? Math.min((goal.tokens / goal.goal) * 100, 100) : 0;
              const weekTokens = last7DaysTotal(tokenHistory?.[student.id]);
              const notes = studentNotes?.[student.id];

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedId(student.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: '12px 16px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <StudentAvatar student={student} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{student.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 2 }}>
                      {hasGoal
                        ? `${goal.tokens}/${goal.goal} tokens · ${weekTokens} this week`
                        : notes ? 'Has notes' : 'No active goal'}
                    </div>
                  </div>
                  {hasGoal && <MiniRing progress={progress} />}
                  <div style={{ color: 'rgba(148,163,184,0.3)', fontSize: 16, flexShrink: 0 }}>›</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selectedId && selectedStudent && (
        <Suspense fallback={null}>
          <StudentProfileModal
            student={selectedStudent}
            goal={selectedGoal}
            tokenHistory={tokenHistory}
            studentNotes={studentNotes}
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
            onUpdateNotes={(studentId, text) => {
              setStudentNotes(prev => ({ ...prev, [studentId]: text }));
            }}
            onClose={() => setSelectedId(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
