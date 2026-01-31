import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  DEFAULT_STUDENTS, DEFAULT_TEACHER_NAMES, DEFAULT_STATION_CONFIG,
  DEFAULT_ROTATION_ORDER, DEFAULT_STATION_COLORS, STATION_COLOR_OPTIONS
} from '../constants';
import { playSound } from '../constants/sounds';
import { STORAGE_KEY, loadSaved } from '../hooks/usePersistedState';

const AppStateContext = createContext(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function AppStateProvider({ children }) {
  const [students, setStudents] = useState(() => loadSaved('students', DEFAULT_STUDENTS));
  const [totalTime, setTotalTime] = useState(() => loadSaved('totalTime', 900));
  const [timeRemaining, setTimeRemaining] = useState(() => loadSaved('totalTime', 900));
  const [isRunning, setIsRunning] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(() => loadSaved('autoRepeat', true));
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [rightNowText, setRightNowText] = useState(() => loadSaved('rightNowText', 'Working Quietly'));
  const [bannerColor, setBannerColor] = useState(() => loadSaved('bannerColor', '#0D9488'));
  const [bannerFontSize, setBannerFontSize] = useState(() => loadSaved('bannerFontSize', 28));
  const [firstThen, setFirstThen] = useState(() => loadSaved('firstThen', { firstIcon: '📚', firstLabel: 'Reading', thenIcon: '🎮', thenLabel: 'Free Time' }));
  const [rotationSound, setRotationSound] = useState(() => loadSaved('rotationSound', 'chime'));
  const [voiceLevel, setVoiceLevel] = useState(() => loadSaved('voiceLevel', 1));
  const [countdownEvent, setCountdownEvent] = useState(() => loadSaved('countdownEvent', 'Lunch'));
  const [countdownTime, setCountdownTime] = useState(() => loadSaved('countdownTime', '12:00'));
  const [quickMessage, setQuickMessage] = useState(() => loadSaved('quickMessage', 'Great job! ⭐'));
  const [quickMessageFontSize, setQuickMessageFontSize] = useState(() => loadSaved('quickMessageFontSize', 16));
  const [quickMessageColor, setQuickMessageColor] = useState(() => loadSaved('quickMessageColor', '#F59E0B'));
  const [widgetColors, setWidgetColors] = useState(() => loadSaved('widgetColors', {}));
  const [starPoints, setStarPoints] = useState(() => loadSaved('starPoints', 0));
  const [studentGoals, setStudentGoals] = useState(() => loadSaved('studentGoals', {}));
  const [customSounds, setCustomSounds] = useState(() => loadSaved('customSounds', []));
  const [stationColors, setStationColors] = useState(() => loadSaved('stationColors', DEFAULT_STATION_COLORS));
  const [rotationOrder, setRotationOrder] = useState(() => {
    const saved = loadSaved('rotationOrder', DEFAULT_ROTATION_ORDER);
    // Repair: if stations were accidentally removed by the cross-tab bug, restore defaults
    if (saved.length < DEFAULT_ROTATION_ORDER.length) {
      const missing = DEFAULT_ROTATION_ORDER.filter(c => !saved.includes(c));
      if (missing.length > 0) return [...saved, ...missing];
    }
    return saved;
  });
  const [timerStyle, setTimerStyle] = useState(() => loadSaved('timerStyle', 'ring'));
  const [soundVolume, setSoundVolume] = useState(() => loadSaved('soundVolume', 0.7));

  // Floor plan tabs
  const [floorPlans, setFloorPlans] = useState(() => {
    const saved = loadSaved('floorPlans', null);
    if (saved) {
      return saved.map(fp => ({
        ...fp,
        teacherNames: fp.teacherNames || loadSaved('teacherNames', DEFAULT_TEACHER_NAMES)
      }));
    }
    const oldStations = loadSaved('stationConfigs', DEFAULT_STATION_CONFIG);
    const oldBoxes = loadSaved('customBoxes', []);
    const oldTeachers = loadSaved('teacherNames', DEFAULT_TEACHER_NAMES);
    return [{
      id: 'plan-1',
      name: 'Main Layout',
      stationConfigs: oldStations,
      customBoxes: oldBoxes,
      teacherNames: oldTeachers
    }];
  });
  const [activeFloorPlanId, setActiveFloorPlanId] = useState(() => loadSaved('activeFloorPlanId', 'plan-1'));
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Derived floor plan data
  const activeFloorPlan = floorPlans.find(fp => fp.id === activeFloorPlanId) || floorPlans[0];
  const stationConfigs = activeFloorPlan.stationConfigs;
  const customBoxes = activeFloorPlan.customBoxes;
  const teacherNames = activeFloorPlan.teacherNames || DEFAULT_TEACHER_NAMES;
  const customStationColors = activeFloorPlan.customStationColors || {};
  const allStationColors = { ...stationColors, ...customStationColors };
  const tabStationKeys = Object.keys(stationConfigs);

  const setStationConfigs = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, stationConfigs: typeof updater === 'function' ? updater(fp.stationConfigs) : updater }
      : fp
    ));
  };
  const setCustomBoxes = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, customBoxes: typeof updater === 'function' ? updater(fp.customBoxes) : updater }
      : fp
    ));
  };
  const setTeacherNames = (updater) => {
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, teacherNames: typeof updater === 'function' ? updater(fp.teacherNames || DEFAULT_TEACHER_NAMES) : updater }
      : fp
    ));
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [showAddStationMenu, setShowAddStationMenu] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showFirstThenEditor, setShowFirstThenEditor] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const floorPlanRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementPhase, setAnnouncementPhase] = useState('start');
  const [animationTargets, setAnimationTargets] = useState({});

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        students, totalTime, autoRepeat, rightNowText, bannerColor, bannerFontSize, firstThen,
        rotationSound, voiceLevel, countdownEvent, countdownTime,
        quickMessage, quickMessageFontSize, quickMessageColor, widgetColors, starPoints, studentGoals, floorPlans, activeFloorPlanId, customSounds, stationColors, rotationOrder, timerStyle, soundVolume
      }));
    } catch (e) {}
  }, [students, totalTime, autoRepeat, rightNowText, bannerColor, bannerFontSize, firstThen,
      rotationSound, voiceLevel, countdownEvent, countdownTime,
      quickMessage, quickMessageFontSize, quickMessageColor, widgetColors, starPoints, studentGoals, floorPlans, activeFloorPlanId, customSounds, stationColors, rotationOrder, timerStyle, soundVolume]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) { if (autoRepeat) { triggerRotation(); return totalTime; } setIsRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, autoRepeat, totalTime]);

  const getNextGroup = (g) => rotationOrder[(rotationOrder.indexOf(g) + 1) % rotationOrder.length];

  const triggerRotation = () => {
    if (isAnimating || isEditMode) return;
    playSound(rotationSound, customSounds, soundVolume);
    setShowAnnouncement(true); setAnnouncementPhase('start');
    setTimeout(() => { setAnnouncementPhase('moving'); setIsAnimating(true); const t = {}; students.forEach(s => { t[s.id] = getNextGroup(s.group); }); setAnimationTargets(t); }, 1500);
    setTimeout(() => setShowAnnouncement(false), 3000);
    setTimeout(() => { setStudents(p => p.map(s => ({ ...s, group: getNextGroup(s.group) }))); setAnimationTargets({}); setIsAnimating(false); }, 4500);
  };

  const addBox = () => setCustomBoxes(p => [...p, { id: `box-${Date.now()}`, top: 120, left: 180, width: 45, height: 45, label: '', icon: '', color: '#6B7280', assignedStudents: [] }]);

  const addFloorPlan = () => {
    const newId = `plan-${Date.now()}`;
    setFloorPlans(prev => [...prev, {
      id: newId,
      name: `Layout ${prev.length + 1}`,
      stationConfigs: {},
      customBoxes: [],
      teacherNames: { ...DEFAULT_TEACHER_NAMES }
    }]);
    setActiveFloorPlanId(newId);
  };

  const addStationToTab = (color) => {
    const defaultPositions = DEFAULT_STATION_CONFIG[color] || { top: 50, left: 50, width: 100, height: 65 };
    setStationConfigs(p => ({ ...p, [color]: { ...defaultPositions } }));
  };

  const addCustomStation = () => {
    const id = `station-${Date.now()}`;
    const colorOpt = STATION_COLOR_OPTIONS[Math.floor(Math.random() * STATION_COLOR_OPTIONS.length)];
    setStationConfigs(p => ({ ...p, [id]: { top: 50, left: 50, width: 100, height: 65 } }));
    setTeacherNames(p => ({ ...p, [id]: 'New Station' }));
    setFloorPlans(prev => prev.map(fp => fp.id === activeFloorPlanId
      ? { ...fp, customStationColors: { ...(fp.customStationColors || {}), [id]: { bg: colorOpt.bg, light: colorOpt.light } } }
      : fp
    ));
  };

  const removeStationFromTab = (color) => {
    setStationConfigs(p => {
      const next = { ...p };
      delete next[color];
      return next;
    });
    // Only remove from global rotation order if no other tab still has this station
    const existsOnOtherTab = floorPlans.some(fp => fp.id !== activeFloorPlanId && fp.stationConfigs[color]);
    if (!existsOnOtherTab && rotationOrder.includes(color)) {
      const newOrder = rotationOrder.filter(k => k !== color);
      setRotationOrder(newOrder);
      const firstRemaining = newOrder[0];
      if (firstRemaining) {
        setStudents(prev => prev.map(s => s.group === color ? { ...s, group: firstRemaining } : s));
      }
    }
  };

  const equalizeStationSizes = () => {
    const stationKeys = tabStationKeys;
    const allItems = [];
    stationKeys.forEach(c => allItems.push({ type: 'station', key: c, w: stationConfigs[c].width, h: stationConfigs[c].height }));
    customBoxes.forEach(b => allItems.push({ type: 'box', key: b.id, w: b.width, h: b.height }));
    if (allItems.length === 0) return;
    const targetW = allItems[0].w;
    const targetH = allItems[0].h;
    if (stationKeys.length > 0) {
      setStationConfigs(p => {
        const next = { ...p };
        stationKeys.forEach(c => { next[c] = { ...next[c], width: targetW, height: targetH }; });
        return next;
      });
    }
    if (customBoxes.length > 0) {
      setCustomBoxes(p => p.map(b => ({ ...b, width: targetW, height: targetH })));
    }
  };

  const deleteFloorPlan = (id) => {
    if (floorPlans.length <= 1) return;
    if (!window.confirm('Delete this floor plan layout?')) return;
    setFloorPlans(prev => prev.filter(fp => fp.id !== id));
    if (activeFloorPlanId === id) {
      setActiveFloorPlanId(floorPlans.find(fp => fp.id !== id).id);
    }
  };

  const startRenamingTab = (id, currentName) => {
    setRenamingTabId(id);
    setRenameValue(currentName);
  };

  const finishRenamingTab = () => {
    if (renamingTabId && renameValue.trim()) {
      setFloorPlans(prev => prev.map(fp => fp.id === renamingTabId ? { ...fp, name: renameValue.trim() } : fp));
    }
    setRenamingTabId(null);
  };

  // Mutual exclusion for edit modes
  const enterEditMode = () => { setIsEditMode(true); setIsLayoutEditMode(false); setShowAddStationMenu(false); };
  const exitEditMode = () => { setIsEditMode(false); setShowAddStationMenu(false); };
  const enterLayoutEditMode = () => { setIsLayoutEditMode(true); setIsEditMode(false); setShowAddStationMenu(false); };
  const exitLayoutEditMode = () => { setIsLayoutEditMode(false); };
  const toggleEditMode = () => { if (isEditMode) exitEditMode(); else enterEditMode(); };
  const toggleLayoutEditMode = () => { if (isLayoutEditMode) exitLayoutEditMode(); else enterLayoutEditMode(); };

  const value = {
    // State
    students, setStudents,
    totalTime, setTotalTime,
    timeRemaining, setTimeRemaining,
    isRunning, setIsRunning,
    autoRepeat, setAutoRepeat,
    selectedStudentId, setSelectedStudentId,
    rightNowText, setRightNowText,
    bannerColor, setBannerColor,
    bannerFontSize, setBannerFontSize,
    firstThen, setFirstThen,
    rotationSound, setRotationSound,
    voiceLevel, setVoiceLevel,
    countdownEvent, setCountdownEvent,
    countdownTime, setCountdownTime,
    quickMessage, setQuickMessage,
    quickMessageFontSize, setQuickMessageFontSize,
    quickMessageColor, setQuickMessageColor,
    widgetColors, setWidgetColors,
    starPoints, setStarPoints,
    studentGoals, setStudentGoals,
    customSounds, setCustomSounds,
    stationColors, setStationColors,
    rotationOrder, setRotationOrder,
    timerStyle, setTimerStyle,
    soundVolume, setSoundVolume,
    floorPlans, setFloorPlans,
    activeFloorPlanId, setActiveFloorPlanId,
    renamingTabId, setRenamingTabId,
    renameValue, setRenameValue,

    // Derived
    activeFloorPlan,
    stationConfigs, setStationConfigs,
    customBoxes, setCustomBoxes,
    teacherNames, setTeacherNames,
    customStationColors,
    allStationColors,
    tabStationKeys,

    // UI state
    isEditMode, setIsEditMode,
    isLayoutEditMode, setIsLayoutEditMode,
    showAddStationMenu, setShowAddStationMenu,
    showStudentManager, setShowStudentManager,
    showFirstThenEditor, setShowFirstThenEditor,
    showGoalEditor, setShowGoalEditor,
    editingBox, setEditingBox,
    floorPlanRef,
    isAnimating, setIsAnimating,
    showAnnouncement, setShowAnnouncement,
    announcementPhase, setAnnouncementPhase,
    animationTargets, setAnimationTargets,

    // Actions
    triggerRotation,
    addBox,
    addFloorPlan,
    addStationToTab,
    addCustomStation,
    removeStationFromTab,
    equalizeStationSizes,
    deleteFloorPlan,
    startRenamingTab,
    finishRenamingTab,
    getNextGroup,
    enterEditMode,
    exitEditMode,
    enterLayoutEditMode,
    exitLayoutEditMode,
    toggleEditMode,
    toggleLayoutEditMode,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
