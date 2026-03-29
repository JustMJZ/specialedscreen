import React, { useEffect, useRef, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { supabase } from '../../lib/supabase';
import './SchedulePage.css';

const SUPABASE_TABLE = 'schedule_events';

const CALENDAR_COLORS = {
  personal: '#6366f1',
  school: '#10b981',
  iep: '#f59e0b',
};

function defaultForm() {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60000);
  const fmt = d => d.toISOString().slice(0, 16);
  return { title: '', start: fmt(now), end: fmt(later), description: '', calendarId: 'personal', allDay: false };
}

const EMPTY_FORM = defaultForm();

function toFCEvent(row) {
  const color = CALENDAR_COLORS[row.calendar_id] || CALENDAR_COLORS.personal;
  return {
    id: row.id,
    title: row.title,
    start: row.start_at,
    end: row.end_at,
    allDay: row.all_day || false,
    extendedProps: { description: row.description || '', calendarId: row.calendar_id || 'personal' },
    backgroundColor: color,
    borderColor: color,
  };
}

export default function SchedulePage() {
  const calendarRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const eventsLoaded = useRef(false);

  function getApi() {
    return calendarRef.current?.getApi();
  }

  useEffect(() => {
    if (eventsLoaded.current) return;
    eventsLoaded.current = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) {
        const api = getApi();
        if (!api) return;
        data.forEach(row => api.addEvent(toFCEvent(row)));
      }
    }
    load();
  }, []);

  function openCreate(selectInfo) {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      start: selectInfo.startStr.slice(0, 16),
      end: selectInfo.endStr.slice(0, 16),
      allDay: selectInfo.allDay,
    });
    setShowForm(true);
    if (selectInfo.view) selectInfo.view.calendar.unselect();
  }

  function openEdit(clickInfo) {
    const e = clickInfo.event;
    setEditId(e.id);
    setForm({
      title: e.title,
      start: e.startStr.slice(0, 16),
      end: (e.endStr || e.startStr).slice(0, 16),
      description: e.extendedProps.description || '',
      calendarId: e.extendedProps.calendarId || 'personal',
      allDay: e.allDay,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    setSaveError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setSaveError('Not logged in.'); return; }

    const payload = {
      title: form.title.trim(),
      start_at: form.start,
      end_at: form.end || form.start,
      description: form.description,
      calendar_id: form.calendarId,
      all_day: form.allDay,
    };

    const api = getApi();

    if (editId) {
      const { error } = await supabase.from(SUPABASE_TABLE).update(payload).eq('id', editId).eq('user_id', user.id);
      if (error) { setSaving(false); setSaveError(error.message); return; }
      if (api) {
        const existing = api.getEventById(editId);
        if (existing) existing.remove();
        api.addEvent(toFCEvent({ id: editId, ...payload }));
      }
    } else {
      const { data, error } = await supabase.from(SUPABASE_TABLE).insert({ user_id: user.id, ...payload }).select().single();
      if (error) { setSaving(false); setSaveError(error.message); return; }
      if (data && api) {
        api.addEvent(toFCEvent(data));
      }
    }
    setSaving(false);
    setShowForm(false);
    setForm(defaultForm());
    setEditId(null);
  }

  async function handleDelete() {
    if (!editId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from(SUPABASE_TABLE).delete().eq('id', editId).eq('user_id', user.id);
    const api = getApi();
    if (api) {
      const existing = api.getEventById(editId);
      if (existing) existing.remove();
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleEventDrop(info) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from(SUPABASE_TABLE).update({
      start_at: info.event.startStr,
      end_at: info.event.endStr || info.event.startStr,
    }).eq('id', info.event.id).eq('user_id', user.id);
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>Schedule</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            {Object.entries(CALENDAR_COLORS).map(([key, color]) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
          </div>
          <button
            onClick={() => { setEditId(null); setForm(defaultForm()); setSaveError(''); setShowForm(true); }}
            style={{ background: '#6366f1', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8 }}
          >
            + Add Event
          </button>
          <button
            onClick={() => window.close()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', fontSize: 16, padding: '4px 8px', borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="schedule-calendar-wrapper" style={{ flex: 1, overflow: 'hidden', padding: '12px' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          height="100%"
          slotMinTime="06:00:00"
          slotMaxTime="21:00:00"
          scrollTime="07:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          snapDuration="00:15:00"
          stickyHeaderDates={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          nowIndicator={true}
          eventContent={(arg) => (
            <div style={{ padding: '2px 5px', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                {arg.timeText && <span style={{ fontWeight: 400, marginRight: 4, opacity: 0.85 }}>{arg.timeText}</span>}
                {arg.event.title}
              </div>
              {arg.event.extendedProps.description && (
                <div style={{ fontSize: 12, color: '#fff', overflow: 'hidden', marginTop: 2, lineHeight: 1.4, wordBreak: 'break-word', flex: 1 }}>
                  {arg.event.extendedProps.description}
                </div>
              )}
            </div>
          )}
          select={openCreate}
          eventClick={openEdit}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
        />
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 301, background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 18, width: 460, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Modal header strip */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
                {editId ? 'Edit Event' : 'New Event'}
              </span>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', color: '#94a3b8', width: 28, height: 28, borderRadius: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Title */}
              <input
                placeholder="Event title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
                style={{ ...inputStyle, fontSize: 15, fontWeight: 500, padding: '10px 14px' }}
              />

              {/* Date/time row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start</label>
                  <input
                    type="datetime-local"
                    value={form.start}
                    onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End</label>
                  <input
                    type="datetime-local"
                    value={form.end}
                    onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Calendar type — color pill buttons */}
              <div>
                <label style={labelStyle}>Calendar</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'personal', label: 'Personal', color: '#6366f1' },
                    { id: 'school',   label: 'School',   color: '#10b981' },
                    { id: 'iep',      label: 'IEP',      color: '#f59e0b' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setForm(f => ({ ...f, calendarId: opt.id }))}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 9,
                        border: form.calendarId === opt.id ? `2px solid ${opt.color}` : '2px solid rgba(255,255,255,0.08)',
                        background: form.calendarId === opt.id ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                        color: form.calendarId === opt.id ? opt.color : '#64748b',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <textarea
                  placeholder="Add details..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
                />
              </div>
            </div>

            {/* Footer */}
            {saveError && (
              <div style={{ margin: '0 24px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 12 }}>
                {saveError}
              </div>
            )}
            <div style={{
              padding: '14px 24px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: editId ? 'space-between' : 'flex-end',
            }}>
              {editId && (
                <button
                  onClick={handleDelete}
                  style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500 }}
                >
                  Delete event
                </button>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim()}
                  style={{
                    background: form.title.trim() ? '#6366f1' : 'rgba(99,102,241,0.3)',
                    border: 'none', color: '#fff', cursor: form.title.trim() ? 'pointer' : 'default',
                    padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    transition: 'background 0.15s',
                  }}
                >
                  {saving ? 'Saving…' : editId ? 'Save changes' : 'Create event'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block', color: 'rgba(148,163,184,0.7)', fontSize: 11, fontWeight: 600,
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
};
