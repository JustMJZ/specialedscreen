import React, { useState, useEffect, useRef } from 'react';

const COLORS = {
  background: '#FDF8F3',
  primary: '#FF8A7A',
  secondary: '#5BC0BE',
  text: '#3D3D3D',
  stations: {
    purple: { bg: '#B39DDB', light: '#E1D5F0', name: 'Ms. Angie' },
    yellow: { bg: '#FFE082', light: '#FFF3C4', name: 'Ms. Maggie' },
    blue: { bg: '#81D4FA', light: '#D0EFFF', name: 'Mrs. Childress' },
    green: { bg: '#A5D6A7', light: '#D7F0D8', name: 'Mr. Michael' },
    pink: { bg: '#F8BBD9', light: '#FDE4F0', name: 'Ms. Sonya' }
  }
};

const DEFAULT_STUDENTS = [
  { id: 1, name: 'Emma', group: 'purple' },
  { id: 2, name: 'Liam', group: 'purple' },
  { id: 3, name: 'Olivia', group: 'yellow' },
  { id: 4, name: 'Noah', group: 'yellow' },
  { id: 5, name: 'Ava', group: 'blue' },
  { id: 6, name: 'Elijah', group: 'blue' },
  { id: 7, name: 'Sophia', group: 'green' },
  { id: 8, name: 'James', group: 'green' },
  { id: 9, name: 'Isabella', group: 'pink' },
  { id: 10, name: 'William', group: 'pink' }
];

const ROTATION_ORDER = ['purple', 'yellow', 'blue', 'green', 'pink'];

const DEFAULT_STATION_CONFIG = {
  yellow: { top: 12, left: 40, width: 100, height: 65 },
  blue: { top: 12, left: 155, width: 100, height: 65 },
  green: { top: 12, left: 270, width: 100, height: 65 },
  purple: { top: 110, left: 12, width: 75, height: 115 },
  pink: { top: 210, left: 155, width: 110, height: 65 }
};

const DEFAULT_TV_CONFIG = { top: 95, left: 330, width: 38, height: 100, label: 'TV', icon: '📺', color: '#1a1a2e' };

const EMOJI_OPTIONS = ['📺', '🚪', '📚', '🎨', '🧸', '🪑', '🗄️', '🖥️', '📦', '🎵', '🧩', '✏️', '📐', '🗑️', '🚿', '🪴'];

// Sound options
const ROTATION_SOUNDS = [
  { id: 'none', name: '🔇 None' },
  { id: 'chime', name: '🔔 Chime' },
  { id: 'buzzer', name: '📢 Buzzer' },
  { id: 'bell', name: '🛎️ School Bell' },
  { id: 'whistle', name: '📯 Whistle' },
  { id: 'marimba', name: '🎵 Marimba' },
  { id: 'gong', name: '🔊 Gong' },
  { id: 'birds', name: '🐦 Birds Chirping' },
  { id: 'clap', name: '👏 Clap Pattern' },
  { id: 'train', name: '🚂 Train Horn' },
];

// Play distinct sounds
const playSound = (soundId) => {
  if (soundId === 'none') return;
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = (freq, start, duration, type = 'sine', gain = 0.3) => {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gainNode.gain.setValueAtTime(gain, audioContext.currentTime + start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + duration);
      osc.start(audioContext.currentTime + start);
      osc.stop(audioContext.currentTime + start + duration);
    };
    
    const playNoise = (start, duration, gain = 0.2) => {
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      noise.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 1000;
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(gain, audioContext.currentTime + start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + duration);
      noise.start(audioContext.currentTime + start);
      noise.stop(audioContext.currentTime + start + duration);
    };

    switch (soundId) {
      case 'chime':
        playTone(523, 0, 0.4, 'sine', 0.2);
        playTone(659, 0.15, 0.4, 'sine', 0.2);
        playTone(784, 0.3, 0.6, 'sine', 0.25);
        break;
      case 'buzzer':
        playTone(220, 0, 0.15, 'sawtooth', 0.4);
        playTone(220, 0.2, 0.15, 'sawtooth', 0.4);
        playTone(220, 0.4, 0.3, 'sawtooth', 0.5);
        break;
      case 'bell':
        playTone(880, 0, 0.5, 'sine', 0.3);
        playTone(880, 0.08, 0.4, 'sine', 0.2);
        playTone(880, 0.5, 0.5, 'sine', 0.3);
        playTone(880, 0.58, 0.4, 'sine', 0.2);
        break;
      case 'whistle':
        playTone(1800, 0, 0.1, 'sine', 0.3);
        playTone(2200, 0.1, 0.4, 'sine', 0.4);
        playTone(1800, 0.5, 0.1, 'sine', 0.3);
        playTone(2200, 0.6, 0.3, 'sine', 0.35);
        break;
      case 'marimba':
        playTone(392, 0, 0.3, 'sine', 0.3);
        playTone(440, 0.2, 0.3, 'sine', 0.3);
        playTone(523, 0.4, 0.3, 'sine', 0.3);
        playTone(659, 0.6, 0.5, 'sine', 0.35);
        break;
      case 'gong':
        playTone(80, 0, 1.5, 'sine', 0.5);
        playTone(120, 0, 1.2, 'sine', 0.3);
        playTone(160, 0, 1.0, 'sine', 0.2);
        playNoise(0, 0.3, 0.15);
        break;
      case 'birds':
        playTone(2000, 0, 0.08, 'sine', 0.2);
        playTone(2400, 0.1, 0.08, 'sine', 0.2);
        playTone(2000, 0.2, 0.08, 'sine', 0.2);
        playTone(1800, 0.35, 0.1, 'sine', 0.2);
        playTone(2200, 0.5, 0.08, 'sine', 0.2);
        playTone(2600, 0.6, 0.15, 'sine', 0.25);
        break;
      case 'clap':
        playNoise(0, 0.05, 0.5);
        playNoise(0.2, 0.05, 0.5);
        playNoise(0.4, 0.05, 0.4);
        playNoise(0.5, 0.05, 0.4);
        playNoise(0.6, 0.05, 0.5);
        break;
      case 'train':
        playTone(277, 0, 0.8, 'sawtooth', 0.25);
        playTone(311, 0, 0.8, 'sawtooth', 0.25);
        playTone(370, 0, 0.8, 'sawtooth', 0.2);
        break;
      default:
        playTone(440, 0, 0.3, 'sine', 0.3);
    }
  } catch (e) {
    console.log('Audio not supported');
  }
};

// Student Manager Modal
const StudentManager = ({ students, onUpdate, onClose }) => {
  const [editingStudents, setEditingStudents] = useState([...students]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit Students</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3 overflow-y-auto max-h-[50vh]">
          <div className="space-y-2">
            {editingStudents.map(student => (
              <div key={student.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input type="text" value={student.name}
                  onChange={(e) => setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, name: e.target.value } : s))}
                  className="flex-1 px-2 py-1 border rounded text-sm" />
                <select value={student.group}
                  onChange={(e) => setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, group: e.target.value } : s))}
                  className="px-2 py-1 border rounded text-sm" style={{ backgroundColor: COLORS.stations[student.group].light }}>
                  {ROTATION_ORDER.map(color => (<option key={color} value={color}>{COLORS.stations[color].name}</option>))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editingStudents); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
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
                  className={`px-2 py-1 rounded text-xs ${editing.firstIcon === a.icon ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-green-600 mb-1">THEN</label>
            <div className="flex flex-wrap gap-1">
              {activities.map(a => (
                <button key={a.icon} onClick={() => setEditing(p => ({ ...p, thenIcon: a.icon, thenLabel: a.label }))}
                  className={`px-2 py-1 rounded text-xs ${editing.thenIcon === a.icon ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-100'}`}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
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
const CustomBoxEditor = ({ box, onUpdate, onDelete, onClose }) => {
  const [editing, setEditing] = useState({ ...box });
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">✏️ Edit Box</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-3">
          <input type="text" value={editing.label} onChange={(e) => setEditing(p => ({ ...p, label: e.target.value }))}
            className="w-full px-2 py-1 border rounded text-sm mb-2" placeholder="Label" />
          <div className="flex flex-wrap gap-1 mb-2">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEditing(p => ({ ...p, icon: e }))}
                className={`w-8 h-8 rounded text-lg ${editing.icon === e ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100'}`}>{e}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(c => (
              <button key={c} onClick={() => setEditing(p => ({ ...p, color: c }))}
                className={`w-6 h-6 rounded-full ${editing.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
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

// Animated student
const AnimatedStudent = ({ name, stationConfigs, currentGroup, targetGroup, isAnimating, index }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['#FF8A7A', '#5BC0BE', '#7BC47F', '#FFD166', '#B39DDB'];
  const group = isAnimating ? targetGroup : currentGroup;
  const config = stationConfigs[group];
  const isVertical = config.height > config.width;
  
  // Scale student avatars based on box size
  const minDim = Math.min(config.width, config.height);
  const avatarScale = Math.max(0.5, Math.min(1, minDim / 80));
  const avatarSize = Math.max(16, 28 * avatarScale);
  const nameSize = Math.max(6, 10 * avatarScale);
  
  let left = isVertical ? config.left + (config.width / 2) - (avatarSize / 2) : config.left + 12 + (index * (avatarSize + 8));
  let top = isVertical ? config.top + 18 + (index * (avatarSize + 14)) : config.top + 18;
  
  return (
    <div className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
      style={{ top, left, transition: 'all 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)', zIndex: isAnimating ? 20 : 10 }}>
      <div className="rounded-full flex items-center justify-center text-white font-bold shadow-lg"
        style={{ width: avatarSize, height: avatarSize, fontSize: avatarSize * 0.4, backgroundColor: colors[name.charCodeAt(0) % 5], boxShadow: isAnimating ? `0 4px 15px ${colors[name.charCodeAt(0) % 5]}80` : '0 2px 6px rgba(0,0,0,0.15)' }}>
        {initials}
      </div>
      <span className="font-medium text-gray-700 bg-white/90 px-0.5 rounded shadow-sm whitespace-nowrap" style={{ fontSize: nameSize }}>{name}</span>
    </div>
  );
};

// Draggable station - FIXED: All text scales with box
const DraggableStation = ({ color, config, onUpdate, isEditMode, isTarget, containerRef, students }) => {
  const station = COLORS.stations[color];
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  
  // Calculate scale based on box dimensions
  const minDim = Math.min(config.width, config.height);
  const maxDim = Math.max(config.width, config.height);
  const scale = Math.max(0.3, Math.min(1.2, minDim / 80));
  
  // Scale all text elements
  const teacherFontSize = Math.max(7, Math.floor(12 * scale));
  const studentFontSize = Math.max(5, Math.floor(9 * scale));
  const dotSize = Math.max(4, Math.floor(8 * scale));
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
        <span className="font-bold text-gray-700 truncate" style={{ fontSize: teacherFontSize, lineHeight: 1.1 }}>{station.name}</span>
      </div>
      
      {/* Student names - scale with box */}
      {!isEditMode && stationStudents.length > 0 && (
        <div className="overflow-hidden" style={{ paddingLeft: padding, paddingRight: padding }}>
          <div className="text-gray-500 truncate" style={{ fontSize: studentFontSize, lineHeight: 1.2 }}>
            {stationStudents.map(s => s.name.split(' ')[0]).join(', ')}
          </div>
        </div>
      )}
      
      {isEditMode && <div data-resize="true" className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" style={{ background: `linear-gradient(135deg, transparent 50%, ${station.bg} 50%)` }}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }} />}
    </div>
  );
};

// Draggable custom box
const DraggableBox = ({ box, onUpdate, isEditMode, containerRef, onEdit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  
  const minDim = Math.min(box.width, box.height);
  const scale = Math.max(0.5, Math.min(1, minDim / 50));
  
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
  
  return (
    <div ref={ref} className={`absolute rounded flex flex-col items-center justify-center shadow-lg select-none overflow-hidden ${isEditMode ? 'cursor-move' : ''}`}
      style={{ top: box.top, left: box.left, width: box.width, height: box.height, backgroundColor: box.color, zIndex: isDragging || isResizing ? 100 : 4 }}
      onMouseDown={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; e.preventDefault(); const r = ref.current.getBoundingClientRect(); setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top }); setIsDragging(true); }}
      onTouchStart={(e) => { if (!isEditMode || e.target.dataset.resize || e.target.dataset.edit) return; const t = e.touches[0]; const r = ref.current.getBoundingClientRect(); setDragOffset({ x: t.clientX - r.left, y: t.clientY - r.top }); setIsDragging(true); }}>
      <div style={{ fontSize: Math.max(10, 16 * scale) }}>{box.icon}</div>
      <div className="text-white font-bold truncate px-1 text-center w-full" style={{ fontSize: Math.max(6, 9 * scale) }}>{box.label}</div>
      {isEditMode && <>
        <button data-edit="true" onClick={(e) => { e.stopPropagation(); onEdit(box); }} className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">✏️</button>
        <div data-resize="true" className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsResizing(true); }} onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }} />
      </>}
    </div>
  );
};

// Station Groups (compact)
const StationGroups = ({ students, isAnimating, animationTargets }) => (
  <div className="bg-white rounded-lg p-1.5 shadow-md">
    <div className="text-xs font-bold text-gray-500 mb-1">GROUPS</div>
    <div className="grid grid-cols-1 gap-0.5">
      {ROTATION_ORDER.map(color => {
        const s = COLORS.stations[color];
        const grp = students.filter(st => st.group === color);
        const isTarget = isAnimating && Object.values(animationTargets).includes(color);
        return (
          <div key={color} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs" 
            style={{ backgroundColor: s.light, border: `1px solid ${s.bg}`, opacity: isAnimating && !isTarget ? 0.5 : 1 }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.bg }} />
            <span className="font-bold text-gray-700">{s.name.split(' ')[1] || s.name}</span>
            <span className="text-gray-500 truncate flex-1">: {grp.map(st => st.name.split(' ')[0]).join(', ')}</span>
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
    <div className="bg-white rounded-lg p-2 shadow-md">
      <div className="flex items-center justify-between mb-1">
        <span className="text-3xl font-bold" style={{ color: COLORS.text }}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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

// Sound Dropdown Selector
const SoundSelector = ({ selectedSound, onSelect }) => (
  <div className="bg-white rounded-lg p-2 shadow-md">
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-500">🔊 SOUND:</span>
      <select value={selectedSound} onChange={(e) => { onSelect(e.target.value); playSound(e.target.value); }}
        className="flex-1 px-2 py-1 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300">
        {ROTATION_SOUNDS.map(sound => (<option key={sound.id} value={sound.id}>{sound.name}</option>))}
      </select>
      <button onClick={() => playSound(selectedSound)} className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200">▶</button>
    </div>
  </div>
);

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

// Traffic Light
const TrafficLight = ({ color, onChange }) => (
  <div className="bg-gray-800 rounded-lg p-1.5 flex gap-1 items-center">
    {['red', 'yellow', 'green'].map(c => (
      <button key={c} onClick={() => onChange(c)} className={`w-6 h-6 rounded-full transition-all ${color === c ? 'scale-110' : 'opacity-30'}`}
        style={{ backgroundColor: c === 'red' ? '#EF4444' : c === 'yellow' ? '#FBBF24' : '#22C55E', boxShadow: color === c ? `0 0 10px ${c === 'red' ? '#EF4444' : c === 'yellow' ? '#FBBF24' : '#22C55E'}` : 'none' }} />
    ))}
  </div>
);

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

// Right Now Widget
const RightNow = ({ text, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);
  if (editing) return (
    <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl p-3 text-white">
      <input value={val} onChange={e => setVal(e.target.value)} className="w-full px-3 py-2 rounded text-gray-800 text-lg" autoFocus 
        onKeyDown={e => { if (e.key === 'Enter') { onEdit(val); setEditing(false); }}} />
      <div className="flex gap-2 mt-2 justify-end">
        <button onClick={() => setEditing(false)} className="px-3 py-1 bg-white/20 rounded text-sm">Cancel</button>
        <button onClick={() => { onEdit(val); setEditing(false); }} className="px-3 py-1 bg-white/30 rounded font-medium text-sm">Save</button>
      </div>
    </div>
  );
  return (
    <div onClick={() => setEditing(true)} className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl p-4 text-white text-center cursor-pointer hover:opacity-90 shadow-lg">
      <div className="text-sm opacity-90 font-medium">RIGHT NOW WE ARE...</div>
      <div className="text-2xl font-bold mt-1">{text}</div>
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

export default function SpecialEdScreen() {
  const [students, setStudents] = useState(DEFAULT_STUDENTS);
  const [totalTime, setTotalTime] = useState(900);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [isRunning, setIsRunning] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(true);
  const [trafficLight, setTrafficLight] = useState('green');
  const [pickedStudent, setPickedStudent] = useState(null);
  const [rightNowText, setRightNowText] = useState('Working Quietly 🤫');
  const [firstThen, setFirstThen] = useState({ firstIcon: '📚', firstLabel: 'Reading', thenIcon: '🎮', thenLabel: 'Free Time' });
  const [rotationSound, setRotationSound] = useState('chime');
  const [voiceLevel, setVoiceLevel] = useState(1);
  const [countdownEvent, setCountdownEvent] = useState('Lunch');
  const [countdownTime, setCountdownTime] = useState('12:00');
  const [quickMessage, setQuickMessage] = useState('Great job! ⭐');
  const [starPoints, setStarPoints] = useState(0);
  
  const [stationConfigs, setStationConfigs] = useState(DEFAULT_STATION_CONFIG);
  const [customBoxes, setCustomBoxes] = useState([{ id: 'tv', ...DEFAULT_TV_CONFIG }]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showFirstThenEditor, setShowFirstThenEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const floorPlanRef = useRef(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementPhase, setAnnouncementPhase] = useState('start');
  const [animationTargets, setAnimationTargets] = useState({});
  
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
  
  const getNextGroup = (g) => ROTATION_ORDER[(ROTATION_ORDER.indexOf(g) + 1) % 5];
  
  const triggerRotation = () => {
    if (isAnimating || isEditMode) return;
    playSound(rotationSound);
    setShowAnnouncement(true); setAnnouncementPhase('start');
    setTimeout(() => { setAnnouncementPhase('moving'); setIsAnimating(true); const t = {}; students.forEach(s => { t[s.id] = getNextGroup(s.group); }); setAnimationTargets(t); }, 1500);
    setTimeout(() => setShowAnnouncement(false), 3000);
    setTimeout(() => { setStudents(p => p.map(s => ({ ...s, group: getNextGroup(s.group) }))); setAnimationTargets({}); setIsAnimating(false); }, 4500);
  };
  
  const pickRandom = () => { const s = students[Math.floor(Math.random() * students.length)]; setPickedStudent(s); setTimeout(() => setPickedStudent(null), 3000); };
  const addBox = () => setCustomBoxes(p => [...p, { id: `box-${Date.now()}`, top: 120, left: 180, width: 45, height: 45, label: 'New', icon: '📦', color: '#6B7280' }]);

  return (
    <div className="h-screen overflow-hidden p-2 flex flex-col" style={{ backgroundColor: COLORS.background }}>
      <RotationAnnouncement show={showAnnouncement} phase={announcementPhase} />
      {showStudentManager && <StudentManager students={students} onUpdate={setStudents} onClose={() => setShowStudentManager(false)} />}
      {showFirstThenEditor && <FirstThenEditor firstThen={firstThen} onUpdate={setFirstThen} onClose={() => setShowFirstThenEditor(false)} />}
      {editingBox && <CustomBoxEditor box={editingBox} onUpdate={(b) => setCustomBoxes(p => p.map(x => x.id === b.id ? b : x))} onDelete={(id) => setCustomBoxes(p => p.filter(x => x.id !== id))} onClose={() => setEditingBox(null)} />}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>🎓</div>
          <h1 className="text-lg font-bold" style={{ color: COLORS.text }}>SpecialEdScreen</h1>
          <Clock />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowStudentManager(true)} className="px-2 py-1 bg-white rounded shadow-sm text-xs">👥 Students</button>
          {isEditMode && <button onClick={addBox} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">➕ Box</button>}
          <button onClick={() => setIsEditMode(!isEditMode)} className={`px-2 py-1 rounded text-xs ${isEditMode ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
            {isEditMode ? '✓ Done' : '✏️ Edit'}
          </button>
        </div>
      </div>
      
      {/* Right Now */}
      <div className="mb-2 flex-shrink-0">
        <RightNow text={rightNowText} onEdit={setRightNowText} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex gap-2 min-h-0">
        {/* Left Column: Floor Plan + Bottom Left Widgets */}
        <div className="flex flex-col gap-2" style={{ width: '55%' }}>
          {/* Floor Plan */}
          <div className="bg-white rounded-xl shadow-lg p-2 flex-1 flex flex-col min-h-0">
            <div ref={floorPlanRef} className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
              style={{ border: isEditMode ? '2px dashed #3B82F6' : '2px solid #e5e7eb' }}>
              <div className="absolute inset-2 border-2 border-gray-300 rounded bg-gray-50/50" />
              {ROTATION_ORDER.map(c => <DraggableStation key={c} color={c} config={stationConfigs[c]} onUpdate={(col, cfg) => setStationConfigs(p => ({ ...p, [col]: cfg }))} isEditMode={isEditMode} isTarget={isAnimating && Object.values(animationTargets).includes(c)} containerRef={floorPlanRef} students={students} />)}
              {customBoxes.map(b => <DraggableBox key={b.id} box={b} onUpdate={(ub) => setCustomBoxes(p => p.map(x => x.id === ub.id ? ub : x))} isEditMode={isEditMode} containerRef={floorPlanRef} onEdit={setEditingBox} />)}
              {!isEditMode && students.map(s => { const grp = students.filter(x => x.group === s.group); return <AnimatedStudent key={s.id} name={s.name} stationConfigs={stationConfigs} currentGroup={s.group} targetGroup={animationTargets[s.id] || s.group} isAnimating={isAnimating} index={grp.findIndex(x => x.id === s.id)} />; })}
              <div className="absolute bg-amber-700 rounded" style={{ bottom: 6, left: 40, width: 30, height: 5, zIndex: 4 }} />
              <div className="absolute text-xs text-gray-400" style={{ bottom: 0, left: 38, fontSize: '9px' }}>Door</div>
            </div>
          </div>
          
          {/* Bottom Left Widgets */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex-1">
              <CountdownWidget event={countdownEvent} targetTime={countdownTime} onEdit={(e, t) => { setCountdownEvent(e); setCountdownTime(t); }} />
            </div>
            <div className="flex-1">
              <StarPoints points={starPoints} onAdd={() => setStarPoints(p => p + 1)} onSubtract={() => setStarPoints(p => Math.max(0, p - 1))} onReset={() => setStarPoints(0)} />
            </div>
          </div>
          
          {/* Quick Message */}
          <div className="flex-shrink-0">
            <QuickMessage message={quickMessage} onEdit={setQuickMessage} />
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
          <SoundSelector selectedSound={rotationSound} onSelect={setRotationSound} />
          
          {/* Traffic Light + Random Picker */}
          <div className="flex gap-2">
            <TrafficLight color={trafficLight} onChange={setTrafficLight} />
            <div className="flex-1 bg-white rounded-lg p-2 shadow-md">
              {pickedStudent ? (
                <div className="text-center"><span className="text-lg">🎉</span><span className="font-bold ml-1" style={{ color: COLORS.primary }}>{pickedStudent.name}</span></div>
              ) : (
                <button onClick={pickRandom} className="w-full py-1.5 rounded-lg font-bold text-white text-sm" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>🎲 Pick Student</button>
              )}
            </div>
          </div>
          
          {/* Voice Level */}
          <VoiceLevel level={voiceLevel} onChange={setVoiceLevel} />
          
          {/* First/Then */}
          <FirstThen firstThen={firstThen} onEdit={() => setShowFirstThenEditor(true)} />
          
          {/* Station Groups */}
          <StationGroups students={students} isAnimating={isAnimating} animationTargets={animationTargets} />
        </div>
      </div>
    </div>
  );
}
