import React, { useState, useMemo } from 'react';
import { STUDENT_EMOJI_OPTIONS, STATION_COLOR_OPTIONS, TOKEN_EMOJI_OPTIONS } from '../../constants';
import EmojiPicker from './EmojiPicker';

const REWARD_OPTIONS = ['🎮 Free Time', '💻 Computer Time', '🎨 Art Time', '📚 Library Visit', '🎵 Music Time',
  '🍪 Snack', '🏆 Prize Box', '⭐ Star Student', '🎉 Class Helper', '🎪 Special Activity',
  '🧸 Stuffed Animal', '🛹 Extra Recess', '👑 Line Leader', '🎈 Party', '🍦 Ice Cream',
  '📱 Tablet Time', '🎧 Music Break', '🪁 Outdoor Time', '🎲 Game Time', '💺 Special Seat'];

const DEFAULT_GOAL = { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true, tokenEmoji: '⭐' };

const StudentManager = ({ students, onUpdate, onClose, roster, stationConfigs, teacherNames, onUpdateTeachers, stationColors, onUpdateStationColors, rotationOrder, onUpdateRotationOrder, customStationKeys, customStationColors, onUpdateCustomStationColors, studentGoals, onUpdateGoals }) => {
  const createStudentId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  };

  const ensureUniqueIds = (list) => {
    const seen = new Set();
    return (list || []).map(s => {
      let id = s.id;
      if (!id || seen.has(id)) id = createStudentId();
      seen.add(id);
      return id === s.id ? s : { ...s, id };
    });
  };

  const [editingStudents, setEditingStudents] = useState(() => ensureUniqueIds(students));
  const [editingTeachers, setEditingTeachers] = useState({ ...teacherNames });
  const [editingColors, setEditingColors] = useState({ ...stationColors });
  const initialOrder = useMemo(() => {
    const keys = stationConfigs ? Object.keys(stationConfigs) : [];
    if (keys.length === 0) return [];
    const filtered = (rotationOrder || []).filter(k => keys.includes(k));
    return filtered.length > 0 ? filtered : keys;
  }, [rotationOrder, stationConfigs]);
  const [editingOrder, setEditingOrder] = useState([...initialOrder]);
  const [editingCustomColors, setEditingCustomColors] = useState({ ...customStationColors });
  const [editingGoals, setEditingGoals] = useState({ ...studentGoals });
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);
  const [goalOpenFor, setGoalOpenFor] = useState(null);
  const [showRosterMenu, setShowRosterMenu] = useState(false);
  const [selectedRosterIds, setSelectedRosterIds] = useState([]);
  const [selectedForRemoval, setSelectedForRemoval] = useState([]);
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);

  const handlePhotoUpload = (studentId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingStudents(prev => prev.map(s => s.id === studentId ? { ...s, photo: e.target.result } : s));
    };
    reader.readAsDataURL(file);
  };

  const handleGoalChange = (studentId, field, value) => {
    setEditingGoals(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || DEFAULT_GOAL), [field]: value }
    }));
  };

  const addRosterStudentToLayout = (r) => {
    if (!r) return;
    setEditingStudents(prev => {
      if (prev.some(s => s.rosterId === r.id)) return prev;
      return [...prev, {
        id: createStudentId(),
        rosterId: r.id,
        name: r.name,
        photo: r.photo || null,
        emoji: r.emoji || null,
        group: editingOrder[0] || ''
      }];
    });
  };
  const addSelectedRosterStudents = () => {
    const rosterMap = new Map((roster || []).map(r => [r.id, r]));
    selectedRosterIds.forEach(id => addRosterStudentToLayout(rosterMap.get(id)));
    setSelectedRosterIds([]);
    setShowRosterMenu(false);
  };

  const removeSelectedStudents = () => {
    if (selectedForRemoval.length === 0) return;
    const count = selectedForRemoval.length;
    if (!window.confirm(`Remove ${count} selected student${count > 1 ? 's' : ''}?`)) return;
    setEditingStudents(prev => prev.filter(s => !selectedForRemoval.includes(s.id)));
    setSelectedForRemoval([]);
  };

  const removeAllStudents = () => {
    if (editingStudents.length === 0) return;
    setShowRemoveAllConfirm(true);
  };

  const handleRemoveAllConfirm = () => {
    setEditingStudents([]);
    setSelectedForRemoval([]);
    setShowRemoveAllConfirm(false);
  };

  const handleRemoveAllCancel = () => {
    setShowRemoveAllConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">✏️ Edit Students/Stations</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="flex flex-1 min-h-0">
          {/* Left column: Students */}
          <div className="flex-1 p-3 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-gray-700">
                Students
                {selectedForRemoval.length > 0 && (
                  <span className="ml-2 text-xs text-red-600 font-normal">
                    ({selectedForRemoval.length} selected)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 relative">
                {selectedForRemoval.length > 0 && (
                  <button
                    onClick={removeSelectedStudents}
                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium"
                  >
                    Remove Selected
                  </button>
                )}
                {editingStudents.length > 0 && (
                  <button
                    onClick={removeAllStudents}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                  >
                    Remove All
                  </button>
                )}
                <button
                  onClick={() => setEditingStudents(prev => ([...prev, { id: createStudentId(), name: 'New Student', group: editingOrder[0] || '', photo: null }]))}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  + Add Student
                </button>
                <button
                  onClick={() => setShowRosterMenu(!showRosterMenu)}
                  className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100"
                  title="Add from roster"
                >
                  + From Roster
                </button>
                {showRosterMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-2 min-w-[220px] max-h-[55vh] overflow-y-auto">
                    <div className="px-3 pb-1 text-xs font-bold text-gray-400 uppercase">Roster</div>
                    {(roster || []).length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400">No roster students yet.</div>
                    )}
                    {(roster || []).map(r => (
                      <label key={r.id} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRosterIds.includes(r.id)}
                          onChange={(e) => {
                            setSelectedRosterIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id));
                          }}
                        />
                        <span className="flex-1">{r.name}</span>
                      </label>
                    ))}
                    {(roster || []).length > 0 && (
                      <div className="px-3 pt-2">
                        <button
                          onClick={addSelectedRosterStudents}
                          disabled={selectedRosterIds.length === 0}
                          className="w-full px-2 py-1 text-xs rounded bg-teal-500 text-white disabled:opacity-40"
                        >
                          Add Selected
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {editingStudents.map(student => {
                const goal = editingGoals[student.id] || DEFAULT_GOAL;
                const isGoalOpen = goalOpenFor === student.id;
                return (
                  <div key={student.id} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedForRemoval.includes(student.id)}
                        onChange={(e) => {
                          setSelectedForRemoval(prev =>
                            e.target.checked
                              ? [...prev, student.id]
                              : prev.filter(id => id !== student.id)
                          );
                        }}
                        className="flex-shrink-0 w-4 h-4 cursor-pointer"
                        title="Select for removal"
                      />
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
                    <div className="flex items-center gap-1 mt-1 ml-16">
                      <button onClick={() => setGoalOpenFor(isGoalOpen ? null : student.id)}
                        className={`text-xs px-1.5 py-0.5 rounded ${isGoalOpen ? 'bg-amber-200 text-amber-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                        🎯 Tokens {goal.active ? `(${goal.tokens}/${goal.goal})` : ''}
                      </button>
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
                    {/* Inline token goal editor */}
                    {isGoalOpen && (
                      <div className="mt-2 ml-16 p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="flex items-center gap-1 text-xs font-bold text-gray-600">
                            <input type="checkbox" checked={goal.active}
                              onChange={(e) => handleGoalChange(student.id, 'active', e.target.checked)} />
                            Active
                          </label>
                        </div>
                        {goal.active && (
                          <>
                            <div className="flex gap-2 mb-2">
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Goal</label>
                                <input type="number" min="1" max="20" value={goal.goal}
                                  onChange={(e) => handleGoalChange(student.id, 'goal', parseInt(e.target.value) || 5)}
                                  className="w-full px-2 py-1 border rounded text-sm" />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-gray-500">Current</label>
                                <input type="number" min="0" max={goal.goal} value={goal.tokens}
                                  onChange={(e) => handleGoalChange(student.id, 'tokens', Math.min(goal.goal, parseInt(e.target.value) || 0))}
                                  className="w-full px-2 py-1 border rounded text-sm" />
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="text-xs text-gray-500">Reward</label>
                              <select value={REWARD_OPTIONS.includes(goal.reward) ? goal.reward : '__custom__'}
                                onChange={(e) => handleGoalChange(student.id, 'reward', e.target.value === '__custom__' ? '' : e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm">
                                {REWARD_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                <option value="__custom__">✏️ Custom...</option>
                              </select>
                              {!REWARD_OPTIONS.includes(goal.reward) && (
                                <input type="text" value={goal.reward} onChange={(e) => handleGoalChange(student.id, 'reward', e.target.value)}
                                  placeholder="Type custom reward..." className="w-full px-2 py-1 border rounded text-sm mt-1" />
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Token Emoji</label>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {TOKEN_EMOJI_OPTIONS.map(em => (
                                  <button key={em} onClick={() => handleGoalChange(student.id, 'tokenEmoji', em)}
                                    className={`w-6 h-6 rounded text-sm hover:bg-gray-100 ${(goal.tokenEmoji || '⭐') === em ? 'bg-amber-100 ring-1 ring-amber-400' : 'bg-white'}`}>{em}</button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {emojiPickerFor === student.id && (
                      <EmojiPicker
                        emojis={STUDENT_EMOJI_OPTIONS}
                        selected={student.emoji}
                        onSelect={(em) => { setEditingStudents(prev => prev.map(s => s.id === student.id ? { ...s, emoji: em, photo: null } : s)); setEmojiPickerFor(null); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Right column: Stations */}
          <div className="flex-1 p-3 overflow-y-auto">
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
            {customStationKeys && customStationKeys.length > 0 && (
              <div className="mt-3 p-3 bg-teal-50 rounded-lg">
                <div className="text-sm font-bold text-gray-700 mb-2">Custom Stations (this tab)</div>
                {customStationKeys.filter(k => !editingOrder.includes(k)).length === 0 && (
                  <div className="text-xs text-gray-500">All custom stations are in rotation.</div>
                )}
                <div className="space-y-2">
                  {customStationKeys.filter(k => !editingOrder.includes(k)).map(key => (
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
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex gap-2 justify-end flex-shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm">Cancel</button>
          <button onClick={() => { onUpdate(ensureUniqueIds(editingStudents)); onUpdateTeachers(editingTeachers); onUpdateStationColors(editingColors); onUpdateRotationOrder(editingOrder); if (onUpdateCustomStationColors) onUpdateCustomStationColors(editingCustomColors); if (onUpdateGoals) onUpdateGoals(editingGoals); onClose(); }} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm">Save</button>
        </div>
      </div>

      {/* Remove All Confirmation Modal */}
      {showRemoveAllConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Remove ALL Students?</h3>
              <p className="text-gray-600">
                You are about to remove all {editingStudents.length} students from this layout.
              </p>
              <p className="text-red-600 font-medium mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRemoveAllCancel}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveAllConfirm}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
              >
                Remove All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
