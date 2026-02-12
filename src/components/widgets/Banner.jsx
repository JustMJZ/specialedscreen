import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { getButtonClass, getIconButtonClass } from '../../styles/buttonStyles';
import { getInputClass } from '../../styles/inputStyles';

const Banner = ({ text, fontSize = 28, onEdit, onFontSizeChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [val, setVal] = useState(text);
  const [tempFontSize, setTempFontSize] = useState(fontSize);

  const handleSave = () => {
    onEdit(val);
    onFontSizeChange(tempFontSize);
    setShowModal(false);
  };

  return (
    <>
      <div onClick={() => { setVal(text); setTempFontSize(fontSize); setShowModal(true); }} className="rounded-xl p-4 text-center cursor-pointer hover:opacity-90 shadow-lg h-full flex items-center justify-center">
        <div
          className="relative z-10"
          style={{
            fontSize,
            fontFamily: "'Baloo 2', cursive",
            fontWeight: 800,
            textShadow: '0 3px 10px rgba(0,0,0,0.25)',
          }}
        >
          {text || 'Click to edit'}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Banner</h3>
            <input
              value={val}
              onChange={e => setVal(e.target.value)}
              className={`${getInputClass('filled', 'lg')} w-full mb-4`}
              placeholder="Enter banner text..."
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600 font-medium">Font Size:</span>
              <button onClick={() => setTempFontSize(Math.max(12, tempFontSize - 4))} className={`${getIconButtonClass('md', 'secondary')} font-bold`}>A−</button>
              <span className="text-sm px-2 text-gray-700 font-bold min-w-[50px] text-center">{tempFontSize}px</span>
              <button onClick={() => setTempFontSize(Math.min(72, tempFontSize + 4))} className={`${getIconButtonClass('md', 'secondary')} font-bold`}>A+</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className={`${getButtonClass('secondary', 'md')} flex-1`}>Cancel</button>
              <button onClick={handleSave} className={`${getButtonClass('primary', 'md')} flex-1`}>Save</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Banner;
