import React, { useState, useEffect, useRef } from 'react';

const COLORS = {
  background: '#FDF8F3',
  primary: '#FF8A7A',
  secondary: '#5BC0BE',
  text: '#3D3D3D',
  stations: {
    purple: { bg: '#B39DDB', light: '#E1D5F0' },
    yellow: { bg: '#FFE082', light: '#FFF3C4' },
    blue: { bg: '#81D4FA', light: '#D0EFFF' },
    green: { bg: '#A5D6A7', light: '#D7F0D8' },
    pink: { bg: '#F8BBD9', light: '#FDE4F0' }
  }
};

const DEFAULT_TEACHER_NAMES = {
  purple: 'Ms. Angie',
  yellow: 'Ms. Maggie',
  blue: 'Mrs. Childress',
  green: 'Mr. Michael',
  pink: 'Ms. Sonya'
};

const DEFAULT_STUDENTS = [
  { id: 1, name: 'Emma', group: 'purple', photo: null },
  { id: 2, name: 'Liam', group: 'purple', photo: null },
  { id: 3, name: 'Olivia', group: 'yellow', photo: null },
  { id: 4, name: 'Noah', group: 'yellow', photo: null },
  { id: 5, name: 'Ava', group: 'blue', photo: null },
  { id: 6, name: 'Elijah', group: 'blue', photo: null },
  { id: 7, name: 'Sophia', group: 'green', photo: null },
  { id: 8, name: 'James', group: 'green', photo: null },
  { id: 9, name: 'Isabella', group: 'pink', photo: null },
  { id: 10, name: 'William', group: 'pink', photo: null }
];

const DEFAULT_ROTATION_ORDER = ['purple', 'yellow', 'blue', 'green', 'pink'];

const DEFAULT_STATION_CONFIG = {
  yellow: { top: 12, left: 40, width: 100, height: 65 },
  blue: { top: 12, left: 155, width: 100, height: 65 },
  green: { top: 12, left: 270, width: 100, height: 65 },
  purple: { top: 110, left: 12, width: 75, height: 115 },
  pink: { top: 210, left: 155, width: 110, height: 65 }
};

const DEFAULT_TV_CONFIG = { top: 95, left: 330, width: 38, height: 100, label: 'TV', icon: '📺', color: '#1a1a2e' };

const EMOJI_OPTIONS = ['📺', '🚪', '📚', '🎨', '🧸', '🪑', '🗄️', '🖥️', '📦', '🎵', '🧩', '✏️', '📐', '🗑️', '🚿', '🪴'];

const STATION_COLOR_OPTIONS = [
  { label: 'Purple', bg: '#B39DDB', light: '#E1D5F0' },
  { label: 'Yellow', bg: '#FFE082', light: '#FFF3C4' },
  { label: 'Blue', bg: '#81D4FA', light: '#D0EFFF' },
  { label: 'Green', bg: '#A5D6A7', light: '#D7F0D8' },
  { label: 'Pink', bg: '#F8BBD9', light: '#FDE4F0' },
  { label: 'Red', bg: '#EF9A9A', light: '#FFCDD2' },
  { label: 'Orange', bg: '#FFCC80', light: '#FFE0B2' },
  { label: 'Teal', bg: '#80CBC4', light: '#B2DFDB' },
  { label: 'Indigo', bg: '#9FA8DA', light: '#C5CAE9' },
  { label: 'Brown', bg: '#BCAAA4', light: '#D7CCC8' },
];

const DEFAULT_STATION_COLORS = {
  purple: { bg: '#B39DDB', light: '#E1D5F0' },
  yellow: { bg: '#FFE082', light: '#FFF3C4' },
  blue: { bg: '#81D4FA', light: '#D0EFFF' },
  green: { bg: '#A5D6A7', light: '#D7F0D8' },
  pink: { bg: '#F8BBD9', light: '#FDE4F0' }
};

// Built-in synthesized sounds using Web Audio API
const ROTATION_SOUNDS = [
  { id: 'none', name: '🔇 None', type: 'none' },
  { id: 'chime', name: '✨ Wind Chime', type: 'synth' },
  { id: 'buzzer', name: '📢 Buzzer', type: 'synth' },
  { id: 'bell', name: '🛎️ School Bell', type: 'synth' },
  { id: 'whistle', name: '🎵 Whistle', type: 'synth' },
  { id: 'marimba', name: '🎹 Marimba', type: 'synth' },
  { id: 'gong', name: '🔔 Gong', type: 'synth' },
  { id: 'birds', name: '🐦 Birds', type: 'synth' },
  { id: 'clap', name: '👏 Clap', type: 'synth' },
  { id: 'train', name: '🚂 Train', type: 'synth' },
];

const playSynthSound = (soundId) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    if (soundId === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 1);
      });
    } else if (soundId === 'buzzer') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 220;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.5);
    } else if (soundId === 'bell') {
      [830, 1245, 1660].forEach((freq) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 1.5);
      });
    } else if (soundId === 'whistle') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      osc.frequency.linearRampToValueAtTime(800, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.8);
    } else if (soundId === 'marimba') {
      [262, 330, 392, 523, 392, 330].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.4);
      });
    } else if (soundId === 'gong') {
      [130, 260, 390].forEach((freq) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 3);
      });
    } else if (soundId === 'birds') {
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 1000;
        osc.frequency.setValueAtTime(baseFreq, now + i * 0.2);
        osc.frequency.linearRampToValueAtTime(baseFreq + 500, now + i * 0.2 + 0.05);
        osc.frequency.linearRampToValueAtTime(baseFreq - 200, now + i * 0.2 + 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.15);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 0.15);
      }
    } else if (soundId === 'clap') {
      for (let i = 0; i < 3; i++) {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
        const source = ctx.createBufferSource(); const gain = ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(0.5, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);
        source.connect(gain); gain.connect(ctx.destination);
        source.start(now + i * 0.15);
      }
    } else if (soundId === 'train') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + 0.3);
      gain.gain.setValueAtTime(0.001, now + 0.35);
      gain.gain.setValueAtTime(0.25, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 1.2);
    }

    setTimeout(() => ctx.close(), 4000);
  } catch (e) {
    console.log('Web Audio not supported');
  }
};

// Play sound - handles synth, custom uploaded, or none
const playSound = (soundId, customSounds) => {
  if (soundId === 'none') return;

  // Check built-in synth sounds
  const builtIn = ROTATION_SOUNDS.find(s => s.id === soundId);
  if (builtIn && builtIn.type === 'synth') {
    playSynthSound(soundId);
    return;
  }

  // Check custom sounds
  const custom = (customSounds || []).find(s => s.id === soundId);
  if (custom && custom.dataUrl) {
    try {
      const audio = new Audio(custom.dataUrl);
      audio.volume = 0.7;
      audio.play().catch(e => console.log('Audio playback failed:', e.message));
    } catch (e) {
      console.log('Audio playback error');
    }
  }
};

// Student Manager Modal
const STUDENT_EMOJI_OPTIONS = ['🐉', '🦄', '🐱', '🐶', '🐸', '🦊', '🐼', '🐨', '🦁', '🐯', '🐻', '🐰', '🐙', '🦋', '🐢', '🌟', '🚀', '🎨', '🎮', '🏀', '⚽', '🎸', '👑', '💎', '🌈'];

const StudentManager = ({ students, onUpdate, onClose, teacherNames, onUpdateTeachers, stationColors, onUpdateStationColors, rotationOrder, onUpdateRotationOrder }) => {
  const [editingStudents, setEditingStudents] = useState([...students]);
  const [editingTeachers, setEditingTeachers] = useState({ ...teacherNames });
  const [editingColors, setEditingColors] = useState({ ...stationColors });
  const [editingOrder, setEditingOrder] = useState([...rotationOrder]);
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);

  const handlePhotoUpload = (studentId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingStudents(prev => prev.map(s => s.id === studentId ? { ...s, photo: e.target.result } : s));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit Students</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            {editingStudents.map(student => (
              <div key={student.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 relative">
                    {student.photo ? (
                      <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
                    ) : student.emoji ? (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl border-2 border-purple-300">{student.emoji}</div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-gray-400">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input type="text" value={student.name}
                    onChange={(e) => setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, name: e.target.value } : s))}
                    className="flex-1 px-2 py-1 border rounded text-sm" />
                  <select value={student.group}
                    onChange={(e) => setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, group: e.target.value } : s))}
                    className="px-2 py-1 border rounded text-sm" style={{ backgroundColor: editingColors[student.group]?.light || '#eee' }}>
                    {editingOrder.map(color => (<option key={color} value={color}>{editingTeachers[color]}</option>))}
                  </select>
                </div>
                <div className="flex items-center gap-1 mt-1 ml-12">
                  <label className="cursor-pointer text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(student.id, e.target.files[0])} />
                    📷 Photo
                  </label>
                  <button onClick={() => setEmojiPickerFor(emojiPickerFor === student.id ? null : student.id)}
                    className={`text-xs px-1.5 py-0.5 rounded ${emojiPickerFor === student.id ? 'bg-purple-200 text-purple-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}>
                    😀 Emoji
                  </button>
                  {(student.photo || student.emoji) && (
                    <button onClick={() => setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, photo: null, emoji: null } : s))}
                      className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100">✕ Clear</button>
                  )}
                </div>
                {emojiPickerFor === student.id && (
                  <div className="flex flex-wrap gap-1 mt-1 ml-12 p-1 bg-white rounded border">
                    {STUDENT_EMOJI_OPTIONS.map(em => (
                      <button key={em} onClick={() => { setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, emoji: em, photo: null } : s)); setEmojiPickerFor(null); }}
                        className={`w-7 h-7 rounded text-base hover:bg-gray-100 ${student.emoji === em ? 'bg-purple-100 ring-1 ring-purple-400' : ''}`}>{em}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t border-b bg-blue-50">
          <div className="text-sm font-bold text-gray-700 mb-2">Stations & Rotation Order</div>
          <div className="space-y-2">
            {editingOrder.map((color, idx) => (
              <div key={color} className="rounded-lg overflow-hidden border" style={{ borderColor: editingColors[color]?.bg || '#ccc' }}>
                <div className="flex items-center gap-2 px-2 py-1.5" style={{ backgroundColor: editingColors[color]?.light || '#eee' }}>
                  <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}.</span>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: editingColors[color]?.bg || '#ccc' }} />
                  <input type="text" value={editingTeachers[color]}
                    onChange={(e) => setEditingTeachers(prev => ({ ...prev, [color]: e.target.value }))}
                    className="flex-1 px-2 py-1 border rounded text-sm bg-white" />
                  <button onClick={() => { if (idx === 0) return; setEditingOrder(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; }); }}
                    className="text-xs px-1.5 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-30" disabled={idx === 0}>▲</button>
                  <button onClick={() => { if (idx === editingOrder.length - 1) return; setEditingOrder(prev => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; }); }}
                    className="text-xs px-1.5 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-30" disabled={idx === editingOrder.length - 1}>▼</button>
                </div>
                <div className="flex gap-1 px-2 py-1 bg-white/60">
                  {STATION_COLOR_OPTIONS.map(opt => (
                    <button key={opt.label} onClick={() => setEditingColors(prev => ({ ...prev, [color]: { bg: opt.bg, light: opt.light } }))}
                      className={`w-5 h-5 rounded-full border-2 ${editingColors[color]?.bg === opt.bg ? 'border-gray-800 ring-1 ring-gray-400' : 'border-transparent'}`}
                      style={{ backgroundColor: opt.bg }} title={opt.label} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editingStudents); onUpdateTeachers(editingTeachers); onUpdateStationColors(editingColors); onUpdateRotationOrder(editingOrder); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

// First/Then Editor Modal
const FirstThenEditor = ({ firstThen, onUpdate, onClose }) => {
  const [editing, setEditing] = useState({ ...firstThen });
  const activities = [
    { icon: '📚', label: 'Reading' }, { icon: '✏️', label: 'Writing' }, { icon: '🔢', label: 'Math' },
    { icon: '🎨', label: 'Art' }, { icon: '🎵', label: 'Music' }, { icon: '🎮', label: 'Free Time' },
    { icon: '🧩', label: 'Puzzles' }, { icon: '💻', label: 'Computer' }, { icon: '🏃', label: 'PE' },
    { icon: '🍎', label: 'Snack' }, { icon: '🥪', label: 'Lunch' }, { icon: '🧹', label: 'Clean Up' },
  ];
  const isCustomFirst = !activities.some(a => a.icon === editing.firstIcon && a.label === editing.firstLabel);
  const isCustomThen = !activities.some(a => a.icon === editing.thenIcon && a.label === editing.thenLabel);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit First/Then</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <div className="mb-3">
            <label className="block text-sm font-bold text-blue-600 mb-1">FIRST</label>
            <div className="flex flex-wrap gap-1">
              {activities.map(a => (
                <button key={a.icon} onClick={() => setEditing(p => ({ ...p, firstIcon: a.icon, firstLabel: a.label }))}
                  className={`px-2 py-1 rounded text-xs ${editing.firstIcon === a.icon && editing.firstLabel === a.label ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
              <button onClick={() => setEditing(p => ({ ...p, firstIcon: '📝', firstLabel: '' }))}
                className={`px-2 py-1 rounded text-xs ${isCustomFirst ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                ✏️ Custom
              </button>
            </div>
            {isCustomFirst && (
              <div className="flex gap-1 mt-1">
                <input type="text" value={editing.firstIcon} onChange={(e) => setEditing(p => ({ ...p, firstIcon: e.target.value }))}
                  className="w-10 px-1 py-1 border rounded text-center text-sm" placeholder="📝" maxLength={2} />
                <input type="text" value={editing.firstLabel} onChange={(e) => setEditing(p => ({ ...p, firstLabel: e.target.value }))}
                  className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Activity name" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-green-600 mb-1">THEN</label>
            <div className="flex flex-wrap gap-1">
              {activities.map(a => (
                <button key={a.icon} onClick={() => setEditing(p => ({ ...p, thenIcon: a.icon, thenLabel: a.label }))}
                  className={`px-2 py-1 rounded text-xs ${editing.thenIcon === a.icon && editing.thenLabel === a.label ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
              <button onClick={() => setEditing(p => ({ ...p, thenIcon: '📝', thenLabel: '' }))}
                className={`px-2 py-1 rounded text-xs ${isCustomThen ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                ✏️ Custom
              </button>
            </div>
            {isCustomThen && (
              <div className="flex gap-1 mt-1">
                <input type="text" value={editing.thenIcon} onChange={(e) => setEditing(p => ({ ...p, thenIcon: e.target.value }))}
                  className="w-10 px-1 py-1 border rounded text-center text-sm" placeholder="📝" maxLength={2} />
                <input type="text" value={editing.thenLabel} onChange={(e) => setEditing(p => ({ ...p, thenLabel: e.target.value }))}
                  className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Activity name" />
              </div>
            )}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editing); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

// Custom Box Editor
const CustomBoxEditor = ({ box, onUpdate, onDelete, onClose, students }) => {
  const [editing, setEditing] = useState({ ...box, assignedStudents: box.assignedStudents || [] });

  const toggleStudent = (studentId) => {
    setEditing(p => ({
      ...p,
      assignedStudents: p.assignedStudents.includes(studentId)
        ? p.assignedStudents.filter(id => id !== studentId)
        : [...p.assignedStudents, studentId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden max-h-[80vh] overflow-y-auto">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-bold text-gray-800">✏️ Edit Box</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <input type="text" value={editing.label} onChange={(e) => setEditing(p => ({ ...p, label: e.target.value }))}
            className="w-full px-2 py-1 border rounded text-sm mb-2" placeholder="Label" />
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => setEditing(p => ({ ...p, icon: '' }))}
              className={`w-8 h-8 rounded text-sm font-bold ${!editing.icon ? 'bg-red-100 ring-2 ring-red-400 text-red-500' : 'bg-gray-100 text-gray-400'}`}>✕</button>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEditing(p => ({ ...p, icon: e }))}
                className={`w-8 h-8 rounded text-lg ${editing.icon === e ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>{e}</button>
            ))}
          </div>
          <div className="flex gap-1 mb-2">
            {['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(c => (
              <button key={c} onClick={() => setEditing(p => ({ ...p, color: c }))}
                className={`w-6 h-6 rounded-full ${editing.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          {students && students.length > 0 && (
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1">STUDENTS IN BOX</div>
              <div className="flex flex-wrap gap-1">
                {students.map(s => (
                  <label key={s.id} className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${editing.assignedStudents.includes(s.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    <input type="checkbox" checked={editing.assignedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} className="rounded" style={{ width: 12, height: 12 }} />
                    {s.name.split(' ')[0]}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t bg-gray-50 flex justify-between">
          <button onClick={() => { onDelete(box.id); onClose(); }} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-sm">🗑️</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
            <button onClick={() => { onUpdate(editing); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Token Board Popup
const TokenPopup = ({ student, goal, onAddToken, onRemoveToken, onResetTokens, onClose }) => {
  if (!goal) return null;
  const progress = (goal.tokens / goal.goal) * 100;
  const isComplete = goal.tokens >= goal.goal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-72 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{student.name}'s Token Board</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>
        {goal.active ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-bold text-gray-700">{goal.tokens} / {goal.goal}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: isComplete ? '#10B981' : '#3B82F6' }} />
            </div>
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {Array.from({ length: goal.goal }).map((_, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 ${i < goal.tokens ? 'bg-yellow-400 border-yellow-500 text-yellow-800' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                  {i < goal.tokens ? (goal.tokenEmoji || '⭐') : '○'}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 mb-3">Reward: <span className="font-medium">{goal.reward}</span></div>
            {isComplete && (
              <div className="text-center mb-3">
                <div className="text-lg font-bold text-green-600 mb-1">🎉 Goal Reached!</div>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button onClick={onRemoveToken}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-bold text-sm hover:bg-red-200 disabled:opacity-40"
                disabled={goal.tokens === 0}>− Remove</button>
              {isComplete ? (
                <button onClick={onResetTokens}
                  className="px-4 py-2 rounded-lg bg-amber-100 text-amber-700 font-bold text-sm hover:bg-amber-200">↺ Reset</button>
              ) : (
                <button onClick={onAddToken}
                  className="px-4 py-2 rounded-lg font-bold text-sm bg-green-100 text-green-600 hover:bg-green-200">+ Add Token</button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">No active goal set for this student.</div>
        )}
      </div>
    </div>
  );
};

// Animated student
const AnimatedStudent = ({ name, photo, emoji, stationConfigs, currentGroup, targetGroup, isAnimating, index, groupSize, onClick }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#FF8A7A', '#5BC0BE', '#7BC47F', '#FFD166', '#B39DDB'];
  const group = isAnimating ? targetGroup : currentGroup;
  const config = stationConfigs[group];
  const isVertical = config.height > config.width;

  // Scale student avatars based on box size
  const minDim = Math.min(config.width, config.height);
  const avatarScale = Math.max(0.5, Math.min(1.5, minDim / 70));
  const avatarSize = Math.max(22, 36 * avatarScale);
  const nameSize = Math.max(8, 13 * avatarScale);

  // Reserve space for teacher name header
  const headerHeight = Math.max(14, 20 * avatarScale);
  const firstName = name.split(' ')[0];
  // Shrink font for longer names
  const adjustedNameSize = firstName.length > 6 ? nameSize * 0.8 : nameSize;
  const itemHeight = avatarSize + 4;
  const itemWidth = avatarSize + 12;

  let left, top;
  if (isVertical) {
    // Vertical box: avatar + name side by side, stacked vertically
    const availHeight = config.height - headerHeight;
    const spacing = Math.min(itemHeight, availHeight / groupSize);
    const totalHeight = groupSize * spacing;
    const bodyTop = config.top + headerHeight;
    const startY = bodyTop + (availHeight - totalHeight) / 2;
    left = config.left + (config.width / 2) - (avatarSize / 2) - 2;
    top = startY + (index * spacing);
  } else {
    // Horizontal box: avatar + name stacked, laid out horizontally
    const availWidth = config.width;
    const spacing = Math.min(itemWidth, availWidth / groupSize);
    const totalWidth = groupSize * spacing;
    const startX = config.left + (availWidth - totalWidth) / 2;
    const bodyTop = config.top + headerHeight;
    const bodyHeight = config.height - headerHeight;
    const itemTotalHeight = avatarSize + adjustedNameSize + 6;
    left = startX + (index * spacing);
    top = bodyTop + (bodyHeight - itemTotalHeight) / 2;
  }

  const avatarEl = photo ? (
    <img src={photo} alt={name} className="rounded-full object-cover shadow-lg border-2 border-white flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize, boxShadow: isAnimating ? `0 4px 15px ${colors[name.charCodeAt(0) % 5]}80` : '0 2px 6px rgba(0,0,0,0.15)' }} />
  ) : emoji ? (
    <div className="rounded-full flex items-center justify-center shadow-lg border-2 border-white flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.55, backgroundColor: colors[name.charCodeAt(0) % 5], boxShadow: isAnimating ? `0 4px 15px ${colors[name.charCodeAt(0) % 5]}80` : '0 2px 6px rgba(0,0,0,0.15)' }}>
      {emoji}
    </div>
  ) : (
    <div className="rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
      style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4, backgroundColor: colors[name.charCodeAt(0) % 5], boxShadow: isAnimating ? `0 4px 15px ${colors[name.charCodeAt(0) % 5]}80` : '0 2px 6px rgba(0,0,0,0.15)' }}>
      {initials}
    </div>
  );

  const nameEl = <span className="font-medium text-gray-700 bg-white/90 px-0.5 rounded shadow-sm whitespace-nowrap" style={{ fontSize: adjustedNameSize }}>{firstName}</span>;

  return (
    <div className={`absolute cursor-pointer ${isVertical ? 'flex items-center gap-1' : 'flex flex-col items-center gap-0.5'}`}
      style={{ top, left, transition: 'all 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)', zIndex: isAnimating ? 20 : 10 }}
      onClick={onClick}>
      {avatarEl}
      {nameEl}
    </div>
  );
};

// Draggable station - FIXED: All text scales with box
const DraggableStation = ({ color, config, onUpdate, isEditMode, isTarget, containerRef, students, teacherName, stationColors, onRemove }) => {
  const station = stationColors[color] || COLORS.stations[color];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  
  // Calculate scale based on box dimensions
  const minDim = Math.min(config.width, config.height);
  const maxDim = Math.max(config.width, config.height);
  const scale = Math.max(0.3, Math.min(1.2, minDim / 80));

  // Scale all text elements (teacher name and dot 20% bigger)
  const teacherFontSize = Math.max(8, Math.floor(14.4 * scale));
  const studentFontSize = Math.max(5, Math.floor(9 * scale));
  const dotSize = Math.max(5, Math.floor(9.6 * scale));
  const padding = Math.max(2, Math.floor(4 * scale));
  
  const stationStudents = students.filter(s => s.group === color);
  
  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMove = (x, y) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isDragging) onUpdate(color, { ...config, left: Math.max(5, Math.min(x - rect.left - dragOffset.x, rect.width - config.width - 5)), top: Math.max(5, Math.min(y - rect.top - dragOffset.y, rect.height - config.height - 5)) });
      if (isResizing) onUpdate(color, { ...config, width: Math.max(50, Math.min(x - rect.left - config.left, rect.width - config.left - 5)), height: Math.max(40, Math.min(y - rect.top - config.top, rect.height - config.top - 5)) });
    };
    const onMM = (e) => handleMove(e.clientX, e.clientY);
    const onTM = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => { setIsDragging(false); setIsResizing(false); };
    document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTM); document.addEventListener('touchend', onEnd);
    return () => { document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchmove', onTM); document.removeEventListener('touchend', onEnd); };
  }, [isDragging, isResizing, dragOffset, color, config, onUpdate, containerRef]);
  
  return (
    <div ref={ref} className={`absolute rounded-lg shadow-md select-none overflow-hidden ${isEditMode ? 'cursor-move' : ''}`}
      style={{ top: config.top, left: config.left, width: config.width, height: config.height, backgroundColor: station.light, border: `2px solid ${station.bg}`,
        boxShadow: isTarget ? `0 0 12px ${station.bg}50` : '0 2px 6px rgba(0,0,0,0.1)', zIndex: isDragging || isResizing ? 100 : 5 }}
      onMouseDown={(e) => { if (!isEditMode || e.target.dataset.resize) return; e.preventDefault(); const r = ref.current.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); setIsDragging(true); }}
      onTouchStart={(e) => { if (!isEditMode || e.target.dataset.resize) return; const t = e.touches[0]; const r = ref.current.getBoundingClientRect(); setDragOffset({ x: t.clientX - r.left, y: t.clientY - r.top }); setIsDragging(true); }}>
      
      {/* Teacher name - scales with box */}
      <div className="flex items-center overflow-hidden" style={{ padding, gap: padding }}>
        <div className="rounded-full flex-shrink-0" style={{ backgroundColor: station.bg, width: dotSize, height: dotSize }} />
        <span className="font-bold text-gray-700 truncate" style={{ fontSize: teacherFontSize, lineHeight: 1.1 }}>{teacherName}</span>
      </div>
      
      {/* Student names - scale with box */}
      {!isEditMode && stationStudents.length > 0 && (
        <div className="overflow-hidden" style={{ paddingLeft: padding, paddingRight: padding }}>
          <div className="text-gray-500 truncate" style={{ fontSize: studentFontSize, lineHeight: 1.2 }}>
            {stationStudents.map(s => s.name.split(' ')[0]).join(', ')}
          </div>
        </div>
      )}
      
      {isEditMode && <>
        <div data-resize="true" className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" style={{ background: `linear-gradient(135deg, transparent 50%, ${station.bg} 50%)` }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }} />
        {onRemove && <button data-resize="true" onClick={(e) => { e.stopPropagation(); onRemove(color); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center shadow hover:bg-red-600" style={{ fontSize: 9, lineHeight: 1, zIndex: 10 }}>✕</button>}
      </>}
    </div>
  );
};

// Draggable custom box
const DraggableBox = ({ box, onUpdate, isEditMode, containerRef, onEdit, students }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const minDim = Math.min(box.width, box.height);
  const scale = Math.max(0.5, Math.min(1, minDim / 50));
  const assignedStudents = (box.assignedStudents || []).map(id => (students || []).find(s => s.id === id)).filter(Boolean);
  const avatarScale = Math.max(0.5, Math.min(1.5, minDim / 70));
  const avatarSize = Math.max(16, 36 * avatarScale);
  const avatarGap = Math.max(4, 6 * avatarScale);

  useEffect(() => {
    if (!isDragging && !isResizing) return;
    const handleMove = (x, y) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isDragging) onUpdate({ ...box, left: Math.max(5, Math.min(x - rect.left - dragOffset.x, rect.width - box.width - 5)), top: Math.max(5, Math.min(y - rect.top - dragOffset.y, rect.height - box.height - 5)) });
      if (isResizing) onUpdate({ ...box, width: Math.max(30, Math.min(x - rect.left - box.left, rect.width - box.left - 5)), height: Math.max(30, Math.min(y - rect.top - box.top, rect.height - box.top - 5)) });
    };
    const onMM = (e) => handleMove(e.clientX, e.clientY);
    const onTM = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => { setIsDragging(false); setIsResizing(false); };
    document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onTM); document.addEventListener('touchend', onEnd);
    return () => { document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchmove', onTM); document.removeEventListener('touchend', onEnd); };
  }, [isDragging, isResizing, dragOffset, box, onUpdate, containerRef]);

  const colors = ['#FF8A7A', '#5BC0BE', '#7BC47F', '#FFD166', '#B39DDB'];

  return (
    <div ref={ref} className={`absolute rounded flex flex-col items-center justify-center shadow-lg select-none overflow-hidden ${isEditMode ? 'cursor-move' : ''}`}
      style={{ top: box.top, left: box.left, width: box.width, height: box.height, backgroundColor: box.color, zIndex: isDragging || isResizing ? 100 : 4 }}
      onMouseDown={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; e.preventDefault(); const r = ref.current.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); setIsDragging(true); }}
      onTouchStart={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; const t = e.touches[0]; const r = ref.current.getBoundingClientRect(); setDragOffset({ x: t.clientX - r.left, y: t.clientY - r.top }); setIsDragging(true); }}>
      {box.icon && <div style={{ fontSize: Math.max(10, 16 * scale) }}>{box.icon}</div>}
      <div className="text-white font-bold truncate px-1 text-center w-full" style={{ fontSize: Math.max(6, 9 * scale) }}>{box.label}</div>
      {assignedStudents.length > 0 && !box.hideStudents && (
        <div className="flex flex-wrap justify-center px-0.5 mt-0.5" style={{ gap: avatarGap }}>
          {assignedStudents.map(s => (
            <div key={s.id} className="flex flex-col items-center" style={{ gap: 1 }}>
              {s.photo ? (
                <img src={s.photo} alt={s.name} className="rounded-full object-cover border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize }} />
              ) : s.emoji ? (
                <div className="rounded-full flex items-center justify-center border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.75, backgroundColor: colors[s.name.charCodeAt(0) % 5] }}>{s.emoji}</div>
              ) : (
                <div className="rounded-full flex items-center justify-center text-white font-bold border-2 border-white/60"
                  style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4, backgroundColor: colors[s.name.charCodeAt(0) % 5] }}>
                  {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium whitespace-nowrap text-center" style={{ fontSize: Math.max(6, avatarSize * 0.35), lineHeight: 1 }}>{s.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      )}
      {assignedStudents.length > 0 && (
        <button data-edit="true" onClick={(e) => { e.stopPropagation(); onUpdate({ ...box, hideStudents: !box.hideStudents }); }}
          className="absolute bottom-0.5 right-0.5 rounded-full flex items-center justify-center shadow"
          style={{ width: 14, height: 14, fontSize: 8, backgroundColor: 'rgba(0,0,0,0.35)', color: 'white', zIndex: 10, lineHeight: 1 }}
          title={box.hideStudents ? 'Show students' : 'Hide students'}>
          {box.hideStudents ? '👁' : '👁‍🗨'}
        </button>
      )}
      {isEditMode && <>
        <button data-edit="true" onClick={(e) => { e.stopPropagation(); onEdit(box); }} className="absolute top-0.5 left-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center shadow" style={{ zIndex: 10 }}>✏️</button>
        <div data-resize="true" className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }} />
      </>}
    </div>
  );
};

// Station Groups
const StationGroups = ({ students, isAnimating, animationTargets, teacherNames, stationColors, rotationOrder }) => (
  <div className="bg-white rounded-lg p-2.5 shadow-md">
    <div className="text-sm font-bold text-gray-500 mb-1.5">GROUPS</div>
    <div className="grid grid-cols-1 gap-1">
      {rotationOrder.map(color => {
        const s = stationColors[color] || COLORS.stations[color];
        const name = teacherNames[color];
        const grp = students.filter(st => st.group === color);
        const isTarget = isAnimating && Object.values(animationTargets).includes(color);
        return (
          <div key={color} className="flex items-center gap-1.5 px-2 py-1.5 rounded"
            style={{ backgroundColor: s.light, border: `1px solid ${s.bg}`, opacity: isAnimating && !isTarget ? 0.5 : 1 }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.bg }} />
            <span className="font-bold text-gray-700 text-sm">{name.split(' ')[1] || name}</span>
            <span className="text-gray-500 truncate flex-1 text-sm">: {grp.map(st => st.name.split(' ')[0]).join(', ')}</span>
          </div>
        );
      })}
    </div>
  </div>
);

// Timer
const Timer = ({ timeRemaining, totalTime, isRunning, onTimeChange, onTotalTimeChange, disabled }) => {
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const progress = timeRemaining / totalTime;
  const [showCustom, setShowCustom] = useState(false);
  const [customMins, setCustomMins] = useState(Math.floor(totalTime / 60));
  const [customSecs, setCustomSecs] = useState(totalTime % 60);
  
  let barColor = progress < 0.07 ? '#FF8A7A' : progress < 0.15 ? '#FFD166' : '#5BC0BE';
  
  return (
    <div className="bg-white rounded-lg p-3 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: '56px', color: COLORS.text, lineHeight: 1, fontFamily: "'Fredoka One', cursive" }}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        <span className={`text-sm px-2 py-1 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isRunning ? '●' : '○'}
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%`, backgroundColor: barColor }} />
      </div>
      {!isRunning && !showCustom && (
        <div className="flex gap-1 justify-center flex-wrap">
          {[5, 10, 15, 20].map(m => (
            <button key={m} onClick={() => { onTotalTimeChange(m * 60); onTimeChange(m * 60); }}
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
          <button onClick={() => { const total = customMins * 60 + customSecs; onTotalTimeChange(total); onTimeChange(total); setShowCustom(false); }}
            className="px-2 py-0.5 text-xs rounded bg-teal-500 text-white font-medium">✓</button>
          <button onClick={() => setShowCustom(false)} className="px-2 py-0.5 text-xs rounded bg-gray-200">✕</button>
        </div>
      )}
    </div>
  );
};

// Sound Dropdown Selector with custom upload
const SoundSelector = ({ selectedSound, onSelect, customSounds, onCustomSoundsChange }) => {
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = window.prompt('Name for this sound:', file.name.replace(/\.[^.]+$/, ''));
    if (!name) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newSound = { id: `custom-${Date.now()}`, name, dataUrl: ev.target.result };
      onCustomSoundsChange([...customSounds, newSound]);
      onSelect(newSound.id);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this custom sound?')) return;
    onCustomSoundsChange(customSounds.filter(s => s.id !== id));
    if (selectedSound === id) onSelect('none');
  };

  const allSounds = [...ROTATION_SOUNDS, ...customSounds.map(s => ({ id: s.id, name: `🎵 ${s.name}`, type: 'custom' }))];

  return (
    <div className="bg-white rounded-lg p-2 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500">🔊 SOUND:</span>
        <select value={selectedSound} onChange={(e) => { onSelect(e.target.value); playSound(e.target.value, customSounds); }}
          className="flex-1 px-2 py-1 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300">
          {allSounds.map(sound => (<option key={sound.id} value={sound.id}>{sound.name}</option>))}
        </select>
        <button onClick={() => playSound(selectedSound, customSounds)} className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200">▶</button>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <input ref={fileInputRef} type="file" accept=".mp3,.wav,.ogg" className="hidden" onChange={handleUpload} />
        <button onClick={() => fileInputRef.current.click()} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-600">+ Upload Sound</button>
        {customSounds.find(s => s.id === selectedSound) && (
          <button onClick={() => handleDelete(selectedSound)} className="text-xs bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded text-red-500">🗑️ Delete</button>
        )}
      </div>
    </div>
  );
};

// Voice Level Widget
const VoiceLevel = ({ level, onChange }) => {
  const levels = [
    { id: 0, label: 'Silent', icon: '🤫', color: '#EF4444' },
    { id: 1, label: 'Whisper', icon: '🤭', color: '#F59E0B' },
    { id: 2, label: 'Talk', icon: '💬', color: '#10B981' },
    { id: 3, label: 'Loud', icon: '📢', color: '#3B82F6' },
  ];
  
  return (
    <div className="bg-white rounded-lg p-2 shadow-md">
      <div className="text-xs font-bold text-gray-500 mb-1">🔈 VOICE LEVEL</div>
      <div className="flex gap-1">
        {levels.map(l => (
          <button key={l.id} onClick={() => onChange(l.id)}
            className={`flex-1 py-1 rounded text-center transition-all ${level === l.id ? 'ring-2 ring-offset-1' : 'opacity-40'}`}
            style={{ backgroundColor: l.color + '20', ringColor: l.color }}>
            <div className="text-base">{l.icon}</div>
            <div className="text-xs font-medium" style={{ color: l.color }}>{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Countdown to Event Widget
const CountdownWidget = ({ event, targetTime, onEdit }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [editing, setEditing] = useState(false);
  const [newEvent, setNewEvent] = useState(event);
  const [newTime, setNewTime] = useState(targetTime);
  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [hours, minutes] = targetTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [targetTime]);
  
  if (editing) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 shadow-md">
        <input value={newEvent} onChange={e => setNewEvent(e.target.value)} placeholder="Event name"
          className="w-full px-2 py-1 rounded text-sm mb-1 border" />
        <div className="flex gap-1">
          <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
            className="flex-1 px-2 py-1 rounded text-sm border" />
          <button onClick={() => { onEdit(newEvent, newTime); setEditing(false); }}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs">✓</button>
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs">✕</button>
        </div>
      </div>
    );
  }
  
  return (
    <div onClick={() => setEditing(true)} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-xs font-bold text-purple-600">⏰ COUNTDOWN TO</div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-700">{event}</span>
        <span className="text-lg font-bold text-purple-600">{timeLeft}</span>
      </div>
    </div>
  );
};

// Quick Message Board
const QuickMessage = ({ message, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(message);
  
  const presets = ['Great job! ⭐', 'Remember: Quiet voices 🤫', 'Clean up time! 🧹', 'Line up! 🚶', 'Eyes on teacher 👀'];
  
  if (editing) {
    return (
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2 shadow-md">
        <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-2 py-1 rounded text-sm border mb-1" autoFocus />
        <div className="flex flex-wrap gap-1 mb-1">
          {presets.map(p => (
            <button key={p} onClick={() => setVal(p)} className="px-1.5 py-0.5 bg-white/50 rounded text-xs hover:bg-white/80">{p}</button>
          ))}
        </div>
        <div className="flex gap-1 justify-end">
          <button onClick={() => setEditing(false)} className="px-2 py-1 bg-gray-200 rounded text-xs">Cancel</button>
          <button onClick={() => { onEdit(val); setEditing(false); }} className="px-2 py-1 bg-amber-500 text-white rounded text-xs">Save</button>
        </div>
      </div>
    );
  }
  
  return (
    <div onClick={() => setEditing(true)} className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
      <div className="text-xs font-bold text-amber-600">📋 QUICK MESSAGE</div>
      <div className="font-bold text-gray-700 text-center py-1">{message}</div>
    </div>
  );
};

// Star Points / Reward Tracker
const StarPoints = ({ points, onAdd, onSubtract, onReset }) => (
  <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-2 shadow-md">
    <div className="text-xs font-bold text-amber-600 mb-1">⭐ CLASS STARS</div>
    <div className="flex items-center justify-between">
      <button onClick={onSubtract} className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-lg hover:bg-red-200">−</button>
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-600">{points}</div>
        <div className="text-xs text-gray-500">stars earned</div>
      </div>
      <button onClick={onAdd} className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-lg hover:bg-green-200">+</button>
    </div>
    <button onClick={onReset} className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600">Reset</button>
  </div>
);

// Goal Editor Modal
const TOKEN_EMOJI_OPTIONS = ['⭐', '🌟', '💎', '🔥', '❤️', '🍀', '🎯', '🏅', '👑', '🦄', '🐾', '🌈', '🍎', '🎵', '🚀', '💜'];

const GoalEditorModal = ({ students, goals, onUpdate, onClose }) => {
  const [editingGoals, setEditingGoals] = useState({ ...goals });

  const rewardOptions = ['🎮 Free Time', '💻 Computer Time', '🎨 Art Time', '📚 Library Visit', '🎵 Music Time',
    '🍪 Snack', '🏆 Prize Box', '⭐ Star Student', '🎉 Class Helper', '🎪 Special Activity'];

  const handleGoalChange = (studentId, field, value) => {
    setEditingGoals(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true, tokenEmoji: '⭐' }), [field]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">🎯 Edit Student Goals</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {students.map(student => {
              const goal = editingGoals[student.id] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
              return (
                <div key={student.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-700">{student.name}</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={goal.active}
                        onChange={(e) => handleGoalChange(student.id, 'active', e.target.checked)}
                        className="rounded" />
                      Active
                    </label>
                  </div>
                  {goal.active && (
                    <>
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600">Goal Tokens</label>
                          <input type="number" min="1" max="20" value={goal.goal}
                            onChange={(e) => handleGoalChange(student.id, 'goal', parseInt(e.target.value) || 5)}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600">Current Tokens</label>
                          <input type="number" min="0" max={goal.goal} value={goal.tokens}
                            onChange={(e) => handleGoalChange(student.id, 'tokens', Math.min(goal.goal, parseInt(e.target.value) || 0))}
                            className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Reward</label>
                        <select value={rewardOptions.includes(goal.reward) ? goal.reward : '__custom__'}
                          onChange={(e) => { if (e.target.value !== '__custom__') handleGoalChange(student.id, 'reward', e.target.value); else handleGoalChange(student.id, 'reward', ''); }}
                          className="w-full px-2 py-1 border rounded text-sm">
                          {rewardOptions.map(r => <option key={r} value={r}>{r}</option>)}
                          <option value="__custom__">✏️ Custom...</option>
                        </select>
                        {!rewardOptions.includes(goal.reward) && (
                          <input type="text" value={goal.reward} onChange={(e) => handleGoalChange(student.id, 'reward', e.target.value)}
                            placeholder="Type custom reward..." className="w-full px-2 py-1 border rounded text-sm mt-1" />
                        )}
                      </div>
                      <div className="mt-1">
                        <label className="text-xs text-gray-600">Token Emoji</label>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {TOKEN_EMOJI_OPTIONS.map(em => (
                            <button key={em} onClick={() => handleGoalChange(student.id, 'tokenEmoji', em)}
                              className={`w-7 h-7 rounded text-base hover:bg-gray-100 ${(goal.tokenEmoji || '⭐') === em ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-50'}`}>{em}</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editingGoals); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};



// Clock
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <div className="bg-white rounded-lg px-3 py-1.5 shadow text-xl font-bold" style={{ color: COLORS.text }}>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>;
};

// First/Then (Compact for sidebar)
const FirstThen = ({ firstThen, onEdit }) => (
  <div className="bg-white rounded-lg p-2 shadow-md relative">
    <button onClick={onEdit} className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs">✏️</button>
    <div className="text-xs font-bold text-gray-500 mb-1">FIRST / THEN</div>
    <div className="flex items-center gap-2">
      <div className="flex-1 text-center bg-blue-50 rounded p-1.5">
        <span className="text-xl">{firstThen.firstIcon}</span>
        <div className="text-xs font-medium text-gray-700">{firstThen.firstLabel}</div>
      </div>
      <div className="text-gray-300 font-bold">→</div>
      <div className="flex-1 text-center bg-green-50 rounded p-1.5">
        <span className="text-xl">{firstThen.thenIcon}</span>
        <div className="text-xs font-medium text-gray-700">{firstThen.thenLabel}</div>
      </div>
    </div>
  </div>
);

// Custom Banner
const BANNER_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#6366F1', '#1a1a2e'];
const Banner = ({ text, color, onEdit, onColorChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  if (editing) return (
    <div className="rounded-xl p-3 text-white" style={{ backgroundColor: color }}>
      <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-3 py-2 rounded text-gray-800 text-lg" autoFocus
        onKeyDown={e => { if (e.key === 'Enter') { onEdit(val); setEditing(false); }}} />
      <div className="flex items-center gap-1 mt-2">
        {BANNER_COLORS.map(c => (
          <button key={c} onClick={() => onColorChange(c)}
            className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-white' : ''}`} style={{ backgroundColor: c }} />
        ))}
        <div className="flex-1" />
        <button onClick={() => setEditing(false)} className="px-3 py-1 bg-white/20 rounded text-sm">Cancel</button>
        <button onClick={() => { onEdit(val); setEditing(false); }} className="px-3 py-1 bg-white/30 rounded font-medium text-sm">Save</button>
      </div>
    </div>
  );
  return (
    <div onClick={() => setEditing(true)} className="rounded-xl p-4 text-white text-center cursor-pointer hover:opacity-90 shadow-lg"
      style={{ backgroundColor: color }}>
      <div className="text-2xl" style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800 }}>{text || '\u00A0'}</div>
    </div>
  );
};

// Rotation Announcement
const RotationAnnouncement = ({ show, phase }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" style={{ opacity: show ? 1 : 0, transition: 'opacity 1s ease' }}>
    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-8 py-4 rounded-2xl shadow-2xl" style={{ transform: show ? 'scale(1)' : 'scale(0.9)', transition: 'transform 0.8s ease' }}>
      <div className="text-2xl font-bold text-center">{phase === 'moving' ? '🚶 Moving to next station... 🚶' : '🔄 Rotation Time! 🔄'}</div>
      <div className="text-center mt-1 text-white/90">{phase === 'moving' ? 'Walk calmly to your next group' : 'Time to switch stations'}</div>
    </div>
  </div>
);

const STORAGE_KEY = 'specialedscreen-state';

const loadSaved = (key, fallback) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && key in saved) return saved[key];
  } catch (e) {}
  return fallback;
};

export default function SpecialEdScreen() {
  const [students, setStudents] = useState(() => loadSaved('students', DEFAULT_STUDENTS));
  const [totalTime, setTotalTime] = useState(() => loadSaved('totalTime', 900));
  const [timeRemaining, setTimeRemaining] = useState(() => loadSaved('totalTime', 900));
  const [isRunning, setIsRunning] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(() => loadSaved('autoRepeat', true));
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [rightNowText, setRightNowText] = useState(() => loadSaved('rightNowText', 'Working Quietly'));
  const [bannerColor, setBannerColor] = useState(() => loadSaved('bannerColor', '#0D9488'));
  const [firstThen, setFirstThen] = useState(() => loadSaved('firstThen', { firstIcon: '📚', firstLabel: 'Reading', thenIcon: '🎮', thenLabel: 'Free Time' }));
  const [rotationSound, setRotationSound] = useState(() => loadSaved('rotationSound', 'chime'));
  const [voiceLevel, setVoiceLevel] = useState(() => loadSaved('voiceLevel', 1));
  const [countdownEvent, setCountdownEvent] = useState(() => loadSaved('countdownEvent', 'Lunch'));
  const [countdownTime, setCountdownTime] = useState(() => loadSaved('countdownTime', '12:00'));
  const [quickMessage, setQuickMessage] = useState(() => loadSaved('quickMessage', 'Great job! ⭐'));
  const [starPoints, setStarPoints] = useState(() => loadSaved('starPoints', 0));
  const [studentGoals, setStudentGoals] = useState(() => loadSaved('studentGoals', {}));
  const [customSounds, setCustomSounds] = useState(() => loadSaved('customSounds', []));
  const [stationColors, setStationColors] = useState(() => loadSaved('stationColors', DEFAULT_STATION_COLORS));
  const [rotationOrder, setRotationOrder] = useState(() => loadSaved('rotationOrder', DEFAULT_ROTATION_ORDER));

  // Floor plan tabs - migrate from old format if needed
  const [floorPlans, setFloorPlans] = useState(() => {
    const saved = loadSaved('floorPlans', null);
    if (saved) {
      // Ensure each floor plan has teacherNames (migration for existing saved data)
      return saved.map(fp => ({
        ...fp,
        teacherNames: fp.teacherNames || loadSaved('teacherNames', DEFAULT_TEACHER_NAMES)
      }));
    }
    // Migration: convert old stationConfigs/customBoxes to floor plan tab
    const oldStations = loadSaved('stationConfigs', DEFAULT_STATION_CONFIG);
    const oldBoxes = loadSaved('customBoxes', []);
    const oldTeachers = loadSaved('teacherNames', DEFAULT_TEACHER_NAMES);
    return [{
      id: 'plan-1',
      name: 'Main Layout',
      stationConfigs: oldStations,
      customBoxes: oldBoxes,
      teacherNames: oldTeachers
    }];
  });
  const [activeFloorPlanId, setActiveFloorPlanId] = useState(() => loadSaved('activeFloorPlanId', 'plan-1'));
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Derive current floor plan data from active tab
  const activeFloorPlan = floorPlans.find(fp => fp.id === activeFloorPlanId) || floorPlans[0];
  const stationConfigs = activeFloorPlan.stationConfigs;
  const customBoxes = activeFloorPlan.customBoxes;
  const teacherNames = activeFloorPlan.teacherNames || DEFAULT_TEACHER_NAMES;

  const setStationConfigs = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, stationConfigs: typeof updater === 'function' ? updater(fp.stationConfigs) : updater }
      : fp
    ));
  };
  const setCustomBoxes = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, customBoxes: typeof updater === 'function' ? updater(fp.customBoxes) : updater }
      : fp
    ));
  };
  const setTeacherNames = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, teacherNames: typeof updater === 'function' ? updater(fp.teacherNames || DEFAULT_TEACHER_NAMES) : updater }
      : fp
    ));
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddStationMenu, setShowAddStationMenu] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showFirstThenEditor, setShowFirstThenEditor] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const floorPlanRef = useRef(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementPhase, setAnnouncementPhase] = useState('start');
  const [animationTargets, setAnimationTargets] = useState({});

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        students, totalTime, autoRepeat, rightNowText, bannerColor, firstThen,
        rotationSound, voiceLevel, countdownEvent, countdownTime,
        quickMessage, starPoints, studentGoals, floorPlans, activeFloorPlanId, customSounds, stationColors, rotationOrder
      }));
    } catch (e) {}
  }, [students, totalTime, autoRepeat, rightNowText, bannerColor, firstThen,
      rotationSound, voiceLevel, countdownEvent, countdownTime,
      quickMessage, starPoints, studentGoals, floorPlans, activeFloorPlanId, customSounds, stationColors, rotationOrder]);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { if (autoRepeat) { triggerRotation(); return totalTime; } setIsRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, autoRepeat, totalTime]);
  
  const getNextGroup = (g) => rotationOrder[(rotationOrder.indexOf(g) + 1) % rotationOrder.length];
  
  const triggerRotation = () => {
    if (isAnimating || isEditMode) return;
    playSound(rotationSound, customSounds);
    setShowAnnouncement(true); setAnnouncementPhase('start');
    setTimeout(() => { setAnnouncementPhase('moving'); setIsAnimating(true); const t = {}; students.forEach(s => { t[s.id] = getNextGroup(s.group); }); setAnimationTargets(t); }, 1500);
    setTimeout(() => setShowAnnouncement(false), 3000);
    setTimeout(() => { setStudents(p => p.map(s => ({ ...s, group: getNextGroup(s.group) }))); setAnimationTargets({}); setIsAnimating(false); }, 4500);
  };
  
  const addBox = () => setCustomBoxes(p => [...p, { id: `box-${Date.now()}`, top: 120, left: 180, width: 45, height: 45, label: '', icon: '', color: '#6B7280', assignedStudents: [] }]);

  // Floor plan tab management
  const addFloorPlan = () => {
    const newId = `plan-${Date.now()}`;
    setFloorPlans(prev => [...prev, {
      id: newId,
      name: `Layout ${prev.length + 1}`,
      stationConfigs: {},
      customBoxes: [],
      teacherNames: { ...DEFAULT_TEACHER_NAMES }
    }]);
    setActiveFloorPlanId(newId);
  };

  const addStationToTab = (color) => {
    const defaultPositions = DEFAULT_STATION_CONFIG[color] || { top: 50, left: 50, width: 100, height: 65 };
    setStationConfigs(p => ({ ...p, [color]: { ...defaultPositions } }));
  };

  const removeStationFromTab = (color) => {
    setStationConfigs(p => {
      const next = { ...p };
      delete next[color];
      return next;
    });
  };

  const equalizeStationSizes = () => {
    const stationKeys = rotationOrder.filter(c => stationConfigs[c]);
    // Gather all items: stations + custom boxes
    const allItems = [];
    stationKeys.forEach(c => allItems.push({ type: 'station', key: c, w: stationConfigs[c].width, h: stationConfigs[c].height }));
    customBoxes.forEach(b => allItems.push({ type: 'box', key: b.id, w: b.width, h: b.height }));
    if (allItems.length === 0) return;
    // Use the first item as the reference size
    const targetW = allItems[0].w;
    const targetH = allItems[0].h;
    if (stationKeys.length > 0) {
      setStationConfigs(p => {
        const next = { ...p };
        stationKeys.forEach(c => { next[c] = { ...next[c], width: targetW, height: targetH }; });
        return next;
      });
    }
    if (customBoxes.length > 0) {
      setCustomBoxes(p => p.map(b => ({ ...b, width: targetW, height: targetH })));
    }
  };

  const deleteFloorPlan = (id) => {
    if (floorPlans.length <= 1) return;
    if (!window.confirm('Delete this floor plan layout?')) return;
    setFloorPlans(prev => prev.filter(fp => fp.id !== id));
    if (activeFloorPlanId === id) {
      setActiveFloorPlanId(floorPlans.find(fp => fp.id !== id).id);
    }
  };

  const startRenamingTab = (id, currentName) => {
    setRenamingTabId(id);
    setRenameValue(currentName);
  };

  const finishRenamingTab = () => {
    if (renamingTabId && renameValue.trim()) {
      setFloorPlans(prev => prev.map(fp => fp.id === renamingTabId ? { ...fp, name: renameValue.trim() } : fp));
    }
    setRenamingTabId(null);
  };

  return (
    <div className="h-screen overflow-hidden p-2 flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} />
      {showStudentManager && <StudentManager students={students} onUpdate={setStudents} onClose={() => setShowStudentManager(false)} teacherNames={teacherNames} onUpdateTeachers={setTeacherNames} stationColors={stationColors} onUpdateStationColors={setStationColors} rotationOrder={rotationOrder} onUpdateRotationOrder={setRotationOrder} />}
      {showFirstThenEditor && <FirstThenEditor firstThen={firstThen} onUpdate={setFirstThen} onClose={() => setShowFirstThenEditor(false)} />}
      {showGoalEditor && <GoalEditorModal students={students} goals={studentGoals} onUpdate={setStudentGoals} onClose={() => setShowGoalEditor(false)} />}
      {editingBox && <CustomBoxEditor box={editingBox} onUpdate={(b) => setCustomBoxes(p => p.map(x => x.id === b.id ? b : x))} onDelete={(id) => setCustomBoxes(p => p.filter(x => x.id !== id))} onClose={() => setEditingBox(null)} students={students} />}
      {selectedStudentId && (() => {
        const student = students.find(s => s.id === selectedStudentId);
        const goal = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: false };
        return <TokenPopup student={student} goal={goal}
          onAddToken={() => {
            const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
            if (g.tokens < g.goal) {
              setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: g.tokens + 1 } }));
            }
          }}
          onRemoveToken={() => {
            const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
            if (g.tokens > 0) setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: g.tokens - 1 } }));
          }}
          onResetTokens={() => {
            const g = studentGoals[selectedStudentId] || { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true };
            setStudentGoals(prev => ({ ...prev, [selectedStudentId]: { ...g, tokens: 0 } }));
          }}
          onClose={() => setSelectedStudentId(null)} />;
      })()}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>🎓</div>
          <h1 className="text-lg font-bold" style={{ color: COLORS.text }}>SpecialEdScreen</h1>
          <Clock />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowStudentManager(true)} className="px-2 py-1 bg-white rounded shadow-sm text-xs">👥 Students/Teachers</button>
          {isEditMode && <button onClick={addBox} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">➕ Box</button>}
          {isEditMode && <button onClick={equalizeStationSizes} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">⬜ Equal Size</button>}
          {isEditMode && (() => {
            const missingStations = rotationOrder.filter(c => !stationConfigs[c]);
            return missingStations.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowAddStationMenu(!showAddStationMenu)} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">➕ Station</button>
                {showAddStationMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[120px]">
                    {missingStations.map(c => {
                      const s = stationColors[c] || COLORS.stations[c];
                      return (
                        <button key={c} onClick={() => { addStationToTab(c); setShowAddStationMenu(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.bg }} />
                          {teacherNames[c]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          <button onClick={() => { setIsEditMode(!isEditMode); setShowAddStationMenu(false); }} className={`px-2 py-1 rounded text-xs ${isEditMode ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
            {isEditMode ? '✓ Done' : '✏️ Edit'}
          </button>
        </div>
      </div>
      
      {/* Right Now */}
      <div className="mb-2 flex-shrink-0">
        <Banner text={rightNowText} color={bannerColor} onEdit={setRightNowText} onColorChange={setBannerColor} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left Column: Floor Plan */}
        <div className="flex flex-col gap-0" style={{ width: '55%' }}>
          {/* Floor Plan Tab Bar */}
          <div className="flex items-center gap-0.5 px-1 pb-0 bg-transparent">
            {floorPlans.map(fp => (
              <div key={fp.id}
                className={`group flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs cursor-pointer select-none ${fp.id === activeFloorPlanId ? 'bg-white shadow-sm font-bold text-gray-800' : 'bg-gray-200/70 text-gray-500 hover:bg-gray-200'}`}
                onClick={() => setActiveFloorPlanId(fp.id)}
                onDoubleClick={() => startRenamingTab(fp.id, fp.name)}>
                {renamingTabId === fp.id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={finishRenamingTab}
                    onKeyDown={(e) => { if (e.key === 'Enter') finishRenamingTab(); if (e.key === 'Escape') setRenamingTabId(null); }}
                    className="w-20 px-1 py-0 text-xs border rounded bg-white"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[100px]">{fp.name}</span>
                )}
                {floorPlans.length > 1 && fp.id === activeFloorPlanId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFloorPlan(fp.id); }}
                    className="text-gray-400 hover:text-red-500 text-xs leading-none ml-0.5">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button onClick={addFloorPlan} className="px-1.5 py-1 rounded-t-lg text-xs bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="Add new layout">+</button>
          </div>
          {/* Floor Plan */}
          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-lg p-2 flex-1 flex flex-col min-h-0">
            <div ref={floorPlanRef} className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
              style={{ border: isEditMode ? '2px dashed #3B82F6' : '2px solid #e5e7eb' }}>
              <div className="absolute inset-2 border-2 border-gray-300 rounded bg-gray-50/50" />
              {rotationOrder.filter(c => stationConfigs[c]).map(c => <DraggableStation key={c} color={c} config={stationConfigs[c]} onUpdate={(col, cfg) => setStationConfigs(p => ({ ...p, [col]: cfg }))} isEditMode={isEditMode} isTarget={isAnimating && Object.values(animationTargets).includes(c)} containerRef={floorPlanRef} students={students} teacherName={teacherNames[c]} stationColors={stationColors} onRemove={removeStationFromTab} />)}
              {customBoxes.map(b => <DraggableBox key={b.id} box={b} onUpdate={(ub) => setCustomBoxes(p => p.map(x => x.id === ub.id ? ub : x))} isEditMode={isEditMode} containerRef={floorPlanRef} onEdit={setEditingBox} students={students} />)}
              {!isEditMode && students.filter(s => stationConfigs[s.group]).map(s => { const grp = students.filter(x => x.group === s.group && stationConfigs[x.group]); return <AnimatedStudent key={s.id} name={s.name} photo={s.photo} emoji={s.emoji} stationConfigs={stationConfigs} currentGroup={s.group} targetGroup={animationTargets[s.id] || s.group} isAnimating={isAnimating} index={grp.findIndex(x => x.id === s.id)} groupSize={grp.length} onClick={() => setSelectedStudentId(s.id)} />; })}
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0 overflow-y-auto">
          {/* Timer */}
          <Timer timeRemaining={timeRemaining} totalTime={totalTime} isRunning={isRunning && !isEditMode} onTimeChange={setTimeRemaining} onTotalTimeChange={setTotalTime} disabled={isEditMode || isAnimating} />
          
          {/* Controls */}
          <div className="bg-white rounded-lg p-2 shadow-md flex flex-wrap gap-1.5 justify-center">
            <button onClick={() => setIsRunning(!isRunning)} className="px-4 py-2 rounded-lg font-bold text-white text-sm"
              style={{ backgroundColor: isRunning ? '#FF8A7A' : '#5BC0BE', opacity: isAnimating || isEditMode ? 0.5 : 1 }} disabled={isAnimating || isEditMode}>
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button onClick={() => setTimeRemaining(totalTime)} className="px-3 py-2 rounded-lg font-bold bg-gray-200 text-gray-700 text-sm"
              style={{ opacity: isAnimating || isEditMode ? 0.5 : 1 }} disabled={isAnimating || isEditMode}>↺</button>
            <button onClick={triggerRotation} className="px-3 py-2 rounded-lg font-bold text-sm"
              style={{ backgroundColor: isAnimating ? '#FEF3C7' : '#E5E7EB', color: isAnimating ? '#D97706' : '#374151', opacity: isEditMode ? 0.5 : 1 }} disabled={isAnimating || isEditMode}>
              ⏭ Next
            </button>
            <button onClick={() => setAutoRepeat(!autoRepeat)} className={`px-3 py-2 rounded-lg font-bold text-sm ${autoRepeat ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
              style={{ opacity: isEditMode ? 0.5 : 1 }} disabled={isEditMode}>{autoRepeat ? '🔁' : '👆'}</button>
          </div>
          
          {/* Sound Selector */}
          <SoundSelector selectedSound={rotationSound} onSelect={setRotationSound} customSounds={customSounds} onCustomSoundsChange={setCustomSounds} />
          
          {/* Token Board Setup */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-purple-600">🎯 TOKEN BOARD</div>
              <button onClick={() => setShowGoalEditor(true)} className="text-xs bg-white/50 hover:bg-white/80 px-2 py-1 rounded">✏️ Setup</button>
            </div>
            <div className="text-xs text-gray-500 mt-1">Click a student on the floor plan to view tokens</div>
          </div>

          {/* Voice Level */}
          <VoiceLevel level={voiceLevel} onChange={setVoiceLevel} />
          
          {/* First/Then */}
          <FirstThen firstThen={firstThen} onEdit={() => setShowFirstThenEditor(true)} />

          {/* Station Groups */}
          <StationGroups students={students} isAnimating={isAnimating} animationTargets={animationTargets} teacherNames={teacherNames} stationColors={stationColors} rotationOrder={rotationOrder} />
        </div>
      </div>
    </div>
  );
}
