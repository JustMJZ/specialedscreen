import React from 'react';

const StarPoints = ({ points, onAdd, onSubtract, onReset }) => (
  <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-2 shadow-md">
    <div className="text-xs font-bold text-amber-600 mb-1">⭐ CLASS STARS</div>
    <div className="flex items-center justify-between">
      <button onClick={onSubtract} className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-lg hover:bg-red-200">−</button>
      <div className="text-center">
        <div className="text-3xl font-bold text-amber-600">{points}</div>
        <div className="text-xs text-gray-500">stars earned</div>
      </div>
      <button onClick={onAdd} className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-lg hover:bg-green-200">+</button>
    </div>
    <button onClick={onReset} className="w-full mt-1 text-xs text-gray-400 hover:text-gray-600">Reset</button>
  </div>
);

export default StarPoints;
