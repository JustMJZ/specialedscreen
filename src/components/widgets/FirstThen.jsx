import React from 'react';

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

export default FirstThen;
