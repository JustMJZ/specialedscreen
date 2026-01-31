import React from 'react';
import { useAppState } from '../../context/AppStateContext';

const FloorPlanTabs = () => {
  const {
    floorPlans, activeFloorPlanId, setActiveFloorPlanId,
    renamingTabId, renameValue, setRenameValue,
    startRenamingTab, finishRenamingTab, setRenamingTabId,
    deleteFloorPlan, addFloorPlan
  } = useAppState();

  return (
    <div className="flex items-center gap-0.5 px-1 pb-0 bg-transparent">
      {floorPlans.map(fp => (
        <div key={fp.id}
          className={`group flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs cursor-pointer select-none ${fp.id === activeFloorPlanId ? 'bg-white shadow-sm font-bold text-gray-800' : 'bg-gray-200/70 text-gray-500 hover:bg-gray-200'}`}
          onClick={() => setActiveFloorPlanId(fp.id)}
          onDoubleClick={() => startRenamingTab(fp.id, fp.name)}>
          {renamingTabId === fp.id ? (
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={finishRenamingTab}
              onKeyDown={(e) => { if (e.key === 'Enter') finishRenamingTab(); if (e.key === 'Escape') setRenamingTabId(null); }}
              className="w-20 px-1 py-0 text-xs border rounded bg-white"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-[100px]">{fp.name}</span>
          )}
          {floorPlans.length > 1 && fp.id === activeFloorPlanId && (
            <button
              onClick={(e) => { e.stopPropagation(); deleteFloorPlan(fp.id); }}
              className="text-gray-400 hover:text-red-500 text-xs leading-none ml-0.5">
              ✕
            </button>
          )}
        </div>
      ))}
      <button onClick={addFloorPlan} className="px-1.5 py-1 rounded-t-lg text-xs bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="Add new layout">+</button>
    </div>
  );
};

export default FloorPlanTabs;
