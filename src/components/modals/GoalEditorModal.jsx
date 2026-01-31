import React, { useState } from 'react';
import { TOKEN_EMOJI_OPTIONS } from '../../constants';

const GoalEditorModal = ({ students, goals, onUpdate, onClose }) => {
  const [editingGoals, setEditingGoals] = useState({ ...goals });

  const rewardOptions = ['🎮 Free Time', '💻 Computer Time', '🎨 Art Time', '📚 Library Visit', '🎵 Music Time',
    '🍪 Snack', '🏆 Prize Box', '⭐ Star Student', '🎉 Class Helper', '🎪 Special Activity',
    '🧸 Stuffed Animal', '🛹 Extra Recess', '👑 Line Leader', '🎈 Party', '🍦 Ice Cream',
    '📱 Tablet Time', '🎧 Music Break', '🪁 Outdoor Time', '🎲 Game Time', '💺 Special Seat'];

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

export default GoalEditorModal;
