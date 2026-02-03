import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { STORAGE_KEY } from '../../hooks/usePersistedState';
import { validateBackup } from '../../context/stateUtils';
import widgetRegistry from '../../config/widgetRegistry';
import Clock from '../widgets/Clock';

const ALL_WIDGET_IDS = Object.keys(widgetRegistry);

const Header = () => {
  const state = useAppState();
  const {
    setShowStudentManager, setShowRosterManager, isEditMode,
    addBox, equalizeStationSizes,
    rotationOrder, stationConfigs, stationColors, teacherNames,
    addStationToTab,
    isLayoutEditMode, toggleLayoutEditMode
  } = state;

  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showWidgetsList, setShowWidgetsList] = useState(false);
  const fileInputRef = React.useRef(null);

  const exportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `specialedscreen-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeToolsMenu();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const { valid, error } = validateBackup(parsed);
        if (!valid) {
          alert(`This file does not look like a valid SpecialEdScreen backup.\n\n${error}`);
          return;
        }
        if (!window.confirm('This will replace all your current data. Are you sure?')) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.location.reload();
      } catch {
        alert('Could not read this file. Make sure it is a valid backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const missingStations = rotationOrder.filter(c => !stationConfigs[c]);
  const activeWidgetIds = state._activeWidgetIds || [];
  const hiddenWidgets = ALL_WIDGET_IDS.filter(id => !activeWidgetIds.includes(id));
  const closeToolsMenu = () => {
    setShowToolsMenu(false);
    setShowWidgetsList(false);
  };

  return (
    <div className="flex items-center justify-between mb-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Clock />
      </div>
      <div className="flex gap-1 items-center">
        <div className="relative">
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="px-2 py-1 bg-white rounded shadow-sm text-xs"
          >
            ⚙ Tools
          </button>
          {showToolsMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[210px] max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => { setShowStudentManager(true); closeToolsMenu(); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                👥 Students/Stations
              </button>
              <button
                onClick={() => { setShowRosterManager(true); closeToolsMenu(); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                📋 Student Roster
              </button>
              <div className="border-t my-1" />
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Data</div>
              <button
                onClick={exportData}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                📥 Export Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                📤 Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <button
                onClick={() => {
                  if (!window.confirm('This will erase all your data and reset everything to defaults. Are you sure?')) return;
                  localStorage.removeItem(STORAGE_KEY);
                  window.location.reload();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                ↺ Reset to Defaults
              </button>

              {isEditMode && (
                <>
                  <div className="border-t my-1" />
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Edit Tools</div>
                  <button
                    onClick={() => { addBox(); closeToolsMenu(); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  >
                    ➕ Add Box
                  </button>
                  <button
                    onClick={() => { equalizeStationSizes(); closeToolsMenu(); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  >
                    ⬜ Equal Size
                  </button>
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Stations</div>
                  {missingStations.length === 0 && (
                    <div className="px-3 py-1.5 text-xs text-gray-400">All stations added</div>
                  )}
                  {missingStations.map(c => {
                    const s = stationColors[c] || COLORS.stations[c];
                    return (
                      <button key={c}
                        onClick={() => { addStationToTab(c); closeToolsMenu(); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.bg }} />
                        {teacherNames[c]}
                      </button>
                    );
                  })}
                </>
              )}

              <>
                <div className="border-t my-1" />
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Layout</div>
                {!isLayoutEditMode && (
                  <button
                    onClick={() => { toggleLayoutEditMode(); setShowWidgetsList(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-orange-700"
                  >
                    Enable Layout Edit to manage widgets
                  </button>
                )}
                {isLayoutEditMode && (
                  <>
                    <button
                      onClick={() => setShowWidgetsList(!showWidgetsList)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>+ Widgets</span>
                      {hiddenWidgets.length > 0 && (
                        <span className="text-green-600 font-medium">({hiddenWidgets.length})</span>
                      )}
                      <span className="ml-auto text-gray-400">{showWidgetsList ? '▴' : '▾'}</span>
                    </button>
                    {showWidgetsList && (
                      <div className="py-1">
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
                    {state._resetLayout && (
                      <button onClick={() => { state._resetLayout(); closeToolsMenu(); }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600">
                        ↺ Reset Layout
                      </button>
                    )}
                  </>
                )}
              </>
            </div>
          )}
        </div>

        <button
          onClick={() => { toggleLayoutEditMode(); closeToolsMenu(); }}
          className={`px-2 py-1 rounded text-xs ${isLayoutEditMode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}
        >
          {isLayoutEditMode ? '✓ Done Layout' : '📐 Edit Layout'}
        </button>
      </div>
    </div>
  );
};

export default Header;
