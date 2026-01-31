import React from 'react';

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

export default TokenPopup;
