import React, { useState } from 'react';
import { STUDENT_EMOJI_OPTIONS, TOKEN_EMOJI_OPTIONS } from '../../constants';
import EmojiPicker from './EmojiPicker';

const REWARD_OPTIONS = [
  '🎮 Free Time', '💻 Computer Time', '🎨 Art Time', '📚 Library Visit',
  '🎵 Music Time', '🍪 Snack', '🏆 Prize Box', '⭐ Star Student',
  '🎉 Class Helper', '🎪 Special Activity', '🧸 Stuffed Animal', '🛹 Extra Recess',
  '👑 Line Leader', '🎈 Party', '🍦 Ice Cream', '📱 Tablet Time',
  '🎧 Music Break', '🪁 Outdoor Time', '🎲 Game Time', '💺 Special Seat',
];

const DEFAULT_GOAL = { tokens: 0, goal: 5, reward: '🎮 Free Time', active: true, tokenEmoji: '⭐' };

const RosterManager = ({ roster, onUpdateRoster, studentGoals, onUpdateGoals, onClose }) => {
  const [editingRoster, setEditingRoster] = useState([...(roster || [])]);
  const [editingGoals, setEditingGoals] = useState({ ...(studentGoals || {}) });
  const [emojiPickerFor, setEmojiPickerFor] = useState(null);
  const [goalOpenFor, setGoalOpenFor] = useState(null);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleGoalChange = (studentId, field, value) => {
    setEditingGoals((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || DEFAULT_GOAL), [field]: value },
    }));
  };

  const handleBulkAdd = () => {
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    if (names.length === 0) return;
    const newStudents = names.map((name, i) => ({
      id: `r-${Date.now()}-${i}`,
      name,
      photo: null,
      emoji: null,
    }));
    setEditingRoster((prev) => [...prev, ...newStudents]);
    setBulkText('');
    setShowBulkAdd(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="roster-manager-title"
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
          <div className="p-3 border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
            <h2 id="roster-manager-title" className="text-lg font-bold text-gray-800 dark:text-gray-100">
              📋 Student Roster
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl" aria-label="Close modal">
              ✕
            </button>
          </div>
        <div className="p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-700">All Students</div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className={`text-xs px-2 py-1 rounded ${showBulkAdd ? 'bg-teal-100 text-teal-700' : 'bg-teal-50 text-teal-600 hover:bg-teal-100'}`}
              >
                + Add Multiple
              </button>
              <button
                onClick={() =>
                  setEditingRoster((prev) => [
                    ...prev,
                    { id: `r-${Date.now()}`, name: 'New Student', photo: null, emoji: null },
                  ])
                }
                className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100"
              >
                + Add Student
              </button>
            </div>
          </div>
          {showBulkAdd && (
            <div className="mb-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <div className="text-xs font-medium text-teal-700 mb-1">
                Paste student names (one per line)
              </div>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"John Smith\nJane Doe\nAlex Johnson"}
                className="w-full px-2 py-1.5 border border-teal-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={5}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-[11px] text-teal-600">
                  {bulkText.split('\n').filter((n) => n.trim()).length} student{bulkText.split('\n').filter((n) => n.trim()).length !== 1 ? 's' : ''} to add
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setShowBulkAdd(false); setBulkText(''); }}
                    className="text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkAdd}
                    className="text-xs px-2 py-1 rounded bg-teal-500 text-white hover:bg-teal-600"
                  >
                    Add All
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {editingRoster.map((student) => {
              const goal = editingGoals[student.id] || DEFAULT_GOAL;
              const isGoalOpen = goalOpenFor === student.id;
              return (
              <div key={student.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 relative">
                    {student.photo ? (
                      <img
                        src={student.photo}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : student.emoji ? (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl border-2 border-purple-300">
                        {student.emoji}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 border-2 border-gray-400">
                        {student.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) =>
                      setEditingRoster((prev) =>
                        prev.map((s) => (s.id === student.id ? { ...s, name: e.target.value } : s))
                      )
                    }
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={() =>
                      setEditingRoster((prev) => prev.filter((s) => s.id !== student.id))
                    }
                    className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1 ml-12">
                  <button
                    onClick={() => setGoalOpenFor(isGoalOpen ? null : student.id)}
                    className={`text-xs px-1.5 py-0.5 rounded ${isGoalOpen ? 'bg-amber-200 text-amber-700' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                  >
                    🎯 Tokens {goal.active ? `(${goal.tokens}/${goal.goal})` : '(off)'}
                  </button>
                  <label className="cursor-pointer text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setEditingRoster((prev) =>
                            prev.map((s) =>
                              s.id === student.id ? { ...s, photo: ev.target.result, emoji: null } : s
                            )
                          );
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    📷 Photo
                  </label>
                  <button
                    onClick={() => setEmojiPickerFor(emojiPickerFor === student.id ? null : student.id)}
                    className={`text-xs px-1.5 py-0.5 rounded ${emojiPickerFor === student.id ? 'bg-purple-200 text-purple-700' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                  >
                    😀 Emoji
                  </button>
                  {(student.photo || student.emoji) && (
                    <button
                      onClick={() =>
                        setEditingRoster((prev) =>
                          prev.map((s) => s.id === student.id ? { ...s, photo: null, emoji: null } : s)
                        )
                      }
                      className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100"
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
                {/* Inline token goal editor */}
                {isGoalOpen && (
                  <div className="mt-2 ml-12 p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="flex items-center gap-1 text-xs font-bold text-gray-600">
                        <input
                          type="checkbox"
                          checked={goal.active}
                          onChange={(e) => handleGoalChange(student.id, 'active', e.target.checked)}
                        />
                        Active
                      </label>
                    </div>
                    {goal.active && (
                      <>
                        <div className="flex gap-2 mb-2">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Goal</label>
                            <input
                              type="number" min="1" max="20" value={goal.goal}
                              onChange={(e) => handleGoalChange(student.id, 'goal', parseInt(e.target.value) || 5)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500">Current</label>
                            <input
                              type="number" min="0" max={goal.goal} value={goal.tokens}
                              onChange={(e) => handleGoalChange(student.id, 'tokens', Math.min(goal.goal, parseInt(e.target.value) || 0))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label className="text-xs text-gray-500">Reward</label>
                          <select
                            value={REWARD_OPTIONS.includes(goal.reward) ? goal.reward : '__custom__'}
                            onChange={(e) => handleGoalChange(student.id, 'reward', e.target.value === '__custom__' ? '' : e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            {REWARD_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            <option value="__custom__">✏️ Custom...</option>
                          </select>
                          {!REWARD_OPTIONS.includes(goal.reward) && (
                            <input
                              type="text" value={goal.reward}
                              onChange={(e) => handleGoalChange(student.id, 'reward', e.target.value)}
                              placeholder="Type custom reward..."
                              className="w-full px-2 py-1 border rounded text-sm mt-1"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Token Emoji</label>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {TOKEN_EMOJI_OPTIONS.map((em) => (
                              <button
                                key={em}
                                onClick={() => handleGoalChange(student.id, 'tokenEmoji', em)}
                                className={`w-6 h-6 rounded text-sm hover:bg-gray-100 ${(goal.tokenEmoji || '⭐') === em ? 'bg-amber-100 ring-1 ring-amber-400' : 'bg-white'}`}
                              >
                                {em}
                              </button>
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
                    onSelect={(em) => {
                      setEditingRoster((prev) =>
                        prev.map((s) => s.id === student.id ? { ...s, emoji: em, photo: null } : s)
                      );
                      setEmojiPickerFor(null);
                    }}
                  />
                )}
              </div>
              );
            })}
            {editingRoster.length === 0 && (
              <div className="text-xs text-gray-400">No roster students yet.</div>
            )}
          </div>
        </div>
        <div className="p-3 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 flex gap-2 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdateRoster(editingRoster);
              if (onUpdateGoals) onUpdateGoals(editingGoals);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterManager;
