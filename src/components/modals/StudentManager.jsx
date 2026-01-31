import React, { useState } from 'react';
import { STUDENT_EMOJI_OPTIONS, STATION_COLOR_OPTIONS } from '../../constants';

const StudentManager = ({ students, onUpdate, onClose, teacherNames, onUpdateTeachers, stationColors, onUpdateStationColors, rotationOrder, onUpdateRotationOrder, customStationKeys, customStationColors, onUpdateCustomStationColors }) => {
  const [editingStudents, setEditingStudents] = useState([...students]);
  const [editingTeachers, setEditingTeachers] = useState({ ...teacherNames });
  const [editingColors, setEditingColors] = useState({ ...stationColors });
  const [editingOrder, setEditingOrder] = useState([...rotationOrder]);
  const [editingCustomColors, setEditingCustomColors] = useState({ ...customStationColors });
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
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit Students/Stations</h2>
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
                    className="px-2 py-1 border rounded text-sm" style={{ backgroundColor: editingColors[student.group]?.light || editingCustomColors[student.group]?.light || '#eee' }}>
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
              <div key={color} className="rounded-lg overflow-hidden border" style={{ borderColor: (editingColors[color] || editingCustomColors[color])?.bg || '#ccc' }}>
                <div className="flex items-center gap-2 px-2 py-1.5" style={{ backgroundColor: (editingColors[color] || editingCustomColors[color])?.light || '#eee' }}>
                  <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}.</span>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: (editingColors[color] || editingCustomColors[color])?.bg || '#ccc' }} />
                  <input type="text" value={editingTeachers[color] || ''}
                    onChange={(e) => setEditingTeachers(prev => ({ ...prev, [color]: e.target.value }))}
                    className="flex-1 px-2 py-1 border rounded text-sm bg-white" />
                  <button onClick={() => { if (idx === 0) return; setEditingOrder(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; }); }}
                    className="text-xs px-1.5 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-30" disabled={idx === 0}>▲</button>
                  <button onClick={() => { if (idx === editingOrder.length - 1) return; setEditingOrder(prev => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; }); }}
                    className="text-xs px-1.5 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-30" disabled={idx === editingOrder.length - 1}>▼</button>
                </div>
                <div className="flex gap-1 px-2 py-1 bg-white/60">
                  {STATION_COLOR_OPTIONS.map(opt => {
                    const currentBg = (editingColors[color] || editingCustomColors[color])?.bg;
                    return (
                      <button key={opt.label} onClick={() => {
                        if (editingCustomColors[color]) {
                          setEditingCustomColors(prev => ({ ...prev, [color]: { bg: opt.bg, light: opt.light } }));
                        } else {
                          setEditingColors(prev => ({ ...prev, [color]: { bg: opt.bg, light: opt.light } }));
                        }
                      }}
                        className={`w-5 h-5 rounded-full border-2 ${currentBg === opt.bg ? 'border-gray-800 ring-1 ring-gray-400' : 'border-transparent'}`}
                        style={{ backgroundColor: opt.bg }} title={opt.label} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        {customStationKeys && customStationKeys.length > 0 && (
          <div className="p-3 border-t border-b bg-teal-50">
            <div className="text-sm font-bold text-gray-700 mb-2">Custom Stations (this tab)</div>
            <div className="space-y-2">
              {customStationKeys.map(key => (
                <div key={key} className="rounded-lg overflow-hidden border" style={{ borderColor: editingCustomColors[key]?.bg || '#9CA3AF' }}>
                  <div className="flex items-center gap-2 px-2 py-1.5" style={{ backgroundColor: editingCustomColors[key]?.light || '#E5E7EB' }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: editingCustomColors[key]?.bg || '#9CA3AF' }} />
                    <input type="text" value={editingTeachers[key] || ''}
                      onChange={(e) => setEditingTeachers(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-2 py-1 border rounded text-sm bg-white" />
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-white/60">
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
                      <input type="checkbox" checked={editingOrder.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingOrder(prev => [...prev, key]);
                          } else {
                            setEditingOrder(prev => prev.filter(k => k !== key));
                            const firstRemaining = editingOrder.find(k => k !== key);
                            if (firstRemaining) {
                              setEditingStudents(prev => prev.map(s => s.group === key ? { ...s, group: firstRemaining } : s));
                            }
                          }
                        }} />
                      Include in rotation
                    </label>
                  </div>
                  <div className="flex gap-1 px-2 py-1 bg-white/60">
                    {STATION_COLOR_OPTIONS.map(opt => (
                      <button key={opt.label} onClick={() => setEditingCustomColors(prev => ({ ...prev, [key]: { bg: opt.bg, light: opt.light } }))}
                        className={`w-5 h-5 rounded-full border-2 ${editingCustomColors[key]?.bg === opt.bg ? 'border-gray-800 ring-1 ring-gray-400' : 'border-transparent'}`}
                        style={{ backgroundColor: opt.bg }} title={opt.label} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(editingStudents); onUpdateTeachers(editingTeachers); onUpdateStationColors(editingColors); onUpdateRotationOrder(editingOrder); if (onUpdateCustomStationColors) onUpdateCustomStationColors(editingCustomColors); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
};

export default StudentManager;
