import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { getButtonClass, getIconButtonClass } from '../../styles/buttonStyles';
import { getInputClass } from '../../styles/inputStyles';

const QuickMessage = ({ message, onEdit, fontSize = 16, onFontSizeChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [val, setVal] = useState(message);
  const [tempFontSize, setTempFontSize] = useState(fontSize);

  const presets = [
    'Great job! ⭐',
    'Remember: Quiet voices 🤫',
    'Clean up time! 🧹',
    'Line up! 🚶',
    'Eyes on teacher 👀',
    'Hands to yourself ✋',
    'Walking feet please 🦶',
    'You can do it! 💪',
    'Almost done! 🏁',
    'Take a deep breath 🧘',
    'Be kind to each other 💛',
    'Time to focus 🎯',
    'Great listening! 👂',
    'Show me ready! ✅',
    'Brain break! 🧠',
  ];

  const handleSave = () => {
    onEdit(val);
    onFontSizeChange(tempFontSize);
    setShowModal(false);
  };

  return (
    <>
      <div
        onClick={() => {
          setVal(message);
          setTempFontSize(fontSize);
          setShowModal(true);
        }}
        className="rounded-lg p-2 shadow-md cursor-pointer hover:shadow-lg transition-shadow h-full"
      >
        <div className="text-xs font-bold text-gray-500">📋 QUICK MESSAGE</div>
        <div
          className="relative z-10 text-center py-1 font-extrabold"
          style={{
            fontSize,
            textShadow: '0 3px 10px rgba(0,0,0,0.25)',
          }}
        >
          {message || 'Click to edit'}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Quick Message</h3>
              <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className={`${getInputClass('filled', 'md')} w-full mb-3`}
                placeholder="Enter message..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-500 mb-2">QUICK PRESETS</div>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => setVal(p)}
                      className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600 font-medium">Font Size:</span>
                <button
                  onClick={() => setTempFontSize(Math.max(10, tempFontSize - 2))}
                  className={`${getIconButtonClass('sm', 'secondary')} font-bold`}
                >
                  A−
                </button>
                <span className="text-sm px-2 text-gray-700 font-bold min-w-[50px] text-center">
                  {tempFontSize}px
                </span>
                <button
                  onClick={() => setTempFontSize(Math.min(48, tempFontSize + 2))}
                  className={`${getIconButtonClass('sm', 'secondary')} font-bold`}
                >
                  A+
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={`${getButtonClass('secondary', 'md')} flex-1`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className={`${getButtonClass('primary', 'md')} flex-1`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default QuickMessage;
