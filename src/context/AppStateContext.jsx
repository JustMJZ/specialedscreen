import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import {
  DEFAULT_STUDENTS, DEFAULT_TEACHER_NAMES, DEFAULT_STATION_CONFIG,
  DEFAULT_ROTATION_ORDER, DEFAULT_STATION_COLORS, STATION_COLOR_OPTIONS
} from '../constants';
import { playSound } from '../constants/sounds';
import { STORAGE_KEY, loadSaved } from '../hooks/usePersistedState';

const LEGACY_LAYOUT_KEY = 'specialedscreen-layout';

function loadLegacyLayout() {
  try {
    const saved = localStorage.getItem(LEGACY_LAYOUT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

function getSavedMainLayoutId() {
  const saved = loadSaved('layoutTabs', null);
  if (Array.isArray(saved) && saved.length > 0) return saved[0].id;
  return 'layout-1';
}

function createDefaultRoster() {
  return DEFAULT_STUDENTS.map(s => ({
    id: `r-${s.id}`,
    name: s.name,
    photo: s.photo || null,
    emoji: s.emoji || null,
  }));
}

function createStudentId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function ensureUniqueStudents(list) {
  const seen = new Set();
  let changed = false;
  const next = (list || []).map(s => {
    let id = s.id;
    if (!id || seen.has(id)) {
      id = createStudentId();
      changed = true;
    }
    seen.add(id);
    return id === s.id ? s : { ...s, id };
  });
  return { next, changed };
}

function normalizeStudentsByLayout(saved, fallbackLayoutId) {
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
    const next = {};
    Object.keys(saved).forEach(id => {
      next[id] = ensureUniqueStudents(saved[id]).next;
    });
    return next;
  }
  const legacy = Array.isArray(saved) ? saved : DEFAULT_STUDENTS;
  return { [fallbackLayoutId]: ensureUniqueStudents(legacy).next };
}

function createEmptyFloorPlanTab(name = 'Main Layout') {
  return {
    id: `plan-${Date.now()}`,
    name,
    stationConfigs: {},
    customBoxes: [],
    teacherNames: { ...DEFAULT_TEACHER_NAMES },
  };
}

function createFloorPlanSet() {
  const tab = createEmptyFloorPlanTab();
  return { floorPlans: [tab], activeFloorPlanId: tab.id };
}

function createDefaultGoalLadder() {
  return {
    title: 'Goal Ladder',
    steps: Array.from({ length: 6 }, () => ''),
    completedCount: 0,
  };
}

const AppStateContext = createContext(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function AppStateProvider({ children }) {
  const [globalRoster, setGlobalRoster] = useState(() => loadSaved('globalRoster', createDefaultRoster()));
  const [studentsByLayout, setStudentsByLayout] = useState(() => {
    const saved = loadSaved('studentsByLayout', null);
    if (saved) return normalizeStudentsByLayout(saved, getSavedMainLayoutId());
    const legacy = loadSaved('students', DEFAULT_STUDENTS);
    return normalizeStudentsByLayout(legacy, getSavedMainLayoutId());
  });
  const [totalTime, setTotalTime] = useState(() => loadSaved('totalTime', 900));
  const [timeRemaining, setTimeRemaining] = useState(() => loadSaved('totalTime', 900));
  const [isRunning, setIsRunning] = useState(false);
  const [autoRepeat, setAutoRepeat] = useState(() => loadSaved('autoRepeat', true));
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [rightNowText, setRightNowText] = useState(() => loadSaved('rightNowText', 'Working Quietly'));
  const [bannerFontSize, setBannerFontSize] = useState(() => loadSaved('bannerFontSize', 28));
  const [firstThen, setFirstThen] = useState(() => loadSaved('firstThen', { firstIcon: '📚', firstLabel: 'Reading', thenIcon: '🎮', thenLabel: 'Free Time' }));
  const [rotationSound, setRotationSound] = useState(() => loadSaved('rotationSound', 'chime'));
  const [voiceLevel, setVoiceLevel] = useState(() => loadSaved('voiceLevel', 1));
  const [countdownEvent, setCountdownEvent] = useState(() => loadSaved('countdownEvent', 'Lunch'));
  const [countdownTime, setCountdownTime] = useState(() => loadSaved('countdownTime', '12:00'));
  const [quickMessage, setQuickMessage] = useState(() => loadSaved('quickMessage', 'Great job! ⭐'));
  const [quickMessageFontSize, setQuickMessageFontSize] = useState(() => loadSaved('quickMessageFontSize', 16));
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState(() => loadSaved('googleSlidesUrl', ''));
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(() => loadSaved('youtubeVideoUrl', ''));
  const [layoutTabs, setLayoutTabs] = useState(() => {
    const saved = loadSaved('layoutTabs', null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    const legacy = loadLegacyLayout();
    return [{
      id: 'layout-1',
      name: 'Main Layout',
      layout: legacy && legacy.length > 0 ? legacy : []
    }];
  });
  const [activeLayoutId, setActiveLayoutId] = useState(() => loadSaved('activeLayoutId', null));
  const [layoutRenamingId, setLayoutRenamingId] = useState(null);
  const [layoutRenameValue, setLayoutRenameValue] = useState('');
  const [widgetColorsByLayout, setWidgetColorsByLayout] = useState(() => {
    const saved = loadSaved('widgetColorsByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacy = loadSaved('widgetColors', {});
    return { [getSavedMainLayoutId()]: legacy };
  });
  const [goalLaddersByLayout, setGoalLaddersByLayout] = useState(() => {
    const saved = loadSaved('goalLaddersByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    return { [getSavedMainLayoutId()]: createDefaultGoalLadder() };
  });
  const [starPoints, setStarPoints] = useState(() => loadSaved('starPoints', 0));
  const [studentGoals, setStudentGoals] = useState(() => loadSaved('studentGoals', {}));
  const [customSounds, setCustomSounds] = useState(() => loadSaved('customSounds', []));
  const [stationColorsByLayout, setStationColorsByLayout] = useState(() => {
    const saved = loadSaved('stationColorsByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacy = loadSaved('stationColors', DEFAULT_STATION_COLORS);
    return { [getSavedMainLayoutId()]: legacy };
  });
  const [rotationOrderByLayout, setRotationOrderByLayout] = useState(() => {
    const saved = loadSaved('rotationOrderByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacy = loadSaved('rotationOrder', DEFAULT_ROTATION_ORDER);
    return { [getSavedMainLayoutId()]: legacy };
  });
  const [timerStyle, setTimerStyle] = useState(() => loadSaved('timerStyle', 'ring'));
  const [soundVolume, setSoundVolume] = useState(() => loadSaved('soundVolume', 0.7));

  // Floor plan tabs per layout
  const [floorPlansByLayout, setFloorPlansByLayout] = useState(() => {
    const saved = loadSaved('floorPlansByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacyFloorPlans = loadSaved('floorPlans', null);
    const legacyActive = loadSaved('activeFloorPlanId', null);
    const savedLayouts = loadSaved('layoutTabs', null);
    const mainLayoutId = Array.isArray(savedLayouts) && savedLayouts.length > 0 ? savedLayouts[0].id : 'layout-1';
    if (legacyFloorPlans) {
      const normalized = legacyFloorPlans.map(fp => ({
        ...fp,
        teacherNames: fp.teacherNames || loadSaved('teacherNames', DEFAULT_TEACHER_NAMES)
      }));
      return {
        [mainLayoutId]: {
          floorPlans: normalized,
          activeFloorPlanId: legacyActive || normalized[0]?.id
        }
      };
    }
    return {};
  });
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const setStationConfigs = (updater) => {
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map(fp => fp.id === activeFloorPlanId
        ? { ...fp, stationConfigs: typeof updater === 'function' ? updater(fp.stationConfigs) : updater }
        : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setCustomBoxes = (updater) => {
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map(fp => fp.id === activeFloorPlanId
        ? { ...fp, customBoxes: typeof updater === 'function' ? updater(fp.customBoxes) : updater }
        : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setTeacherNames = (updater) => {
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map(fp => fp.id === activeFloorPlanId
        ? { ...fp, teacherNames: typeof updater === 'function' ? updater(fp.teacherNames || DEFAULT_TEACHER_NAMES) : updater }
        : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setStudents = (updater) => {
    setStudentsByLayout(prev => {
      const current = prev[activeLayoutId] || DEFAULT_STUDENTS;
      const nextRaw = typeof updater === 'function' ? updater(current) : updater;
      const { next } = ensureUniqueStudents(nextRaw);
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setRotationOrder = (updater) => {
    setRotationOrderByLayout(prev => {
      const current = prev[activeLayoutId] || DEFAULT_ROTATION_ORDER;
      const nextRaw = typeof updater === 'function' ? updater(current) : updater;
      const next = normalizeRotationOrder(nextRaw);
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setStationColors = (updater) => {
    setStationColorsByLayout(prev => {
      const current = prev[activeLayoutId] || DEFAULT_STATION_COLORS;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setWidgetColors = (updater) => {
    setWidgetColorsByLayout(prev => {
      const current = prev[activeLayoutId] || {};
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setCustomStationColorsForPlan = (colors) => {
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map(fp => fp.id === activeFloorPlanId
        ? { ...fp, customStationColors: colors }
        : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };

  const setActiveFloorPlanId = (id) => {
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      return { ...prev, [activeLayoutId]: { ...set, activeFloorPlanId: id } };
    });
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showRosterManager, setShowRosterManager] = useState(false);
  const [showFirstThenEditor, setShowFirstThenEditor] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const floorPlanRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementPhase, setAnnouncementPhase] = useState('start');
  const [animationTargets, setAnimationTargets] = useState({});

  useEffect(() => {
    if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) {
      const legacy = loadLegacyLayout();
      setLayoutTabs([{
        id: 'layout-1',
        name: 'Main Layout',
        layout: legacy && legacy.length > 0 ? legacy : []
      }]);
      return;
    }
    if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) return;
    if (!activeLayoutId || !layoutTabs.some(t => t.id === activeLayoutId)) {
      setActiveLayoutId(layoutTabs[0].id);
    }
  }, [layoutTabs, activeLayoutId]);

  const normalizeRotationOrder = (order) => {
    if (!Array.isArray(order)) return [];
    if (order.length === 0) return [];
    const current = order;
    if (current.length < DEFAULT_ROTATION_ORDER.length) {
      const missing = DEFAULT_ROTATION_ORDER.filter(c => !current.includes(c));
      if (missing.length > 0) return [...current, ...missing];
    }
    return current;
  };

  useEffect(() => {
    if (!activeLayoutId) return;
    setStudentsByLayout(prev => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: [] };
    });
    setStationColorsByLayout(prev => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: DEFAULT_STATION_COLORS };
    });
    setWidgetColorsByLayout(prev => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: {} };
    });
    setGoalLaddersByLayout(prev => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: createDefaultGoalLadder() };
    });
    setRotationOrderByLayout(prev => {
      const existing = prev[activeLayoutId];
      if (Array.isArray(existing)) return prev;
      return { ...prev, [activeLayoutId]: [] };
    });
  }, [activeLayoutId]);

  useEffect(() => {
    setStudentsByLayout(prev => {
      let changed = false;
      const next = {};
      Object.keys(prev || {}).forEach(id => {
        const { next: normalized, changed: c } = ensureUniqueStudents(prev[id]);
        if (c) changed = true;
        next[id] = normalized;
      });
      return changed ? next : prev;
    });
  }, []);

  const students = studentsByLayout[activeLayoutId] || [];
  const stationColors = stationColorsByLayout[activeLayoutId] || DEFAULT_STATION_COLORS;
  const widgetColors = widgetColorsByLayout[activeLayoutId] || {};
  const goalLadder = goalLaddersByLayout[activeLayoutId] || createDefaultGoalLadder();
  const rotationOrder = normalizeRotationOrder(rotationOrderByLayout[activeLayoutId]);

  const setGoalLadder = (updater) => {
    setGoalLaddersByLayout(prev => {
      const current = prev[activeLayoutId] || createDefaultGoalLadder();
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeLayoutId]: next };
    });
  };

  // Derived floor plan data (per active layout)
  const fallbackFloorPlanSet = useMemo(() => createFloorPlanSet(), [activeLayoutId]);
  const activeFloorPlanSet = floorPlansByLayout[activeLayoutId] || fallbackFloorPlanSet;
  const floorPlans = activeFloorPlanSet.floorPlans || [];
  const activeFloorPlanId = activeFloorPlanSet.activeFloorPlanId || floorPlans[0]?.id;
  const activeFloorPlan = floorPlans.find(fp => fp.id === activeFloorPlanId) || floorPlans[0] || {
    stationConfigs: {},
    customBoxes: [],
    teacherNames: DEFAULT_TEACHER_NAMES,
    customStationColors: {}
  };
  const stationConfigs = activeFloorPlan.stationConfigs || {};
  const customBoxes = activeFloorPlan.customBoxes || [];
  const teacherNames = activeFloorPlan.teacherNames || DEFAULT_TEACHER_NAMES;
  const customStationColors = activeFloorPlan.customStationColors || {};
  const allStationColors = { ...stationColors, ...customStationColors };
  const tabStationKeys = Object.keys(stationConfigs);
  const activeRotationOrder = rotationOrder.filter(k => tabStationKeys.includes(k));

  useEffect(() => {
    const layoutIds = Object.keys(floorPlansByLayout || {});
    if (layoutIds.length === 0) return;
    const hasStationsFor = (layoutId) => {
      const set = floorPlansByLayout[layoutId];
      const plan = set?.floorPlans?.find(fp => fp.id === set?.activeFloorPlanId) || set?.floorPlans?.[0];
      return !!(plan && plan.stationConfigs && Object.keys(plan.stationConfigs).length > 0);
    };
    setRotationOrderByLayout(prev => {
      let changed = false;
      const next = { ...prev };
      layoutIds.forEach(id => {
        if (!hasStationsFor(id) && Array.isArray(next[id]) && next[id].length > 0) {
          next[id] = [];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setStudentsByLayout(prev => {
      let changed = false;
      const next = { ...prev };
      layoutIds.forEach(id => {
        if (!hasStationsFor(id) && Array.isArray(next[id]) && next[id].length > 0) {
          next[id] = [];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [floorPlansByLayout]);

  useEffect(() => {
    if (!activeLayoutId) return;
    setFloorPlansByLayout(prev => {
      const existing = prev[activeLayoutId];
      if (!existing) {
        return { ...prev, [activeLayoutId]: createFloorPlanSet() };
      }
      if (!existing.floorPlans || existing.floorPlans.length === 0) {
        return { ...prev, [activeLayoutId]: createFloorPlanSet() };
      }
      if (!existing.activeFloorPlanId) {
        return { ...prev, [activeLayoutId]: { ...existing, activeFloorPlanId: existing.floorPlans[0].id } };
      }
      return prev;
    });
  }, [activeLayoutId]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        globalRoster, studentsByLayout, totalTime, autoRepeat, rightNowText, bannerFontSize, firstThen,
        rotationSound, voiceLevel, countdownEvent, countdownTime,
        quickMessage, quickMessageFontSize, googleSlidesUrl, youtubeVideoUrl,
        layoutTabs, activeLayoutId,
        widgetColorsByLayout, goalLaddersByLayout, starPoints, studentGoals, floorPlansByLayout,
        customSounds, stationColorsByLayout, rotationOrderByLayout, timerStyle, soundVolume
      }));
    } catch (e) {}
  }, [globalRoster, studentsByLayout, totalTime, autoRepeat, rightNowText, bannerFontSize, firstThen,
      rotationSound, voiceLevel, countdownEvent, countdownTime,
      quickMessage, quickMessageFontSize, googleSlidesUrl, youtubeVideoUrl, layoutTabs, activeLayoutId,
      widgetColorsByLayout, goalLaddersByLayout, starPoints, studentGoals, floorPlansByLayout,
      customSounds, stationColorsByLayout, rotationOrderByLayout, timerStyle, soundVolume]);

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

  const getNextGroup = (g, order) => order[(order.indexOf(g) + 1) % order.length];

  const triggerRotation = () => {
    if (isAnimating || isEditMode) return;
    if (!activeRotationOrder || activeRotationOrder.length === 0) return;
    playSound(rotationSound, customSounds, soundVolume);
    setShowAnnouncement(true); setAnnouncementPhase('start');
    setTimeout(() => {
      setAnnouncementPhase('moving');
      setIsAnimating(true);
      const t = {};
      students.forEach(s => {
        const current = activeRotationOrder.includes(s.group) ? s.group : activeRotationOrder[0];
        t[s.id] = getNextGroup(current, activeRotationOrder);
      });
      setAnimationTargets(t);
    }, 1500);
    setTimeout(() => setShowAnnouncement(false), 3000);
    setTimeout(() => {
      setStudents(p => p.map(s => {
        const current = activeRotationOrder.includes(s.group) ? s.group : activeRotationOrder[0];
        return { ...s, group: getNextGroup(current, activeRotationOrder) };
      }));
      setAnimationTargets({});
      setIsAnimating(false);
    }, 4500);
  };

  const addBox = () => setCustomBoxes(p => [...p, { id: `box-${Date.now()}`, top: 120, left: 180, width: 45, height: 45, label: '', icon: '', color: '#6B7280', assignedStudents: [] }]);

  const addFloorPlan = () => {
    const newId = `plan-${Date.now()}`;
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId] || createFloorPlanSet();
      const nextPlans = [...set.floorPlans, {
        id: newId,
        name: `Layout ${set.floorPlans.length + 1}`,
        stationConfigs: {},
        customBoxes: [],
        teacherNames: { ...DEFAULT_TEACHER_NAMES }
      }];
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans, activeFloorPlanId: newId } };
    });
  };

  const addStationToTab = (color) => {
    const defaultPositions = DEFAULT_STATION_CONFIG[color] || { top: 50, left: 50, width: 100, height: 65 };
    setStationConfigs(p => ({ ...p, [color]: { ...defaultPositions } }));
    setRotationOrder(prev => (prev.includes(color) ? prev : [...prev, color]));
  };

  const addCustomStation = () => {
    const id = `station-${Date.now()}`;
    const colorOpt = STATION_COLOR_OPTIONS[Math.floor(Math.random() * STATION_COLOR_OPTIONS.length)];
    setStationConfigs(p => ({ ...p, [id]: { top: 50, left: 50, width: 100, height: 65 } }));
    setTeacherNames(p => ({ ...p, [id]: 'New Station' }));
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map(fp => fp.id === activeFloorPlanId
        ? { ...fp, customStationColors: { ...(fp.customStationColors || {}), [id]: { bg: colorOpt.bg, light: colorOpt.light } } }
        : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
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
    setFloorPlansByLayout(prev => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.filter(fp => fp.id !== id);
      const nextActive = activeFloorPlanId === id ? nextPlans[0]?.id : set.activeFloorPlanId;
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans, activeFloorPlanId: nextActive } };
    });
  };

  const startRenamingTab = (id, currentName) => {
    setRenamingTabId(id);
    setRenameValue(currentName);
  };

  const finishRenamingTab = () => {
    if (renamingTabId && renameValue.trim()) {
      setFloorPlansByLayout(prev => {
        const set = prev[activeLayoutId];
        if (!set) return prev;
        const nextPlans = set.floorPlans.map(fp => fp.id === renamingTabId ? { ...fp, name: renameValue.trim() } : fp);
        return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
      });
    }
    setRenamingTabId(null);
  };

  const addLayoutTab = (type = 'blank') => {
    const id = `layout-${Date.now()}`;
    const name = type === 'slides' ? 'Slides' : `Layout ${layoutTabs.length + 1}`;
    const layout = type === 'slides'
      ? [{ i: 'googleSlides', x: 0, y: 0, w: 12, h: 18 }]
      : [];
    setLayoutTabs(prev => [...prev, { id, name, layout }]);
    setFloorPlansByLayout(prev => ({ ...prev, [id]: createFloorPlanSet() }));
    setStudentsByLayout(prev => ({ ...prev, [id]: [] }));
    setStationColorsByLayout(prev => ({ ...prev, [id]: DEFAULT_STATION_COLORS }));
    setWidgetColorsByLayout(prev => ({ ...prev, [id]: {} }));
    setGoalLaddersByLayout(prev => ({ ...prev, [id]: createDefaultGoalLadder() }));
    setRotationOrderByLayout(prev => ({ ...prev, [id]: [] }));
    setActiveLayoutId(id);
  };

  const deleteLayoutTab = (id) => {
    if (layoutTabs.length <= 1) return;
    if (!window.confirm('Delete this layout tab?')) return;
    setLayoutTabs(prev => {
      const nextTabs = prev.filter(t => t.id !== id);
      if (activeLayoutId === id && nextTabs.length > 0) {
        setActiveLayoutId(nextTabs[0].id);
      }
      return nextTabs;
    });
    setFloorPlansByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStudentsByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStationColorsByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setWidgetColorsByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setGoalLaddersByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRotationOrderByLayout(prev => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const startLayoutRenaming = (id, currentName) => {
    setLayoutRenamingId(id);
    setLayoutRenameValue(currentName);
  };

  const finishLayoutRenaming = () => {
    if (layoutRenamingId && layoutRenameValue.trim()) {
      setLayoutTabs(prev => prev.map(t => t.id === layoutRenamingId ? { ...t, name: layoutRenameValue.trim() } : t));
    }
    setLayoutRenamingId(null);
  };

  // Mutual exclusion for edit modes
  const enterEditMode = () => { setIsEditMode(true); setIsLayoutEditMode(false); };
  const exitEditMode = () => { setIsEditMode(false); };
  const enterLayoutEditMode = () => { setIsLayoutEditMode(true); setIsEditMode(false); };
  const exitLayoutEditMode = () => { setIsLayoutEditMode(false); };
  const toggleEditMode = () => { if (isEditMode) exitEditMode(); else enterEditMode(); };
  const toggleLayoutEditMode = () => { if (isLayoutEditMode) exitLayoutEditMode(); else enterLayoutEditMode(); };

  const value = {
    // State
    globalRoster, setGlobalRoster,
    students, setStudents,
    totalTime, setTotalTime,
    timeRemaining, setTimeRemaining,
    isRunning, setIsRunning,
    autoRepeat, setAutoRepeat,
    selectedStudentId, setSelectedStudentId,
    rightNowText, setRightNowText,
    bannerFontSize, setBannerFontSize,
    firstThen, setFirstThen,
    rotationSound, setRotationSound,
    voiceLevel, setVoiceLevel,
    countdownEvent, setCountdownEvent,
    countdownTime, setCountdownTime,
    quickMessage, setQuickMessage,
    quickMessageFontSize, setQuickMessageFontSize,
    googleSlidesUrl, setGoogleSlidesUrl,
    youtubeVideoUrl, setYoutubeVideoUrl,
    layoutTabs, setLayoutTabs,
    activeLayoutId, setActiveLayoutId,
    layoutRenamingId, setLayoutRenamingId,
    layoutRenameValue, setLayoutRenameValue,
    widgetColors, setWidgetColors,
    goalLadder, setGoalLadder,
    starPoints, setStarPoints,
    studentGoals, setStudentGoals,
    customSounds, setCustomSounds,
    stationColors, setStationColors,
    rotationOrder: activeRotationOrder, setRotationOrder,
    timerStyle, setTimerStyle,
    soundVolume, setSoundVolume,
    floorPlans,
    activeFloorPlanId, setActiveFloorPlanId,
    renamingTabId, setRenamingTabId,
    renameValue, setRenameValue,

    // Derived
    activeFloorPlan,
    stationConfigs, setStationConfigs,
    customBoxes, setCustomBoxes,
    teacherNames, setTeacherNames,
    setCustomStationColorsForPlan,
    customStationColors,
    allStationColors,
    tabStationKeys,

    // UI state
    isEditMode, setIsEditMode,
    isLayoutEditMode, setIsLayoutEditMode,
    showStudentManager, setShowStudentManager,
    showRosterManager, setShowRosterManager,
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
    addLayoutTab,
    deleteLayoutTab,
    startLayoutRenaming,
    finishLayoutRenaming,
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
