import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { STORAGE_KEY } from '../../hooks/usePersistedState';
import { exportBackup, importBackup } from '../../utils/backupUtils';
import widgetRegistry from '../../config/widgetRegistry';
import TemplatesModal from '../modals/TemplatesModal';

const ALL_WIDGET_IDS = Object.keys(widgetRegistry);

const FloatingControls = () => {
  const state = useAppState();
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
    setShowStudentManager,
    setShowRosterManager,
    isEditMode,
    addBox,
    equalizeStationSizes,
    rotationOrder,
    stationConfigs,
    stationColors,
    teacherNames,
    addStationToTab,
    isLayoutEditMode,
    toggleLayoutEditMode,
    performanceMode,
    setPerformanceMode,
    loadTemplate,
    saveCurrentLayoutAsTemplate,
  } = state;

  const [showTabMenu, setShowTabMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showWidgetsList, setShowWidgetsList] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowTabMenu(false);
        setShowToolsMenu(false);
        setShowWidgetsList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportData = () => {
    exportBackup(closeAllMenus);
  };

  const importData = (e) => {
    importBackup(e);
  };

  const activeTab = layoutTabs?.find((t) => t.id === activeLayoutId);
  const missingStations = rotationOrder.filter((c) => !stationConfigs[c]);
  const activeWidgetIds = state._activeWidgetIds || [];
  const hiddenWidgets = ALL_WIDGET_IDS.filter((id) => !activeWidgetIds.includes(id));

  const closeAllMenus = () => {
    setShowTabMenu(false);
    setShowToolsMenu(false);
    setShowWidgetsList(false);
  };

  const handleLoadTemplate = (templateId) => {
    loadTemplate(templateId);
    closeAllMenus();
  };

  // Compact pill button style
  const pillBtn = 'px-2 py-1 rounded-full text-[11px] transition-all';
  const pillBtnDefault = `${pillBtn} bg-black/10 hover:bg-black/20 text-gray-700`;
  const pillBtnActive = `${pillBtn} bg-blue-500 text-white`;

  return (
    <>
      {showTemplatesModal && (
        <TemplatesModal onSelectTemplate={handleLoadTemplate} onClose={() => setShowTemplatesModal(false)} />
      )}
      <div
        ref={panelRef}
        className={`fixed top-2 left-2 z-50 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!showTabMenu && !showToolsMenu) setIsExpanded(false);
        }}
      >
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-1 py-1 border border-gray-200/50">
        {/* Tab Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTabMenu(!showTabMenu);
              setShowToolsMenu(false);
            }}
            className={`${pillBtnDefault} flex items-center gap-1 min-w-[60px] justify-center`}
            title="Switch layout tab"
          >
            <span className="truncate max-w-[80px]">{activeTab?.name || 'Layout'}</span>
            <span className="text-[9px] opacity-60">{showTabMenu ? '▴' : '▾'}</span>
          </button>
          {showTabMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[180px]">
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase">Layouts</div>
              {layoutTabs?.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer ${tab.id === activeLayoutId ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setActiveLayoutId(tab.id);
                    setShowTabMenu(false);
                  }}
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
                      className="flex-1 px-1 py-0 text-xs border rounded bg-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="flex-1 truncate">{tab.name}</span>
                      {tab.id === activeLayoutId && <span className="text-blue-500">✓</span>}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startLayoutRenaming(tab.id, tab.name);
                        }}
                        className="text-gray-400 hover:text-blue-500 text-xs"
                        title="Rename"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                  {layoutTabs.length > 1 &&
                    tab.id === activeLayoutId &&
                    layoutRenamingId !== tab.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayoutTab(tab.id);
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    )}
                </div>
              ))}
              <div className="border-t my-1" />
              <button
                onClick={() => {
                  addLayoutTab('blank');
                  setShowTabMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-green-600"
              >
                + New Blank Layout
              </button>
              <button
                onClick={() => {
                  addLayoutTab('slides');
                  setShowTabMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-green-600"
              >
                + New Slides Layout
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-300" />

        {/* Tools Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowToolsMenu(!showToolsMenu);
              setShowTabMenu(false);
            }}
            className={pillBtnDefault}
            title="Tools menu"
          >
            ⚙
          </button>
          {showToolsMenu && (
            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-[200px] max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowStudentManager(true);
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                👥 Students/Stations
              </button>
              <button
                onClick={() => {
                  setShowRosterManager(true);
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
              >
                📋 Student Roster
              </button>
              <div className="border-t my-1" />
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Data</div>
              <button
                onClick={exportData}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
              >
                📥 Export Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
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
                  if (
                    !window.confirm(
                      'This will erase all your data and reset everything to defaults. Are you sure?'
                    )
                  )
                    return;
                  localStorage.removeItem(STORAGE_KEY);
                  window.location.reload();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600"
              >
                ↺ Reset to Defaults
              </button>
              <div className="border-t my-1" />
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">Display</div>
              <button
                onClick={() => {
                  setShowTemplatesModal(true);
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
              >
                📚 Load Template
              </button>
              <button
                onClick={() => {
                  const name = prompt('Template name:');
                  if (!name || !name.trim()) return;
                  const description = prompt('Description (optional):') || '';
                  const result = saveCurrentLayoutAsTemplate(name.trim(), description.trim());
                  if (result) {
                    alert(`✓ Template "${name.trim()}" saved successfully!`);
                  } else {
                    alert('Failed to save template. Please try again.');
                  }
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
              >
                💾 Save as Template
              </button>
              <button
                onClick={() => setPerformanceMode(!performanceMode)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center justify-between"
              >
                <span>⚡ Performance Mode</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${performanceMode ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {performanceMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {isEditMode && (
                <>
                  <div className="border-t my-1" />
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">
                    Edit Tools
                  </div>
                  <button
                    onClick={() => {
                      addBox();
                      closeAllMenus();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  >
                    ➕ Add Box
                  </button>
                  <button
                    onClick={() => {
                      equalizeStationSizes();
                      closeAllMenus();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100"
                  >
                    ⬜ Equal Size
                  </button>
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">
                    Stations
                  </div>
                  {missingStations.length === 0 && (
                    <div className="px-3 py-1.5 text-xs text-gray-400">All stations added</div>
                  )}
                  {missingStations.map((c) => {
                    const s = stationColors[c] || COLORS.stations[c];
                    return (
                      <button
                        key={c}
                        onClick={() => {
                          addStationToTab(c);
                          closeAllMenus();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.bg }} />
                        {teacherNames[c]}
                      </button>
                    );
                  })}
                </>
              )}

              {isLayoutEditMode && (
                <>
                  <div className="border-t my-1" />
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase">
                    Widgets
                  </div>
                  <button
                    onClick={() => setShowWidgetsList(!showWidgetsList)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>+ Add/Remove Widgets</span>
                    {hiddenWidgets.length > 0 && (
                      <span className="text-green-600 font-medium">({hiddenWidgets.length})</span>
                    )}
                    <span className="ml-auto text-gray-400">{showWidgetsList ? '▴' : '▾'}</span>
                  </button>
                  {showWidgetsList && (
                    <div className="py-1 border-t border-b bg-gray-50">
                      {ALL_WIDGET_IDS.map((id) => {
                        const meta = widgetRegistry[id];
                        const isActive = activeWidgetIds.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => {
                              if (isActive) {
                                if (state._removeWidget) state._removeWidget(id);
                              } else {
                                if (state._addWidget) state._addWidget(id);
                              }
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 ${isActive ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                          >
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
                    <button
                      onClick={() => {
                        state._resetLayout();
                        closeAllMenus();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600"
                    >
                      ↺ Reset Layout
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Edit Layout Toggle */}
        <button
          onClick={() => {
            toggleLayoutEditMode();
            closeAllMenus();
          }}
          className={isLayoutEditMode ? pillBtnActive : pillBtnDefault}
          title={isLayoutEditMode ? 'Exit layout edit mode' : 'Edit layout'}
        >
          {isLayoutEditMode ? '✓' : '📐'}
        </button>
      </div>

      {/* Keyboard hint */}
      {isExpanded && (
        <div className="text-[9px] text-gray-400 text-center mt-1 opacity-0 hover:opacity-100 transition-opacity">
          Double-click tab to rename
        </div>
      )}
    </div>
    </>
  );
};

export default FloatingControls;
