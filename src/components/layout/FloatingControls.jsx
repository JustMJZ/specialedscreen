import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { STORAGE_KEY } from '../../hooks/usePersistedState';
import { exportBackup, importBackup } from '../../utils/backupUtils';
import widgetRegistry from '../../config/widgetRegistry';
import TemplatesModal from '../modals/TemplatesModal';

const ALL_WIDGET_IDS = Object.keys(widgetRegistry);

// ── Shared design tokens ───────────────────────────────────────────────────

const glassPanel = {
  background: 'rgba(15,23,42,0.97)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 14,
  boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.25)',
};

// iOS-style colored icon pill
const Pip = ({ children, gradient }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
      background: gradient, fontSize: 14, lineHeight: 1, userSelect: 'none',
    }}
  >
    {children}
  </span>
);

// Pill toggle switch
const Toggle = ({ on }) => (
  <div
    style={{
      width: 34, height: 19, borderRadius: 10, flexShrink: 0, position: 'relative',
      background: on ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.15)',
      transition: 'background 0.2s',
    }}
  >
    <div
      style={{
        position: 'absolute', top: 2, left: on ? 17 : 2,
        width: 15, height: 15, borderRadius: 8, background: '#fff',
        transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}
    />
  </div>
);

// Thin section divider
const Divider = ({ label }) => (
  <>
    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
    {label && (
      <div style={{
        padding: '5px 12px 2px', fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.09em',
        color: 'rgba(148,163,184,0.5)',
      }}>
        {label}
      </div>
    )}
  </>
);

// Clickable row inside a dropdown
const MenuRow = ({ pip, gradient, label, onClick, right, danger }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', background: hovered
          ? (danger ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.08)')
          : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        borderRadius: 9, transition: 'background 0.12s',
        color: danger ? '#f87171' : '#e2e8f0',
      }}
    >
      <Pip gradient={gradient}>{pip}</Pip>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
      {right && <span style={{ flexShrink: 0 }}>{right}</span>}
    </button>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

const FloatingControls = ({ onOpenSidebar }) => {
  const state = useAppState();
  const {
    layoutTabs, activeLayoutId, setActiveLayoutId,
    layoutRenamingId, layoutRenameValue, setLayoutRenameValue,
    startLayoutRenaming, finishLayoutRenaming, setLayoutRenamingId,
    addLayoutTab, deleteLayoutTab,
    setShowStudentManager, setShowRosterManager,
    isEditMode, addBox, equalizeStationSizes,
    rotationOrder, stationConfigs, stationColors, teacherNames, addStationToTab,
    isLayoutEditMode, toggleLayoutEditMode,
    performanceMode, setPerformanceMode,
    isDarkMode, setIsDarkMode,
    isWidgetLocked, setIsWidgetLocked,
    loadTemplate, saveCurrentLayoutAsTemplate,
  } = state;

  const [showTabMenu, setShowTabMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showWidgetsMenu, setShowWidgetsMenu] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowTabMenu(false);
        setShowToolsMenu(false);
        setShowWidgetsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportData = () => exportBackup(closeAllMenus);
  const importData = (e) => importBackup(e);

  const activeTab = layoutTabs?.find((t) => t.id === activeLayoutId);
  const missingStations = rotationOrder.filter((c) => !stationConfigs[c]);
  const activeWidgetIds = state._activeWidgetIds || [];
  // For multi-instance widgets, extract base types from instance IDs (e.g. 'textBox__123' → 'textBox')
  const activeBaseTypes = activeWidgetIds.map((id) => { const s = id.indexOf('__'); return s !== -1 ? id.slice(0, s) : id; });
  const hiddenWidgets = ALL_WIDGET_IDS.filter((id) => {
    if (widgetRegistry[id]?.multiInstance) return false; // always addable
    return !activeBaseTypes.includes(id);
  });

  const closeAllMenus = () => {
    setShowTabMenu(false);
    setShowToolsMenu(false);
    setShowWidgetsMenu(false);
  };

  const handleLoadTemplate = (templateId) => {
    loadTemplate(templateId);
    closeAllMenus();
  };

  // Top-bar button: shared base style
  const barBtnBase = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 99,
    fontSize: 12, fontWeight: 600,
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s',
  };

  return (
    <>
      {showTemplatesModal && (
        <TemplatesModal onSelectTemplate={handleLoadTemplate} onClose={() => setShowTemplatesModal(false)} />
      )}

      <div
        ref={panelRef}
        className={`fixed top-2 left-2 z-50 transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => { if (!showTabMenu && !showToolsMenu && !showWidgetsMenu) setIsExpanded(false); }}
      >
        {/* ── Top bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 99, padding: '4px 6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>

          {/* Hamburger — opens feature sidebar */}
          <BarButton
            base={barBtnBase}
            onClick={onOpenSidebar}
            title="Features"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="3.5" x2="13" y2="3.5" />
              <line x1="1" y1="7" x2="13" y2="7" />
              <line x1="1" y1="10.5" x2="13" y2="10.5" />
            </svg>
          </BarButton>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

          {/* Layout tab selector */}
          <div className="relative">
            <BarButton
              active={showTabMenu}
              base={barBtnBase}
              onClick={() => { setShowTabMenu(!showTabMenu); setShowToolsMenu(false); }}
              title="Switch layout"
            >
              <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTab?.name || 'Layout'}
              </span>
              <span style={{ fontSize: 8, opacity: 0.55 }}>{showTabMenu ? '▴' : '▾'}</span>
            </BarButton>

            {showTabMenu && (
              <div style={{ ...glassPanel, position: 'absolute', left: 0, top: 'calc(100% + 8px)', minWidth: 210, padding: '6px' }}>
                <div style={{ padding: '2px 10px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(148,163,184,0.5)' }}>
                  Layouts
                </div>
                {layoutTabs?.map((tab) => (
                  <TabRow
                    key={tab.id}
                    tab={tab}
                    activeLayoutId={activeLayoutId}
                    layoutRenamingId={layoutRenamingId}
                    layoutRenameValue={layoutRenameValue}
                    layoutTabsLength={layoutTabs.length}
                    onSelect={() => { setActiveLayoutId(tab.id); setShowTabMenu(false); }}
                    onDoubleClick={() => startLayoutRenaming(tab.id, tab.name)}
                    onRenameChange={(e) => setLayoutRenameValue(e.target.value)}
                    onRenameBlur={finishLayoutRenaming}
                    onRenameKeyDown={(e) => {
                      if (e.key === 'Enter') finishLayoutRenaming();
                      if (e.key === 'Escape') setLayoutRenamingId(null);
                    }}
                    onStartRename={(e) => { e.stopPropagation(); startLayoutRenaming(tab.id, tab.name); }}
                    onDelete={(e) => { e.stopPropagation(); deleteLayoutTab(tab.id); }}
                  />
                ))}
                <Divider />
                <MenuRow pip="+" gradient="linear-gradient(135deg,#22c55e,#16a34a)" label="New Blank Layout"
                  onClick={() => { addLayoutTab('blank'); setShowTabMenu(false); }} />
                <MenuRow pip="⊞" gradient="linear-gradient(135deg,#22c55e,#0d9488)" label="New Slides Layout"
                  onClick={() => { addLayoutTab('slides'); setShowTabMenu(false); }} />
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

          {/* Tools menu */}
          <div className="relative">
            <BarButton
              active={showToolsMenu}
              base={barBtnBase}
              onClick={() => { setShowToolsMenu(!showToolsMenu); setShowTabMenu(false); setShowWidgetsMenu(false); }}
              title="Tools"
            >
              ⚙
            </BarButton>

            {showToolsMenu && (
              <div style={{ ...glassPanel, position: 'absolute', left: 0, top: 'calc(100% + 8px)', minWidth: 252, padding: '6px', maxHeight: '72vh', overflowY: 'auto' }}>

                <MenuRow pip="👥" gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" label="Students & Stations"
                  onClick={() => { setShowStudentManager(true); closeAllMenus(); }} />
                <MenuRow pip="📋" gradient="linear-gradient(135deg,#10b981,#059669)" label="Student Roster"
                  onClick={() => { setShowRosterManager(true); closeAllMenus(); }} />

                <Divider label="Data" />
                <MenuRow pip="⬇" gradient="linear-gradient(135deg,#6366f1,#4338ca)" label="Export Data" onClick={exportData} />
                <MenuRow pip="⬆" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" label="Import Data"
                  onClick={() => fileInputRef.current?.click()} />
                <input ref={fileInputRef} type="file" accept=".json" onChange={importData} className="hidden" />
                <MenuRow pip="↺" gradient="linear-gradient(135deg,#ef4444,#dc2626)" label="Reset to Defaults" danger
                  onClick={() => {
                    if (!window.confirm('This will erase all your data and reset everything to defaults. Are you sure?')) return;
                    localStorage.removeItem(STORAGE_KEY);
                    window.location.reload();
                  }}
                />

                <Divider label="Display" />
                <MenuRow pip="📚" gradient="linear-gradient(135deg,#f59e0b,#d97706)" label="Load Template"
                  onClick={() => { setShowTemplatesModal(true); closeAllMenus(); }} />
                <MenuRow pip="💾" gradient="linear-gradient(135deg,#14b8a6,#0d9488)" label="Save as Template"
                  onClick={() => {
                    const name = prompt('Template name:');
                    if (!name || !name.trim()) return;
                    const description = prompt('Description (optional):') || '';
                    const result = saveCurrentLayoutAsTemplate(name.trim(), description.trim());
                    alert(result ? `Template "${name.trim()}" saved!` : 'Failed to save template.');
                    closeAllMenus();
                  }}
                />
                <MenuRow
                  pip="🌙" gradient="linear-gradient(135deg,#3b82f6,#1e40af)"
                  label="Dark Mode"
                  right={<Toggle on={isDarkMode} />}
                  onClick={() => setIsDarkMode(!isDarkMode)}
                />
                <MenuRow
                  pip="🔒" gradient="linear-gradient(135deg,#64748b,#334155)"
                  label="Widget Lock"
                  right={<Toggle on={isWidgetLocked} />}
                  onClick={() => setIsWidgetLocked(!isWidgetLocked)}
                />
                <MenuRow
                  pip="⚡" gradient="linear-gradient(135deg,#f59e0b,#ea580c)"
                  label="Performance Mode"
                  right={<Toggle on={performanceMode} />}
                  onClick={() => setPerformanceMode(!performanceMode)}
                />

                {isEditMode && (
                  <>
                    <Divider label="Edit Tools" />
                    <MenuRow pip="+" gradient="linear-gradient(135deg,#38bdf8,#0ea5e9)" label="Add Box"
                      onClick={() => { addBox(); closeAllMenus(); }} />
                    <MenuRow pip="⬛" gradient="linear-gradient(135deg,#64748b,#475569)" label="Equal Size"
                      onClick={() => { equalizeStationSizes(); closeAllMenus(); }} />
                    <Divider label="Stations" />
                    {missingStations.length === 0 && (
                      <div style={{ padding: '5px 12px', fontSize: 12, color: 'rgba(100,116,139,0.7)' }}>
                        All stations added
                      </div>
                    )}
                    {missingStations.map((c) => {
                      const s = stationColors[c] || COLORS.stations[c];
                      return (
                        <StationRow
                          key={c}
                          color={s.bg}
                          border={s.color}
                          label={teacherNames[c]}
                          onClick={() => { addStationToTab(c); closeAllMenus(); }}
                        />
                      );
                    })}
                  </>
                )}

              </div>
            )}
          </div>

          {/* Widgets menu */}
          <div className="relative">
            <BarButton
              active={showWidgetsMenu}
              base={barBtnBase}
              onClick={() => { setShowWidgetsMenu(!showWidgetsMenu); setShowTabMenu(false); setShowToolsMenu(false); }}
              title="Widgets"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1" width="5" height="5" rx="1" />
                <rect x="8" y="1" width="5" height="5" rx="1" />
                <rect x="1" y="8" width="5" height="5" rx="1" />
                <rect x="8" y="8" width="5" height="5" rx="1" />
              </svg>
              {hiddenWidgets.length > 0 && (
                <span style={{ background: 'rgba(34,197,94,0.25)', color: '#4ade80', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>
                  {hiddenWidgets.length}
                </span>
              )}
            </BarButton>

            {showWidgetsMenu && (
              <div style={{ ...glassPanel, position: 'absolute', left: 0, top: 'calc(100% + 8px)', minWidth: 230, padding: '6px' }}>
                <div style={{ padding: '2px 10px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(148,163,184,0.5)' }}>
                  {activeWidgetIds.length} active · {hiddenWidgets.length} hidden
                </div>
                {ALL_WIDGET_IDS.map((id) => {
                  const meta = widgetRegistry[id];
                  const isMulti = !!meta?.multiInstance;
                  const isActive = !isMulti && activeBaseTypes.includes(id);
                  return (
                    <WidgetRow
                      key={id}
                      icon={meta.icon}
                      label={meta.label}
                      isActive={isActive}
                      isMulti={isMulti}
                      onClick={() => {
                        if (!isMulti && isActive) { if (state._removeWidget) state._removeWidget(id); }
                        else { if (state._addWidget) state._addWidget(id); }
                      }}
                    />
                  );
                })}
                {state._resetLayout && (
                  <>
                    <Divider />
                    <MenuRow pip="↺" gradient="linear-gradient(135deg,#ef4444,#dc2626)" label="Reset Layout" danger
                      onClick={() => { state._resetLayout(); closeAllMenus(); }} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Edit layout toggle */}
          <BarButton
            active={isLayoutEditMode}
            base={barBtnBase}
            onClick={() => { toggleLayoutEditMode(); closeAllMenus(); }}
            title={isLayoutEditMode ? 'Exit layout edit mode' : 'Edit layout'}
            activeColor="rgba(99,102,241,0.35)"
            activeTextColor="#a5b4fc"
          >
            {isLayoutEditMode ? '✓ Done' : '📐'}
          </BarButton>

        </div>

        {isExpanded && (
          <div style={{ fontSize: 9, color: 'rgba(148,163,184,0.45)', textAlign: 'center', marginTop: 4 }}>
            Double-click tab to rename
          </div>
        )}
      </div>
    </>
  );
};

// ── Small sub-components ───────────────────────────────────────────────────

// Top-bar button with hover/active state
const BarButton = ({ children, active, base, onClick, title, activeColor, activeTextColor, ...rest }) => {
  const [hovered, setHovered] = useState(false);
  const bg = active ? (activeColor || 'rgba(255,255,255,0.18)') : hovered ? 'rgba(255,255,255,0.11)' : 'transparent';
  const color = active ? (activeTextColor || '#ffffff') : 'rgba(226,232,240,0.9)';
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, background: bg, color, boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.18)' : 'none' }}
      {...rest}
    >
      {children}
    </button>
  );
};

// Layout tab row in the tab dropdown
const TabRow = ({ tab, activeLayoutId, layoutRenamingId, layoutRenameValue, layoutTabsLength, onSelect, onDoubleClick, onRenameChange, onRenameBlur, onRenameKeyDown, onStartRename, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = tab.id === activeLayoutId;
  const isRenaming = layoutRenamingId === tab.id;
  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
        background: isActive ? 'rgba(99,102,241,0.22)' : hovered ? 'rgba(255,255,255,0.07)' : 'transparent',
        color: isActive ? '#a5b4fc' : '#cbd5e1',
        fontWeight: isActive ? 600 : 400,
        transition: 'background 0.12s',
      }}
    >
      {isRenaming ? (
        <input
          value={layoutRenameValue}
          onChange={onRenameChange}
          onBlur={onRenameBlur}
          onKeyDown={onRenameKeyDown}
          style={{ flex: 1, padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.5)', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 12, outline: 'none' }}
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.name}</span>
          <button onClick={onStartRename} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)', fontSize: 11, padding: '0 2px', lineHeight: 1 }} title="Rename">
            ✏️
          </button>
          {layoutTabsLength > 1 && isActive && !isRenaming && (
            <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', fontSize: 11, padding: '0 2px', lineHeight: 1 }}>
              ✕
            </button>
          )}
        </>
      )}
    </div>
  );
};

// Station color swatch row (in edit tools)
const StationRow = ({ color, border, label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
        textAlign: 'left', background: hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: '#e2e8f0', fontSize: 13, fontWeight: 500, transition: 'background 0.12s',
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 7, background: color, border: `2px solid ${border}`, flexShrink: 0 }} />
      {label}
    </button>
  );
};

// Individual widget toggle row
const WidgetRow = ({ icon, label, isActive, isMulti, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
        background: hovered ? (isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)') : 'transparent',
        color: '#cbd5e1', fontSize: 12, fontWeight: 500, transition: 'background 0.12s',
      }}
    >
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {isActive
        ? <span style={{ color: '#f87171', fontSize: 11, fontWeight: 700 }}>Remove</span>
        : <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>{isMulti ? '+ Add Another' : '+ Add'}</span>
      }
    </button>
  );
};

export default FloatingControls;
