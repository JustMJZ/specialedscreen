import React, { useState, useMemo } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

// App palette
const C = {
  coral:    '#FB7F6E',
  coralLight: '#FFF1EF',
  teal:     '#14B8A6',
  tealLight: '#F0FDFB',
  cream:    '#FFFBF7',
  border:   '#FDE8E4',
  text:     '#334155',
  muted:    '#94a3b8',
  card:     '#FFFFFF',
};

const STEP_COLORS = ['#FB7F6E','#f97316','#eab308','#22c55e','#14B8A6','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#3b82f6'];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri'];
const SERVICE_COLORS = ['#FB7F6E','#14B8A6','#8b5cf6','#f97316','#22c55e','#3b82f6','#ec4899','#f59e0b'];
const SERVICE_PRESETS = ['Speech Therapy','Occupational Therapy','Physical Therapy','Resource Room','Counseling','Reading Support','Math Support'];

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function ServiceForm({ form, setForm, onSave, onCancel, isNew }) {
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const toggleDay = (day) => setForm(f => ({
    ...f, days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
  }));
  const canSave = form.service.trim().length > 0;
  return (
    <div style={{ background: '#fff', border: `2px solid ${form.color || C.coral}55`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {isNew ? 'New Service' : 'Edit Service'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>Service *</label>
          <input value={form.service} onChange={e => set('service', e.target.value)}
            placeholder="e.g. Speech Therapy" list="svc-presets"
            style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', color: C.text, fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = C.coral}
            onBlur={e => e.target.style.borderColor = C.border} />
          <datalist id="svc-presets">{SERVICE_PRESETS.map(s => <option key={s} value={s} />)}</datalist>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 6 }}>Days</label>
          <div style={{ display: 'flex', gap: 5 }}>
            {WEEK_DAYS.map(day => {
              const active = form.days.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)} type="button" style={{
                  flex: 1, padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: active ? (form.color || C.coral) : '#F8FAFC',
                  color: active ? '#fff' : C.muted,
                  border: `1px solid ${active ? (form.color || C.coral) : C.border}`,
                  transition: 'all 0.15s',
                }}>{day}</button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>Start Time</label>
            <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>End Time</label>
            <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>Provider</label>
            <input value={form.provider} onChange={e => set('provider', e.target.value)} placeholder="Ms. Johnson"
              style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, fontSize: 13, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Room 12"
              style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 6 }}>Color</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {SERVICE_COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)} type="button" style={{
                width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer', flexShrink: 0,
                border: `3px solid ${form.color === c ? '#334155' : 'transparent'}`,
                transition: 'border 0.15s',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
          <button onClick={onCancel} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.muted, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button onClick={onSave} disabled={!canSave} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: canSave ? C.coral : '#F1F5F9',
            color: canSave ? '#fff' : '#CBD5E1',
            fontSize: 12, fontWeight: 700, cursor: canSave ? 'pointer' : 'not-allowed',
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function makeEmptyForm() {
  return { service: '', provider: '', location: '', days: [], startTime: '09:00', endTime: '09:30', color: SERVICE_COLORS[0] };
}

function ScheduleTab({ schedule, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(makeEmptyForm);
  const entries = schedule || [];

  const startAdd = () => { setForm(makeEmptyForm()); setEditing('new'); };
  const startEdit = (entry) => { setForm({ ...entry }); setEditing(entry.id); };
  const cancel = () => setEditing(null);
  const save = () => {
    if (!form.service.trim()) return;
    if (editing === 'new') {
      onUpdate([...entries, { ...form, id: `svc-${Date.now()}` }]);
    } else {
      onUpdate(entries.map(e => e.id === editing ? { ...form } : e));
    }
    setEditing(null);
  };
  const remove = (id) => onUpdate(entries.filter(e => e.id !== id));

  // Weekly overview: which services fall on each day
  const dayMap = Object.fromEntries(WEEK_DAYS.map(d => [d, []]));
  entries.forEach(e => (e.days || []).forEach(d => { if (dayMap[d]) dayMap[d].push(e); }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Weekly overview strip */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Weekly Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {WEEK_DAYS.map(day => {
            const dayEntries = dayMap[day];
            return (
              <div key={day} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: dayEntries.length > 0 ? C.text : C.muted, marginBottom: 5, textTransform: 'uppercase' }}>{day}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 12 }}>
                  {dayEntries.length === 0
                    ? <div style={{ height: 5, borderRadius: 4, background: '#F1F5F9' }} />
                    : dayEntries.map(e => (
                        <div key={e.id} style={{ height: 5, borderRadius: 4, background: e.color || C.coral }} title={e.service} />
                      ))}
                </div>
              </div>
            );
          })}
        </div>
        {entries.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {entries.map(e => (
              <span key={e.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: `${e.color || C.coral}18`, color: e.color || C.coral, border: `1px solid ${e.color || C.coral}33` }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: e.color || C.coral, flexShrink: 0 }} />
                {e.service}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Service entries */}
      {entries.length === 0 && editing !== 'new' && (
        <div style={{ textAlign: 'center', padding: '24px 16px', color: C.muted, fontSize: 13 }}>
          No services scheduled yet.
          <span style={{ display: 'block', fontSize: 11, marginTop: 4 }}>Add speech, OT, PT, and other pull-out services.</span>
        </div>
      )}

      {entries.map(entry => (
        editing === entry.id ? (
          <ServiceForm key={entry.id} form={form} setForm={setForm} onSave={save} onCancel={cancel} />
        ) : (
          <div key={entry.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: entry.color || C.coral, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{entry.service}</div>
                  {(entry.provider || entry.location) && (
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {[entry.provider, entry.location].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => startEdit(entry)} style={{ background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: C.muted }}>Edit</button>
                  <button onClick={() => remove(entry.id)} style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#DC2626' }}>✕</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {WEEK_DAYS.map(d => {
                    const active = entry.days?.includes(d);
                    return (
                      <span key={d} style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: active ? `${entry.color || C.coral}20` : '#F1F5F9',
                        color: active ? (entry.color || C.coral) : '#CBD5E1',
                        border: `1px solid ${active ? `${entry.color || C.coral}44` : '#E2E8F0'}`,
                      }}>{d}</span>
                    );
                  })}
                </div>
                {(entry.startTime || entry.endTime) && (
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {formatTime(entry.startTime)}{entry.endTime ? ` – ${formatTime(entry.endTime)}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      ))}

      {editing === 'new' && (
        <ServiceForm form={form} setForm={setForm} onSave={save} onCancel={cancel} isNew />
      )}

      {editing === null && (
        <button onClick={startAdd} style={{
          width: '100%', padding: '10px', borderRadius: 10,
          border: `2px dashed ${C.border}`, background: 'transparent',
          color: C.coral, fontSize: 13, fontWeight: 700, cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.coral}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >+ Add Service</button>
      )}
    </div>
  );
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function StudentAvatar({ student, size = 64 }) {
  if (student.photo) return (
    <img src={student.photo} alt={student.name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.border}` }} />
  );
  if (student.emoji) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: C.coralLight, border: `3px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>
      {student.emoji}
    </div>
  );
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${C.coral}, #f97316)`, border: `3px solid rgba(255,255,255,0.4)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 800, color: '#fff' }}>
      {initials}
    </div>
  );
}

/* ── Goal Ladder Tab ──────────────────────────────────────────────────────── */
const DEFAULT_LADDER = { title: 'Goal Ladder', steps: Array.from({ length: 5 }, () => ''), completedCount: 0 };

function GoalLadderTab({ ladder, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const steps = ladder.steps.length > 0 ? ladder.steps : Array.from({ length: 5 }, () => '');
  const total = steps.length;
  const completed = Math.min(ladder.completedCount, total);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { id: 'done',  label: 'Completed', value: completed,               color: C.teal },
    { id: 'left',  label: 'Remaining', value: Math.max(0, total - completed), color: '#F1F5F9' },
  ];

  const handleStepClick = (i) => {
    const stepNum = total - i;
    const next = completed === stepNum ? stepNum - 1 : stepNum;
    onUpdate({ ...ladder, completedCount: Math.max(0, next) });
  };
  const handleLabelChange = (i, val) => { const s = [...steps]; s[i] = val; onUpdate({ ...ladder, steps: s }); };
  const handleAddStep    = () => { if (steps.length >= 10) return; onUpdate({ ...ladder, steps: [...steps, ''] }); };
  const handleRemoveStep = () => { if (steps.length <= 1) return; onUpdate({ ...ladder, steps: steps.slice(0,-1), completedCount: Math.min(completed, steps.length-1) }); };
  const handleReset      = () => onUpdate({ ...ladder, completedCount: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Ring + header */}
      <div style={{ background: C.tealLight, border: `1px solid #CCFBF1`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 96, height: 96, flexShrink: 0 }}>
          <ResponsivePie data={pieData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
            innerRadius={0.65} padAngle={2} cornerRadius={4}
            colors={d => d.data.color} enableArcLabels={false} enableArcLinkLabels={false} tooltip={() => null} />
        </div>
        <div style={{ flex: 1 }}>
          {isEditing
            ? <input value={ladder.title} onChange={e => onUpdate({ ...ladder, title: e.target.value })}
                style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', color: C.text, fontSize: 13, fontWeight: 700, width: '100%', boxSizing: 'border-box', outline: 'none', marginBottom: 6 }} />
            : <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 4 }}>{ladder.title || 'Goal Ladder'}</div>}
          <div style={{ fontSize: 28, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{completed} of {total} steps completed</div>
        </div>
        <button onClick={() => setIsEditing(p => !p)}
          style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', color: C.muted, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}>
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Steps */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.map((label, i) => {
            const isComplete = i >= total - completed;
            const color = STEP_COLORS[i % STEP_COLORS.length];
            const stepNum = total - i;
            const displayLabel = label?.trim() || `Step ${stepNum}`;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => handleStepClick(i)} style={{
                  width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: isComplete ? color : '#F1F5F9', color: isComplete ? '#fff' : C.muted,
                  fontSize: 11, fontWeight: 800, transition: 'all 0.2s', transform: isComplete ? 'scale(1.05)' : 'scale(1)',
                }}>{stepNum}</button>
                {isEditing
                  ? <input value={label} onChange={e => handleLabelChange(i, e.target.value)} placeholder={`Step ${stepNum}`}
                      style={{ flex: 1, background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px', color: C.text, fontSize: 12, outline: 'none' }} />
                  : <div style={{ flex: 1, borderRadius: 6, padding: '5px 10px', background: isComplete ? `${color}18` : '#F8FAFC', borderLeft: `3px solid ${isComplete ? color : '#E2E8F0'}`, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 12, color: isComplete ? C.text : C.muted, fontWeight: isComplete ? 600 : 400 }}>{displayLabel}</span>
                    </div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center' }}>
          {[
            { label: '+ Step', action: handleAddStep,    disabled: steps.length >= 10 },
            { label: '− Step', action: handleRemoveStep, disabled: steps.length <= 1 },
            { label: 'Reset',  action: handleReset,      disabled: completed === 0 },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} disabled={btn.disabled} style={{
              background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6,
              padding: '5px 12px', fontSize: 11, cursor: btn.disabled ? 'not-allowed' : 'pointer',
              color: btn.disabled ? '#CBD5E1' : C.muted, transition: 'all 0.15s',
            }}>{btn.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Modal ───────────────────────────────────────────────────────────── */
const StudentProfileModal = ({
  student, goal, tokenHistory, studentNotes, studentGoalLadders, studentSchedules, dataKey,
  onAddToken, onRemoveToken, onResetTokens, onUpdateNotes, onUpdateGoalLadder, onUpdateSchedule, onClose,
}) => {
  const [tab, setTab] = useState('tokens');

  const key      = dataKey || student?.id;
  const history  = tokenHistory?.[key] || {};
  const notes    = studentNotes?.[key] || '';
  const ladder   = studentGoalLadders?.[key] || DEFAULT_LADDER;
  const schedule = studentSchedules?.[key] || [];

  const chartData = useMemo(() => last7Days().map(dateStr => ({
    day: DAYS[new Date(dateStr + 'T12:00:00').getDay()],
    tokens: history[dateStr] || 0,
    dateStr,
  })), [history]);

  const weekTotal = useMemo(() => chartData.reduce((s, d) => s + d.tokens, 0), [chartData]);

  const pieData = useMemo(() => {
    if (!goal?.active) return [];
    const earned    = Math.min(goal.tokens, goal.goal);
    const remaining = Math.max(0, goal.goal - earned);
    return [
      { id: 'earned',    label: 'Earned',    value: earned,    color: C.teal },
      { id: 'remaining', label: 'Remaining', value: remaining, color: '#F1F5F9' },
    ];
  }, [goal]);

  if (!student) return null;
  const isComplete = goal?.active && goal.tokens >= goal.goal;
  const progress   = goal?.active ? Math.min((goal.tokens / goal.goal) * 100, 100) : 0;

  const TABS = [
    { id: 'tokens',   label: 'Token Board' },
    { id: 'goals',    label: 'Goals' },
    { id: 'overview', label: 'Overview' },
    { id: 'schedule', label: 'Schedule' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(51,65,85,0.4)', backdropFilter: 'blur(4px)' }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', width: 520, maxWidth: '95vw', maxHeight: '90vh',
        background: C.cream, borderRadius: 20,
        boxShadow: '0 20px 60px rgba(251,127,110,0.15), 0 4px 20px rgba(0,0,0,0.08)',
        border: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.coral}, #f97316)`,
          padding: '18px 20px 16px',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        }}>
          <StudentAvatar student={student} size={54} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{student.name}</div>
            {goal?.active && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                {goal.tokens} / {goal.goal} tokens · {weekTotal} earned this week
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fff', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '11px 0', background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${C.coral}` : '2px solid transparent',
              color: tab === t.id ? C.coral : C.muted,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 20px' }}>

          {/* ── TOKEN BOARD ── */}
          {tab === 'tokens' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {goal?.active ? (<>
                {/* Current goal card */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Goal</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{goal.tokens} / {goal.goal}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, borderRadius: 6, background: '#F1F5F9', overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ height: '100%', borderRadius: 6, width: `${progress}%`, background: isComplete ? C.teal : C.coral, transition: 'width 0.4s ease' }} />
                  </div>
                  {/* Token circles */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
                    {Array.from({ length: goal.goal }).map((_, i) => (
                      <div key={i} style={{
                        width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                        background: i < goal.tokens ? C.coralLight : '#F8FAFC',
                        border: `2px solid ${i < goal.tokens ? C.coral : '#E2E8F0'}`,
                        transition: 'all 0.2s',
                      }}>{i < goal.tokens ? (goal.tokenEmoji || '⭐') : <span style={{ color: '#CBD5E1', fontSize: 10 }}>○</span>}</div>
                    ))}
                  </div>
                  {goal.reward && (
                    <div style={{ textAlign: 'center', fontSize: 12, color: C.muted, marginBottom: 12 }}>
                      Reward: <span style={{ color: C.coral, fontWeight: 600 }}>{goal.reward}</span>
                    </div>
                  )}
                  {isComplete && <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 12 }}>🎉 Goal Reached!</div>}
                  {/* Controls */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button onClick={onRemoveToken} disabled={goal.tokens === 0} style={{
                      padding: '8px 18px', borderRadius: 8, border: `1px solid ${goal.tokens === 0 ? '#E2E8F0' : '#FCA5A5'}`,
                      cursor: goal.tokens === 0 ? 'not-allowed' : 'pointer',
                      background: goal.tokens === 0 ? '#F8FAFC' : '#FEF2F2',
                      color: goal.tokens === 0 ? '#CBD5E1' : '#DC2626', fontSize: 13, fontWeight: 700,
                    }}>− Remove</button>
                    {isComplete
                      ? <button onClick={onResetTokens} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #FDE68A', cursor: 'pointer', background: '#FFFBEB', color: '#D97706', fontSize: 13, fontWeight: 700 }}>↺ Reset</button>
                      : <button onClick={onAddToken} disabled={goal.tokens >= goal.goal} style={{
                          padding: '8px 18px', borderRadius: 8, border: `1px solid ${goal.tokens >= goal.goal ? '#E2E8F0' : '#6EE7B7'}`,
                          cursor: goal.tokens >= goal.goal ? 'not-allowed' : 'pointer',
                          background: goal.tokens >= goal.goal ? '#F8FAFC' : '#F0FDFB',
                          color: goal.tokens >= goal.goal ? '#CBD5E1' : C.teal, fontSize: 13, fontWeight: 700,
                        }}>+ Add Token</button>}
                  </div>
                </div>

                {/* History chart */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Tokens Earned — Past 7 Days
                  </div>
                  <div style={{ height: 140 }}>
                    <ResponsiveBar
                      data={chartData} keys={['tokens']} indexBy="day"
                      margin={{ top: 8, right: 8, bottom: 28, left: 28 }}
                      padding={0.35} colors={[C.coral]} borderRadius={4}
                      axisBottom={{ tickSize: 0, tickPadding: 6 }}
                      axisLeft={{ tickSize: 0, tickPadding: 6, tickValues: 4 }}
                      gridYValues={4} enableLabel={false}
                      theme={{
                        axis: { ticks: { text: { fill: C.muted, fontSize: 10 } } },
                        grid: { line: { stroke: '#F1F5F9' } },
                      }}
                      tooltip={({ data, value }) => (
                        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.text, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <strong>{data.day}</strong>: {value} token{value !== 1 ? 's' : ''}
                        </div>
                      )}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>This week total</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.coral }}>{weekTotal} tokens</span>
                  </div>
                </div>
              </>) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 13 }}>
                  No active goal set for this student.<br />
                  <span style={{ fontSize: 11, marginTop: 6, display: 'block' }}>Set one up in the Roster Manager.</span>
                </div>
              )}
            </div>
          )}

          {/* ── GOALS TAB ── */}
          {tab === 'goals' && (
            <GoalLadderTab ladder={ladder} onUpdate={(updated) => onUpdateGoalLadder(key, updated)} />
          )}

          {/* ── SCHEDULE ── */}
          {tab === 'schedule' && (
            <ScheduleTab
              schedule={schedule}
              onUpdate={(updated) => onUpdateSchedule(key, updated)}
            />
          )}

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Goal donut */}
              {goal?.active && pieData.length > 0 && (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Current Goal Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ height: 110, width: 110, flexShrink: 0 }}>
                      <ResponsivePie data={pieData} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
                        innerRadius={0.65} padAngle={2} cornerRadius={4}
                        colors={d => d.data.color} enableArcLabels={false} enableArcLinkLabels={false} tooltip={() => null} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1 }}>{Math.round(progress)}%</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{goal.tokens} of {goal.goal} tokens earned</div>
                      {goal.reward && <div style={{ fontSize: 12, color: C.coral, marginTop: 6 }}>Reward: {goal.reward}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly stats */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Weekly Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Earned This Week', value: weekTotal,                                              unit: 'tokens',    color: C.coral },
                    { label: 'Daily Average',     value: weekTotal > 0 ? (weekTotal/7).toFixed(1) : '0',        unit: 'per day',   color: C.teal },
                    { label: 'Best Day',          value: Math.max(...chartData.map(d => d.tokens), 0),          unit: 'tokens',    color: '#f97316' },
                    { label: 'Active Days',       value: chartData.filter(d => d.tokens > 0).length,           unit: 'this week', color: '#8b5cf6' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', border: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{stat.unit}</div>
                      <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 1 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Teacher Notes</div>
                <textarea
                  value={notes}
                  onChange={e => onUpdateNotes(key, e.target.value)}
                  placeholder="Add notes about this student's progress, behaviors, IEP goals…"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#F8FAFC', border: `1px solid ${C.border}`,
                    borderRadius: 8, color: C.text, fontSize: 13,
                    padding: '10px 12px', resize: 'vertical', outline: 'none',
                    fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                  onFocus={e => e.target.style.borderColor = C.coral}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
