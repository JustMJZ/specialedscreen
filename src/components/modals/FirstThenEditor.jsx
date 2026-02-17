import { useState } from 'react';
import ReactDOM from 'react-dom';

const ACTIVITIES = [
  { icon: '📚', label: 'Reading' },
  { icon: '✏️', label: 'Writing' },
  { icon: '🔢', label: 'Math' },
  { icon: '🎨', label: 'Art' },
  { icon: '🎵', label: 'Music' },
  { icon: '🎮', label: 'Free Time' },
  { icon: '🧩', label: 'Puzzles' },
  { icon: '💻', label: 'Computer' },
  { icon: '🏃', label: 'PE' },
  { icon: '🍎', label: 'Snack' },
  { icon: '🥪', label: 'Lunch' },
  { icon: '🧹', label: 'Clean Up' },
  { icon: '🔬', label: 'Science' },
  { icon: '🌍', label: 'Social Studies' },
  { icon: '🗣️', label: 'Speech' },
  { icon: '🧘', label: 'Calm Down' },
  { icon: '🤝', label: 'Group Work' },
  { icon: '🎭', label: 'Drama' },
  { icon: '🏊', label: 'Swimming' },
  { icon: '📐', label: 'Geometry' },
  { icon: '🖍️', label: 'Coloring' },
  { icon: '🧠', label: 'Brain Break' },
  { icon: '📖', label: 'Story Time' },
  { icon: '🎤', label: 'Show & Tell' },
  { icon: '🚶', label: 'Walk' },
  { icon: '😴', label: 'Rest' },
  { icon: '🏠', label: 'Pack Up' },
  { icon: '🚌', label: 'Bus' },
  { icon: '🎉', label: 'Celebration' },
  { icon: '🧪', label: 'Experiment' },
];

const EMOJI_OPTIONS = [
  '📚', '✏️', '🔢', '🎨', '🎵', '🎮', '🧩', '💻', '🏃', '🍎',
  '🥪', '🧹', '🔬', '🌍', '🗣️', '🧘', '🤝', '🎭', '🏊', '🖍️',
  '🧠', '📖', '🎤', '🚶', '😴', '🏠', '🚌', '🎉', '🧪', '⭐',
  '🌟', '🚀', '🦄', '🐶', '🐱', '🎯', '🏆', '💡', '🎪', '🎈',
];

const FirstThenEditor = ({ firstThen, onUpdate, onClose }) => {
  const [editing, setEditing] = useState({ ...firstThen });
  const [activeTab, setActiveTab] = useState('first'); // 'first' or 'then'

  const isCustomFirst = !ACTIVITIES.some(
    (a) => a.icon === editing.firstIcon && a.label === editing.firstLabel
  );
  const isCustomThen = !ACTIVITIES.some(
    (a) => a.icon === editing.thenIcon && a.label === editing.thenLabel
  );

  const handleSave = () => {
    onUpdate(editing);
    onClose();
  };

  const currentIcon = activeTab === 'first' ? editing.firstIcon : editing.thenIcon;
  const currentLabel = activeTab === 'first' ? editing.firstLabel : editing.thenLabel;
  const isCustom = activeTab === 'first' ? isCustomFirst : isCustomThen;
  const color = activeTab === 'first' ? 'blue' : 'green';

  const selectActivity = (activity) => {
    if (activeTab === 'first') {
      setEditing((p) => ({ ...p, firstIcon: activity.icon, firstLabel: activity.label }));
    } else {
      setEditing((p) => ({ ...p, thenIcon: activity.icon, thenLabel: activity.label }));
    }
  };

  const selectCustom = () => {
    if (activeTab === 'first') {
      setEditing((p) => ({ ...p, firstIcon: '📝', firstLabel: '' }));
    } else {
      setEditing((p) => ({ ...p, thenIcon: '📝', thenLabel: '' }));
    }
  };

  const setIcon = (emoji) => {
    if (activeTab === 'first') {
      setEditing((p) => ({ ...p, firstIcon: emoji }));
    } else {
      setEditing((p) => ({ ...p, thenIcon: emoji }));
    }
  };

  const setLabel = (label) => {
    if (activeTab === 'first') {
      setEditing((p) => ({ ...p, firstLabel: label }));
    } else {
      setEditing((p) => ({ ...p, thenLabel: label }));
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-then-editor-title"
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 id="first-then-editor-title" className="text-2xl font-bold text-gray-800">
              First/Then Board
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Set up sequential activities for your students
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('first')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'first'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{editing.firstIcon}</span>
                <span>FIRST</span>
              </div>
              {editing.firstLabel && (
                <div className="text-xs mt-1 opacity-90">{editing.firstLabel}</div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('then')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === 'then'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{editing.thenIcon}</span>
                <span>THEN</span>
              </div>
              {editing.thenLabel && (
                <div className="text-xs mt-1 opacity-90">{editing.thenLabel}</div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Quick Select Activities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Select</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ACTIVITIES.map((activity) => {
                const isSelected =
                  currentIcon === activity.icon && currentLabel === activity.label;
                return (
                  <button
                    key={activity.label}
                    onClick={() => selectActivity(activity)}
                    className={`p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? `bg-${color}-100 ring-2 ring-${color}-500 shadow-md`
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{activity.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{activity.label}</div>
                  </button>
                );
              })}
              <button
                onClick={selectCustom}
                className={`p-3 rounded-lg text-left transition-all ${
                  isCustom
                    ? `bg-${color}-100 ring-2 ring-${color}-500 shadow-md`
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">✏️</div>
                <div className="text-xs font-medium text-gray-700">Custom</div>
              </button>
            </div>
          </div>

          {/* Custom Activity Section */}
          {isCustom && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Activity</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Activity Name
                    </label>
                    <input
                      type="text"
                      value={currentLabel}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter activity name..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Choose Icon
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg text-2xl">
                        {currentIcon}
                      </div>
                      <input
                        type="text"
                        value={currentIcon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                        placeholder="Or type emoji..."
                        maxLength={2}
                      />
                    </div>
                    <div className="grid grid-cols-10 gap-1">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setIcon(emoji)}
                          className={`w-9 h-9 rounded-lg text-lg transition-all ${
                            currentIcon === emoji
                              ? `bg-${color}-100 ring-2 ring-${color}-500`
                              : 'bg-white hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FirstThenEditor;
