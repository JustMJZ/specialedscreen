import React, { useMemo, useState } from 'react';

const GoalLadder = ({
  title = 'Goal Ladder',
  steps = [],
  completedCount = 0,
  onTitleChange,
  onStepsChange,
  onCompletedChange,
  onReset,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const safeSteps = useMemo(() => {
    if (Array.isArray(steps) && steps.length > 0) return steps;
    return Array.from({ length: 6 }, () => '');
  }, [steps]);

  const handleStepClick = (index) => {
    const next = safeSteps.length - index;
    if (onCompletedChange) {
      onCompletedChange(completedCount === next ? next - 1 : next);
    }
  };

  const handleAddStep = () => {
    if (!onStepsChange) return;
    onStepsChange((prev) => (prev.length >= 10 ? prev : [...prev, '']));
  };

  const handleRemoveStep = () => {
    if (!onStepsChange) return;
    onStepsChange((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
    if (onCompletedChange) {
      onCompletedChange(Math.min(completedCount, safeSteps.length - 1));
    }
  };

  const handleReset = () => {
    if (onReset) onReset();
    if (onCompletedChange && !onReset) onCompletedChange(0);
  };

  const totalSteps = safeSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="rounded-lg p-3 shadow-md h-full flex flex-col gap-2 bg-transparent relative overflow-hidden">
      <style>{`
        @keyframes ladder-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes ladder-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.1); }
        }
      `}</style>
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="text-xs font-bold tracking-widest uppercase text-gray-700 bg-black/5 border border-emerald-200/70 rounded px-2 py-1 flex-1"
            placeholder="Goal Ladder"
            aria-label="Goal title"
          />
        ) : (
          <div className="text-xs font-bold tracking-widest uppercase text-gray-600 flex items-center gap-1">
            <span>🪜</span>
            <span>{title}</span>
          </div>
        )}
        <button
          onClick={() => setIsEditing((prev) => !prev)}
          className="text-[10px] text-gray-500 hover:text-gray-700 uppercase tracking-widest"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-400">
        <span>{completedCount} / {totalSteps} steps</span>
        <span className="text-gray-600 font-bold">{progressPercent}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/5 border border-emerald-200/70 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[300px]">
          {safeSteps.map((label, i) => {
            const isComplete = i >= safeSteps.length - completedCount;
            const stepNumber = safeSteps.length - i;
            const displayLabel = label?.trim() || `Step ${stepNumber}`;
            const colors = [
              { chip: 'bg-rose-400 border-rose-500', bar: 'from-rose-200 to-rose-300', text: 'text-rose-600' },
              { chip: 'bg-amber-400 border-amber-500', bar: 'from-amber-200 to-amber-300', text: 'text-amber-600' },
              { chip: 'bg-lime-400 border-lime-500', bar: 'from-lime-200 to-lime-300', text: 'text-lime-600' },
              { chip: 'bg-cyan-400 border-cyan-500', bar: 'from-cyan-200 to-cyan-300', text: 'text-cyan-600' },
              { chip: 'bg-indigo-400 border-indigo-500', bar: 'from-indigo-200 to-indigo-300', text: 'text-indigo-600' },
              { chip: 'bg-fuchsia-400 border-fuchsia-500', bar: 'from-fuchsia-200 to-fuchsia-300', text: 'text-fuchsia-600' },
            ];
            const palette = colors[i % colors.length];
            return (
              <div key={i} className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => handleStepClick(i)}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black transition-all ${
                    isComplete
                      ? `${palette.chip} text-white shadow-md scale-105`
                      : 'bg-black/5 border-emerald-200/70 text-gray-500'
                  }`}
                  aria-label={`Mark ${displayLabel}`}
                >
                  {steps.length - i}
                </button>
                <div
                  className={`flex-1 h-3 rounded-full border transition-all relative overflow-hidden ${
                    isComplete
                      ? `bg-gradient-to-r ${palette.bar} border-emerald-200`
                      : 'bg-black/5 border-emerald-200/70'
                  }`}
                >
                  {isComplete && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow">
                      ⭐
                    </span>
                  )}
                </div>
                {isEditing && (
                  <input
                    value={label}
                    onChange={(e) => {
                      if (!onStepsChange) return;
                      onStepsChange((prev) => {
                        const next = [...prev];
                        next[i] = e.target.value;
                        return next;
                      });
                    }}
                    className="w-28 text-[10px] text-gray-600 bg-black/5 border border-emerald-200/70 rounded px-2 py-1"
                    placeholder={`Step ${stepNumber}`}
                    aria-label={`Label for step ${stepNumber}`}
                  />
                )}
              </div>
            );
          })}
          {!isEditing && (
            <div className="mt-2 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <span className="inline-block" style={{ animation: 'ladder-sparkle 1.6s ease-in-out infinite' }}>✨</span>
              Tap a rung to track progress
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
        <button onClick={handleAddStep} className="hover:text-emerald-600">+ Step</button>
        <button onClick={handleRemoveStep} className="hover:text-emerald-600">- Step</button>
        <button onClick={handleReset} className="hover:text-emerald-600">Reset</button>
      </div>
    </div>
  );
};

export default GoalLadder;
