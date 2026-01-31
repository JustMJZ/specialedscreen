import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const TokenBoardCard = () => {
  const { setShowGoalEditor } = useAppState();

  return (
    <div className="rounded-lg p-2 shadow-md h-full">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-purple-600">🎯 TOKEN BOARD</div>
        <button onClick={() => setShowGoalEditor(true)} className="text-xs bg-white/50 hover:bg-white/80 px-2 py-1 rounded">✏️ Setup</button>
      </div>
      <div className="text-xs text-gray-500 mt-1">Click a student on the floor plan to view tokens</div>
    </div>
  );
};

export default TokenBoardCard;
