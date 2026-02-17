import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const TokenBoardCard = () => {
  const { setShowGoalEditor } = useAppState();

  return (
    <div className="rounded-lg p-2 shadow-md h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-purple-600">🎯 TOKEN BOARD</div>
        <button
          onClick={() => setShowGoalEditor(true)}
          className="text-xs bg-white/50 hover:bg-white/80 px-2 py-1 rounded focus:ring-2 focus:ring-purple-400 focus:outline-none"
        >
          ✏️ Setup
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1 opacity-50">👆</div>
          <div className="text-xs text-gray-500">Select a student on the floor plan</div>
          <div className="text-[10px] text-gray-400 mt-0.5">to track their tokens</div>
        </div>
      </div>
    </div>
  );
};

export default TokenBoardCard;
