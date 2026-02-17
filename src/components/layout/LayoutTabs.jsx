import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

const LayoutTabs = () => {
  const {
    layoutTabs,
    activeLayoutId,
    setActiveLayoutId,
    layoutRenamingId,
    layoutRenameValue,
    setLayoutRenameValue,
    startLayoutRenaming,
    finishLayoutRenaming,
    setLayoutRenamingId,
    addLayoutTab,
    deleteLayoutTab,
  } = useAppState();

  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 px-1 pb-1 bg-transparent">
      {layoutTabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs cursor-pointer select-none ${tab.id === activeLayoutId ? 'bg-white shadow-sm font-bold text-gray-800' : 'bg-gray-200/70 text-gray-500 hover:bg-gray-200'}`}
          onClick={() => setActiveLayoutId(tab.id)}
          onDoubleClick={() => startLayoutRenaming(tab.id, tab.name)}
        >
          {layoutRenamingId === tab.id ? (
            <input
              value={layoutRenameValue}
              onChange={(e) => setLayoutRenameValue(e.target.value)}
              onBlur={finishLayoutRenaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishLayoutRenaming();
                if (e.key === 'Escape') setLayoutRenamingId(null);
              }}
              className="w-24 px-1 py-0 text-xs border rounded bg-white"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-[140px]">{tab.name}</span>
          )}
          {tab.id === activeLayoutId && layoutRenamingId !== tab.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startLayoutRenaming(tab.id, tab.name);
              }}
              className="hover:opacity-80 leading-none ml-0.5"
              style={{ fontSize: 11 }}
              title="Rename tab"
            >
              ✏️
            </button>
          )}
          {layoutTabs.length > 1 && tab.id === activeLayoutId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteLayoutTab(tab.id);
              }}
              className="text-gray-400 hover:text-red-500 text-xs leading-none ml-0.5"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="px-1.5 py-1 rounded-t-lg text-xs bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          title="Add new layout"
        >
          +
        </button>
        {showAddMenu && (
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[160px]">
            <button
              onClick={() => {
                addLayoutTab('blank');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
            >
              Blank Layout
            </button>
            <button
              onClick={() => {
                addLayoutTab('slides');
                setShowAddMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
            >
              Slides Layout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutTabs;
