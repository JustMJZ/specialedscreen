import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import widgetRegistry from '../../config/widgetRegistry';
import Clock from '../widgets/Clock';

const ALL_WIDGET_IDS = Object.keys(widgetRegistry);

const Header = () => {
  const state = useAppState();
  const {
    setShowStudentManager, isEditMode, toggleEditMode,
    addBox, equalizeStationSizes,
    showAddStationMenu, setShowAddStationMenu,
    rotationOrder, stationConfigs, stationColors, teacherNames,
    addStationToTab, addCustomStation,
    isLayoutEditMode, toggleLayoutEditMode
  } = state;

  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  const missingStations = rotationOrder.filter(c => !stationConfigs[c]);
  const activeWidgetIds = state._activeWidgetIds || [];
  const hiddenWidgets = ALL_WIDGET_IDS.filter(id => !activeWidgetIds.includes(id));

  return (
    <div className="flex items-center justify-between mb-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>🎓</div>
        <h1 className="text-lg font-bold" style={{ color: COLORS.text }}>SpecialEdScreen</h1>
        <Clock />
      </div>
      <div className="flex gap-1">
        <button onClick={() => setShowStudentManager(true)} className="px-2 py-1 bg-white rounded shadow-sm text-xs">👥 Students/Stations</button>
        {isEditMode && <button onClick={addBox} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">➕ Box</button>}
        {isEditMode && <button onClick={equalizeStationSizes} className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">⬜ Equal Size</button>}
        {isEditMode && (() => {
          return (
            <div className="relative">
              <button onClick={() => setShowAddStationMenu(!showAddStationMenu)} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">➕ Station</button>
              {showAddStationMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[140px]">
                  {missingStations.map(c => {
                    const s = stationColors[c] || COLORS.stations[c];
                    return (
                      <button key={c} onClick={() => { addStationToTab(c); setShowAddStationMenu(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.bg }} />
                        {teacherNames[c]}
                      </button>
                    );
                  })}
                  <div className="border-t my-1" />
                  <button onClick={() => { addCustomStation(); setShowAddStationMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2 font-medium text-teal-600">
                    <div className="w-3 h-3 rounded-full bg-gray-400 flex items-center justify-center text-white" style={{ fontSize: 8, lineHeight: 1 }}>+</div>
                    New Station
                  </button>
                </div>
              )}
            </div>
          );
        })()}
        {isLayoutEditMode && (
          <div className="relative">
            <button onClick={() => setShowWidgetMenu(!showWidgetMenu)}
              className={`px-2 py-1 rounded text-xs ${hiddenWidgets.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              + Widgets{hiddenWidgets.length > 0 ? ` (${hiddenWidgets.length})` : ''}
            </button>
            {showWidgetMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[180px] max-h-[60vh] overflow-y-auto">
                <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Widgets</div>
                {ALL_WIDGET_IDS.map(id => {
                  const meta = widgetRegistry[id];
                  const isActive = activeWidgetIds.includes(id);
                  return (
                    <button key={id}
                      onClick={() => {
                        if (isActive) {
                          if (state._removeWidget) state._removeWidget(id);
                        } else {
                          if (state._addWidget) state._addWidget(id);
                        }
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${isActive ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}>
                      <span>{meta.icon}</span>
                      <span className="flex-1">{meta.label}</span>
                      {isActive ? (
                        <span className="text-red-400 font-medium">✕</span>
                      ) : (
                        <span className="text-green-500 font-medium">+ Add</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {isLayoutEditMode && state._resetLayout && (
          <button onClick={state._resetLayout} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">↺ Reset Layout</button>
        )}
        <button onClick={() => { toggleLayoutEditMode(); setShowWidgetMenu(false); }} className={`px-2 py-1 rounded text-xs ${isLayoutEditMode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
          {isLayoutEditMode ? '✓ Done Layout' : '📐 Edit Layout'}
        </button>
        <button onClick={toggleEditMode} className={`px-2 py-1 rounded text-xs ${isEditMode ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
          {isEditMode ? '✓ Done' : '✏️ Edit'}
        </button>
      </div>
    </div>
  );
};

export default Header;
