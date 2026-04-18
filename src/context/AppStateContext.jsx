import React, { createContext, useContext, useState, useEffect, useRef, useMemo, startTransition } from 'react';
import {
  DEFAULT_STUDENTS,
  DEFAULT_TEACHER_NAMES,
  DEFAULT_STATION_CONFIG,
  DEFAULT_ROTATION_ORDER,
  DEFAULT_STATION_COLORS,
  STATION_COLOR_OPTIONS,
} from '../constants';
import { playSound } from '../constants/sounds';
import { STORAGE_KEY, loadSaved } from '../hooks/usePersistedState';
import {
  ensureUniqueStudents,
  normalizeStudentsByLayout,
  createDefaultRoster,
  getNextGroup,
  normalizeRotationOrder,
} from './stateUtils';
import { TEMPLATES, applyTemplate } from '../config/templates';
import { useAuth } from '../hooks/useAuth';
import { fetchCloudAppState, saveCloudAppState } from '../lib/appStateSync';

// Legacy migration: Old versions stored layout under a different key.
// This function migrates users from the old format to the new unified storage.
// Keep this for backward compatibility with existing installations.
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

// Migration: Remove deprecated morningCheckin data
function cleanupDeprecatedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    let modified = false;

    // Remove morningCheckinsByLayout state
    if (data.morningCheckinsByLayout) {
      delete data.morningCheckinsByLayout;
      modified = true;
    }

    // Remove morningCheckin widgets from all layouts
    if (Array.isArray(data.layoutTabs)) {
      data.layoutTabs.forEach((tab) => {
        if (Array.isArray(tab.layout)) {
          const beforeLength = tab.layout.length;
          tab.layout = tab.layout.filter((widget) => widget.i !== 'morningCheckin');
          if (tab.layout.length !== beforeLength) {
            modified = true;
          }
        }
      });
    }

    // Only save if we made changes
    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (process.env.NODE_ENV === 'development') {
        console.log('Migration: Removed deprecated Morning Check-In data and widgets');
      }
    }
  } catch (e) {
    console.warn('Could not clean up deprecated data:', e);
  }
}

// Run cleanup immediately at module load (before component renders)
cleanupDeprecatedData();

function createEmptyFloorPlanTab(name = 'Main Layout') {
  return {
    id: `plan-${Date.now()}`,
    name,
    stationConfigs: {},
    customBoxes: [],
    teacherNames: { ...DEFAULT_TEACHER_NAMES },
    students: [],
    rotationOrder: [],
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
  const { userId } = useAuth();
  const cloudSaveTimer = useRef(null);

  const [globalRoster, setGlobalRoster] = useState(() =>
    loadSaved('globalRoster', [])
  );
  const [studentsByLayout, setStudentsByLayout] = useState(() => {
    const saved = loadSaved('studentsByLayout', null);
    if (saved) return normalizeStudentsByLayout(saved, getSavedMainLayoutId());
    const legacy = loadSaved('students', []);
    return normalizeStudentsByLayout(legacy, getSavedMainLayoutId());
  });
  const DEFAULT_TIMER = { totalTime: 900, timeRemaining: 900, isRunning: false, autoRepeat: true, timerStyle: 'ring' };
  const [timerByLayout, setTimerByLayout] = useState(() => {
    const saved = loadSaved('timerByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacyTotal = loadSaved('totalTime', 900);
    const legacyAutoRepeat = loadSaved('autoRepeat', true);
    return {
      [getSavedMainLayoutId()]: {
        totalTime: legacyTotal,
        timeRemaining: legacyTotal,
        isRunning: false,
        autoRepeat: legacyAutoRepeat,
      },
    };
  });

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [bannerByLayout, setBannerByLayout] = useState(() => {
    const saved = loadSaved('bannerByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    // Migrate legacy global banner state to the main layout
    return {
      [getSavedMainLayoutId()]: {
        text: loadSaved('rightNowText', 'Working Quietly'),
        fontSize: loadSaved('bannerFontSize', 28),
        mode: loadSaved('bannerMode', 'static'),
        config: loadSaved('bannerConfig', {
          messages: ['Great job! ⭐', 'Stay focused! 🎯', 'You can do it! 💪'],
          rotateInterval: 10,
          subject: 'Math',
          subjectColor: '#6366f1',
          subjectIcon: '➕',
        }),
      },
    };
  });
  const [firstThen, setFirstThen] = useState(() =>
    loadSaved('firstThen', {
      firstIcon: '📚',
      firstLabel: 'Reading',
      thenIcon: '🎮',
      thenLabel: 'Free Time',
    })
  );
  const [rotationSound, setRotationSound] = useState(() => {
    const saved = loadSaved('rotationSound', 'marimba');
    return saved === 'chime' ? 'marimba' : saved;
  });
  const [voiceLevel, setVoiceLevel] = useState(() => loadSaved('voiceLevel', 1));
  const [countdownEvent, setCountdownEvent] = useState(() => loadSaved('countdownEvent', 'Lunch'));
  const [countdownTime, setCountdownTime] = useState(() => loadSaved('countdownTime', '12:00'));
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState(() => loadSaved('googleSlidesUrl', ''));
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(() => loadSaved('youtubeVideoUrl', ''));
  const [textBoxes, setTextBoxes] = useState(() => loadSaved('textBoxes', {}));
  const [layoutTabs, setLayoutTabs] = useState(() => {
    const saved = loadSaved('layoutTabs', null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    const legacy = loadLegacyLayout();
    return [
      {
        id: 'layout-1',
        name: 'Main Layout',
        layout: legacy && legacy.length > 0 ? legacy : [],
      },
    ];
  });
  const [activeLayoutId, setActiveLayoutId] = useState(() => loadSaved('activeLayoutId', null));

  // Derive per-layout timer values — must be after activeLayoutId is declared
  const activeTimer   = timerByLayout[activeLayoutId] || DEFAULT_TIMER;
  const totalTime     = activeTimer.totalTime;
  const timeRemaining = activeTimer.timeRemaining;
  const isRunning     = activeTimer.isRunning;
  const autoRepeat    = activeTimer.autoRepeat;
  const timerStyle    = activeTimer.timerStyle ?? 'ring';

  // Setters that write only to the active layout's timer slot
  const _setTimer = (field, updater) =>
    setTimerByLayout((prev) => {
      const cur = prev[activeLayoutId] || DEFAULT_TIMER;
      const next = typeof updater === 'function' ? updater(cur[field]) : updater;
      return { ...prev, [activeLayoutId]: { ...cur, [field]: next } };
    });
  const setTotalTime     = (v) => _setTimer('totalTime', v);
  const setTimeRemaining = (v) => _setTimer('timeRemaining', v);
  const setIsRunning     = (v) => _setTimer('isRunning', v);
  const setAutoRepeat    = (v) => _setTimer('autoRepeat', v);
  const setTimerStyle    = (v) => _setTimer('timerStyle', v);

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
  const [studentGoals, setStudentGoals] = useState(() => loadSaved('studentGoals', {}));
  const [tokenHistory, setTokenHistory] = useState(() => loadSaved('tokenHistory', {}));
  const [studentNotes, setStudentNotes] = useState(() => loadSaved('studentNotes', {}));
  const [studentGoalLadders, setStudentGoalLadders] = useState(() => loadSaved('studentGoalLadders', {}));
  const [studentSchedules, setStudentSchedules] = useState(() => loadSaved('studentSchedules', {}));
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
  const [soundVolume, setSoundVolume] = useState(() => loadSaved('soundVolume', 0.7));
  const [performanceMode, setPerformanceMode] = useState(() => loadSaved('performanceMode', false));
  const [isDarkMode, setIsDarkMode] = useState(() => loadSaved('isDarkMode', false));
  const [isWidgetLocked, setIsWidgetLocked] = useState(false);
  const [clockStyle, setClockStyle] = useState(() => loadSaved('clockStyle', 'digital'));
  const [showClockDate, setShowClockDate] = useState(() => loadSaved('showClockDate', true));

  // Floor plan tabs per layout
  const [floorPlansByLayout, setFloorPlansByLayout] = useState(() => {
    const saved = loadSaved('floorPlansByLayout', null);
    if (saved && typeof saved === 'object') return saved;
    const legacyFloorPlans = loadSaved('floorPlans', null);
    const legacyActive = loadSaved('activeFloorPlanId', null);
    const savedLayouts = loadSaved('layoutTabs', null);
    const mainLayoutId =
      Array.isArray(savedLayouts) && savedLayouts.length > 0 ? savedLayouts[0].id : 'layout-1';
    if (legacyFloorPlans) {
      const normalized = legacyFloorPlans.map((fp) => ({
        ...fp,
        teacherNames: fp.teacherNames || loadSaved('teacherNames', DEFAULT_TEACHER_NAMES),
      }));
      return {
        [mainLayoutId]: {
          floorPlans: normalized,
          activeFloorPlanId: legacyActive || normalized[0]?.id,
        },
      };
    }
    return {};
  });
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const setStationConfigs = (updater) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId
          ? {
              ...fp,
              stationConfigs: typeof updater === 'function' ? updater(fp.stationConfigs) : updater,
            }
          : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setCustomBoxes = (updater) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId
          ? {
              ...fp,
              customBoxes: typeof updater === 'function' ? updater(fp.customBoxes) : updater,
            }
          : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setTeacherNames = (updater) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId
          ? {
              ...fp,
              teacherNames:
                typeof updater === 'function'
                  ? updater(fp.teacherNames || DEFAULT_TEACHER_NAMES)
                  : updater,
            }
          : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setStudents = (updater) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const currentPlan =
        set.floorPlans.find((fp) => fp.id === activeFloorPlanId) || set.floorPlans[0];
      const currentStudents = currentPlan?.students || [];
      const nextRaw = typeof updater === 'function' ? updater(currentStudents) : updater;
      const { next } = ensureUniqueStudents(nextRaw);
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId ? { ...fp, students: next } : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setRotationOrder = (updater) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const currentPlan =
        set.floorPlans.find((fp) => fp.id === activeFloorPlanId) || set.floorPlans[0];
      const currentOrder = currentPlan?.rotationOrder || [];
      const nextRaw = typeof updater === 'function' ? updater(currentOrder) : updater;
      const next = normalizeRotationOrder(nextRaw);
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId ? { ...fp, rotationOrder: next } : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };
  const setStationColors = (updater) => {
    setStationColorsByLayout((prev) => {
      const current = prev[activeLayoutId] || DEFAULT_STATION_COLORS;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setWidgetColors = (updater) => {
    setWidgetColorsByLayout((prev) => {
      const current = prev[activeLayoutId] || {};
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [activeLayoutId]: next };
    });
  };
  const setCustomStationColorsForPlan = (colors) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId ? { ...fp, customStationColors: colors } : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };

  const setActiveFloorPlanId = (id) => {
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      return { ...prev, [activeLayoutId]: { ...set, activeFloorPlanId: id } };
    });
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showRosterManager, setShowRosterManager] = useState(false);
  const [showFirstThenEditor, setShowFirstThenEditor] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [showTextBoxEditor, setShowTextBoxEditor] = useState(false);
  const [editingTextBoxId, setEditingTextBoxId] = useState(null);
  const floorPlanRef = useRef(null);
  const rotationTimeoutsRef = useRef([]);
  const triggerRotationRef = useRef(null);
  const rotationInProgressRef = useRef(false);
  const playSoundRef = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementPhase, setAnnouncementPhase] = useState('start');
  const [animationTargets, setAnimationTargets] = useState({});
  const [rotationHistory, setRotationHistory] = useState(null); // Stores previous student state for undo
  const initialStudentStateRef = useRef(null); // Stores initial state for reset

  // Welcome modal for first-time users
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    try {
      const hasSeenWelcome = localStorage.getItem('specialedscreen-welcome-seen');
      const hasSavedData = localStorage.getItem(STORAGE_KEY);
      return !hasSeenWelcome && !hasSavedData;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) {
      const legacy = loadLegacyLayout();
      setLayoutTabs([
        {
          id: 'layout-1',
          name: 'Main Layout',
          layout: legacy && legacy.length > 0 ? legacy : [],
        },
      ]);
      return;
    }
    if (!Array.isArray(layoutTabs) || layoutTabs.length === 0) return;
    if (!activeLayoutId || !layoutTabs.some((t) => t.id === activeLayoutId)) {
      setActiveLayoutId(layoutTabs[0].id);
    }
  }, [layoutTabs, activeLayoutId]);

  useEffect(() => {
    if (!activeLayoutId) return;
    setStudentsByLayout((prev) => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: [] };
    });
    setStationColorsByLayout((prev) => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: DEFAULT_STATION_COLORS };
    });
    setWidgetColorsByLayout((prev) => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: {} };
    });
    setGoalLaddersByLayout((prev) => {
      if (prev[activeLayoutId]) return prev;
      return { ...prev, [activeLayoutId]: createDefaultGoalLadder() };
    });
    setRotationOrderByLayout((prev) => {
      const existing = prev[activeLayoutId];
      if (Array.isArray(existing)) return prev;
      return { ...prev, [activeLayoutId]: [] };
    });
  }, [activeLayoutId]);

  useEffect(() => {
    setStudentsByLayout((prev) => {
      let changed = false;
      const next = {};
      Object.keys(prev || {}).forEach((id) => {
        const { next: normalized, changed: c } = ensureUniqueStudents(prev[id]);
        if (c) changed = true;
        next[id] = normalized;
      });
      return changed ? next : prev;
    });
  }, []);

  const stationColors = stationColorsByLayout[activeLayoutId] || DEFAULT_STATION_COLORS;
  const widgetColors = widgetColorsByLayout[activeLayoutId] || {};
  const goalLadder = goalLaddersByLayout[activeLayoutId] || createDefaultGoalLadder();

  const DEFAULT_BANNER = {
    text: 'Working Quietly',
    fontSize: 28,
    mode: 'static',
    config: {
      messages: ['Great job! ⭐', 'Stay focused! 🎯', 'You can do it! 💪'],
      rotateInterval: 10,
      subject: 'Math',
      subjectColor: '#6366f1',
      subjectIcon: '➕',
    },
  };
  const activeBanner = bannerByLayout[activeLayoutId] || DEFAULT_BANNER;
  const rightNowText = activeBanner.text;
  const bannerFontSize = activeBanner.fontSize;
  const bannerMode = activeBanner.mode;
  const bannerConfig = activeBanner.config;

  const updateBanner = (updates) => {
    setBannerByLayout((prev) => ({
      ...prev,
      [activeLayoutId]: { ...(prev[activeLayoutId] || DEFAULT_BANNER), ...updates },
    }));
  };
  const setRightNowText = (text) => updateBanner({ text });
  const setBannerFontSize = (fontSize) => updateBanner({ fontSize });
  const setBannerMode = (mode) => updateBanner({ mode });
  const setBannerConfig = (config) => updateBanner({ config });

  const setGoalLadder = (updater) => {
    setGoalLaddersByLayout((prev) => {
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
  const activeFloorPlan = floorPlans.find((fp) => fp.id === activeFloorPlanId) ||
    floorPlans[0] || {
      stationConfigs: {},
      customBoxes: [],
      teacherNames: DEFAULT_TEACHER_NAMES,
      customStationColors: {},
      students: [],
      rotationOrder: [],
    };
  const stationConfigs = activeFloorPlan.stationConfigs || {};
  const customBoxes = activeFloorPlan.customBoxes || [];
  const teacherNames = activeFloorPlan.teacherNames || DEFAULT_TEACHER_NAMES;
  const customStationColors = activeFloorPlan.customStationColors || {};
  // Students and rotation order are now per floor plan tab
  const students = activeFloorPlan.students || [];
  const rotationOrder = normalizeRotationOrder(activeFloorPlan.rotationOrder);
  const allStationColors = { ...stationColors, ...customStationColors };
  const tabStationKeys = Object.keys(stationConfigs);
  const activeRotationOrder = rotationOrder.filter((k) => tabStationKeys.includes(k));

  // Note: Previously this effect would clear students/rotationOrder for layouts
  // without stations. This was removed because it caused a bug where students
  // in one tab would reset when making changes to a different tab. Students
  // should be allowed to exist even before stations are configured.

  useEffect(() => {
    if (!activeLayoutId) return;
    setFloorPlansByLayout((prev) => {
      const existing = prev[activeLayoutId];
      if (!existing) {
        return { ...prev, [activeLayoutId]: createFloorPlanSet() };
      }
      if (!existing.floorPlans || existing.floorPlans.length === 0) {
        return { ...prev, [activeLayoutId]: createFloorPlanSet() };
      }
      if (!existing.activeFloorPlanId) {
        return {
          ...prev,
          [activeLayoutId]: { ...existing, activeFloorPlanId: existing.floorPlans[0].id },
        };
      }
      return prev;
    });
  }, [activeLayoutId]);

  // Migration: Move students and rotationOrder from per-layout to per-floor-plan
  useEffect(() => {
    setFloorPlansByLayout((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(next).forEach((layoutId) => {
        const set = next[layoutId];
        if (!set || !set.floorPlans || set.floorPlans.length === 0) return;
        // Check if first floor plan needs students migrated
        const firstPlan = set.floorPlans[0];
        const legacyStudents = studentsByLayout[layoutId];
        const legacyRotation = rotationOrderByLayout[layoutId];
        // Only migrate if floor plan has no students but legacy data exists
        if (
          (!firstPlan.students || firstPlan.students.length === 0) &&
          legacyStudents &&
          legacyStudents.length > 0
        ) {
          changed = true;
          const migratedPlans = set.floorPlans.map((fp, idx) =>
            idx === 0
              ? { ...fp, students: legacyStudents, rotationOrder: legacyRotation || [] }
              : fp
          );
          next[layoutId] = { ...set, floorPlans: migratedPlans };
        }
      });
      return changed ? next : prev;
    });
  }, []); // Run once on mount

  // Persist state.
  // Skip writes while the timer is running — it fires every second and would
  // otherwise block the main thread with a full JSON.stringify + localStorage write
  // on every tick. State is persisted on pause, stop, rotation, and all other changes.
  // On reload, timeRemaining resets to totalTime (expected for a classroom timer).
  useEffect(() => {
    if (isRunning) return;
    try {
      const data = JSON.stringify({
        globalRoster,
        studentsByLayout,
        timerByLayout,
        bannerByLayout,
        firstThen,
        rotationSound,
        voiceLevel,
        countdownEvent,
        countdownTime,
        googleSlidesUrl,
        youtubeVideoUrl,
        textBoxes,
        layoutTabs,
        activeLayoutId,
        widgetColorsByLayout,
        goalLaddersByLayout,
        studentGoals,
        tokenHistory,
        studentNotes,
        studentGoalLadders,
        studentSchedules,
        floorPlansByLayout,
        customSounds,
        stationColorsByLayout,
        rotationOrderByLayout,
        soundVolume,
        performanceMode,
        isDarkMode,
        clockStyle,
        showClockDate,
      });
      localStorage.setItem(STORAGE_KEY, data);

      // Cloud sync — debounced so rapid changes don't spam the API
      if (userId) {
        clearTimeout(cloudSaveTimer.current);
        cloudSaveTimer.current = setTimeout(() => {
          saveCloudAppState(userId, JSON.parse(data)).catch((err) =>
            console.warn('Cloud save failed:', err.message)
          );
        }, 2000);
      }
    } catch (e) {
      // Storage quota exceeded or other error - warn user once per session
      if (!window._storageWarningShown) {
        window._storageWarningShown = true;
        console.warn('Could not save data to localStorage:', e.message);
      }
    }
  }, [
    globalRoster,
    studentsByLayout,
    timerByLayout,
    bannerByLayout,
    firstThen,
    rotationSound,
    voiceLevel,
    countdownEvent,
    countdownTime,
    googleSlidesUrl,
    youtubeVideoUrl,
    textBoxes,
    layoutTabs,
    activeLayoutId,
    widgetColorsByLayout,
    goalLaddersByLayout,
    studentGoals,
    tokenHistory,
    studentNotes,
    studentGoalLadders,
    studentSchedules,
    floorPlansByLayout,
    customSounds,
    stationColorsByLayout,
    rotationOrderByLayout,
    soundVolume,
    performanceMode,
    isDarkMode,
    clockStyle,
    showClockDate,
  ]);

  // Cloud load — fires once after auth resolves. Applies cloud state if it exists,
  // allowing cross-device/cross-browser sync. Local state is already set from
  // localStorage so the app is usable immediately while this fetch happens.
  const cloudLoaded = useRef(false);
  useEffect(() => {
    if (!userId || cloudLoaded.current) return;
    cloudLoaded.current = true;
    fetchCloudAppState(userId).then((row) => {
      if (!row?.data) return;
      const d = row.data;
      if (d.globalRoster !== undefined) setGlobalRoster(d.globalRoster);
      if (d.studentsByLayout !== undefined) setStudentsByLayout(d.studentsByLayout);
      if (d.timerByLayout !== undefined) setTimerByLayout(d.timerByLayout);
      if (d.bannerByLayout !== undefined) setBannerByLayout(d.bannerByLayout);
      if (d.firstThen !== undefined) setFirstThen(d.firstThen);
      if (d.rotationSound !== undefined) setRotationSound(d.rotationSound);
      if (d.voiceLevel !== undefined) setVoiceLevel(d.voiceLevel);
      if (d.countdownEvent !== undefined) setCountdownEvent(d.countdownEvent);
      if (d.countdownTime !== undefined) setCountdownTime(d.countdownTime);
      if (d.googleSlidesUrl !== undefined) setGoogleSlidesUrl(d.googleSlidesUrl);
      if (d.youtubeVideoUrl !== undefined) setYoutubeVideoUrl(d.youtubeVideoUrl);
      if (d.textBoxes !== undefined) setTextBoxes(d.textBoxes);
      if (d.layoutTabs !== undefined) setLayoutTabs(d.layoutTabs);
      if (d.activeLayoutId !== undefined) setActiveLayoutId(d.activeLayoutId);
      if (d.widgetColorsByLayout !== undefined) setWidgetColorsByLayout(d.widgetColorsByLayout);
      if (d.goalLaddersByLayout !== undefined) setGoalLaddersByLayout(d.goalLaddersByLayout);
      if (d.studentGoals !== undefined) setStudentGoals(d.studentGoals);
      if (d.tokenHistory !== undefined) setTokenHistory(d.tokenHistory);
      if (d.studentNotes !== undefined) setStudentNotes(d.studentNotes);
      if (d.studentGoalLadders !== undefined) setStudentGoalLadders(d.studentGoalLadders);
      if (d.studentSchedules !== undefined) setStudentSchedules(d.studentSchedules);
      if (d.floorPlansByLayout !== undefined) setFloorPlansByLayout(d.floorPlansByLayout);
      if (d.customSounds !== undefined) setCustomSounds(d.customSounds);
      if (d.stationColorsByLayout !== undefined) setStationColorsByLayout(d.stationColorsByLayout);
      if (d.rotationOrderByLayout !== undefined) setRotationOrderByLayout(d.rotationOrderByLayout);
      if (d.soundVolume !== undefined) setSoundVolume(d.soundVolume);
      if (d.performanceMode !== undefined) setPerformanceMode(d.performanceMode);
      if (d.isDarkMode !== undefined) setIsDarkMode(d.isDarkMode);
      if (d.clockStyle !== undefined) setClockStyle(d.clockStyle);
      if (d.showClockDate !== undefined) setShowClockDate(d.showClockDate);
    }).catch((err) => console.warn('Cloud load failed:', err.message));
  }, [userId]);

  // Timer effect — uses a local ref to track time so triggerRotation is called
  // outside any state updater (state updaters must be pure; no side effects allowed).
  const _timerTimeRef = useRef(timeRemaining);
  _timerTimeRef.current = timeRemaining;
  // Keep playSoundRef current so the timer interval can call it without stale closures
  playSoundRef.current = () => playSound(rotationSound, customSounds, soundVolume);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      const next = _timerTimeRef.current - 1;
      if (next <= 0) {
        if (autoRepeat) {
          setTimeRemaining(totalTime);
          triggerRotationRef.current?.();
        } else {
          setTimeRemaining(0);
          setIsRunning(false);
          playSoundRef.current?.();
        }
      } else {
        // Low-priority update — lets React process mouse/keyboard events first
        startTransition(() => setTimeRemaining(next));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, autoRepeat, totalTime]);

  const triggerRotation = () => {
    // rotationInProgressRef is set immediately (unlike isAnimating which takes 1.5s)
    // This prevents double-fires from rapid clicks or timer/manual click overlap
    if (rotationInProgressRef.current || isEditMode) return;
    if (!activeRotationOrder || activeRotationOrder.length === 0) return;

    rotationInProgressRef.current = true;

    // Clear any pending rotation timeouts to prevent race conditions
    rotationTimeoutsRef.current.forEach((id) => clearTimeout(id));
    rotationTimeoutsRef.current = [];

    // Save current state for undo (deep copy)
    setRotationHistory(students.map((s) => ({ ...s })));
    // Store initial state for reset if not already stored
    if (!initialStudentStateRef.current && students.length > 0) {
      initialStudentStateRef.current = students.map((s) => ({ ...s }));
    }

    playSound(rotationSound, customSounds, soundVolume);
    setShowAnnouncement(true);
    setAnnouncementPhase('start');

    rotationTimeoutsRef.current.push(
      setTimeout(() => {
        setAnnouncementPhase('moving');
        setIsAnimating(true);
        const t = {};
        students.forEach((s) => {
          const current = activeRotationOrder.includes(s.group) ? s.group : activeRotationOrder[0];
          t[s.id] = getNextGroup(current, activeRotationOrder);
        });
        setAnimationTargets(t);
      }, 1500)
    );

    rotationTimeoutsRef.current.push(setTimeout(() => setShowAnnouncement(false), 3000));

    rotationTimeoutsRef.current.push(
      setTimeout(() => {
        setStudents((p) =>
          p.map((s) => {
            const current = activeRotationOrder.includes(s.group)
              ? s.group
              : activeRotationOrder[0];
            return { ...s, group: getNextGroup(current, activeRotationOrder) };
          })
        );
        setAnimationTargets({});
        setIsAnimating(false);
        rotationInProgressRef.current = false;
        rotationTimeoutsRef.current = [];
      }, 4500)
    );
  };

  // Always keep ref in sync with latest triggerRotation (synchronous assignment, not useEffect)
  triggerRotationRef.current = triggerRotation;

  const undoRotation = () => {
    if (isAnimating || isEditMode) return;
    if (!rotationHistory) return;

    // Restore previous student positions
    setStudents(rotationHistory.map((s) => ({ ...s })));
    setRotationHistory(null); // Clear history after undo
  };

  const resetRotation = () => {
    if (isAnimating || isEditMode) return;
    if (!initialStudentStateRef.current) {
      // If no initial state stored, use current students as baseline
      initialStudentStateRef.current = students.map((s) => ({ ...s }));
      return;
    }

    // Save current state for undo before resetting
    setRotationHistory(students.map((s) => ({ ...s })));

    // Restore initial student positions
    setStudents(initialStudentStateRef.current.map((s) => ({ ...s })));
  };

  const loadTemplate = (templateId) => {
    const template = TEMPLATES[templateId];
    if (!template) return;

    const applied = applyTemplate(template);

    // Update layout
    setLayoutTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeLayoutId ? { ...tab, layout: applied.layoutItems } : tab
      )
    );

    // Update floor plan - create set if it doesn't exist, then apply template
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId] || createFloorPlanSet();

      // Get the current active floor plan to preserve its ID
      const currentPlan = set.floorPlans.find((fp) => fp.id === activeFloorPlanId) || set.floorPlans[0];

      return {
        ...prev,
        [activeLayoutId]: {
          ...set,
          floorPlans: set.floorPlans.map((fp) =>
            fp.id === (currentPlan?.id || activeFloorPlanId)
              ? { ...applied.floorPlan, id: fp.id }
              : fp
          ),
        },
      };
    });

    // Update other state
    setRightNowText(applied.rightNowText);
    setFirstThen(applied.firstThen);
    setVoiceLevel(applied.voiceLevel);
    setStationColorsByLayout((prev) => ({
      ...prev,
      [activeLayoutId]: applied.stationColors,
    }));

    // Mark welcome as seen
    try {
      localStorage.setItem('specialedscreen-welcome-seen', 'true');
    } catch (e) {}

    setShowWelcomeModal(false);
  };

  // Custom template management
  const getCustomTemplates = () => {
    try {
      const saved = localStorage.getItem('customLayoutTemplates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCurrentLayoutAsTemplate = (name, description = '') => {
    const currentTab = layoutTabs.find((t) => t.id === activeLayoutId);
    if (!currentTab) return;

    const newTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      layout: currentTab.layout,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    const customTemplates = getCustomTemplates();
    const updated = [...customTemplates, newTemplate];

    try {
      localStorage.setItem('customLayoutTemplates', JSON.stringify(updated));
      return newTemplate;
    } catch (e) {
      console.error('Failed to save template:', e);
      return null;
    }
  };

  const deleteCustomTemplate = (templateId) => {
    const customTemplates = getCustomTemplates();
    const updated = customTemplates.filter((t) => t.id !== templateId);

    try {
      localStorage.setItem('customLayoutTemplates', JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to delete template:', e);
      return false;
    }
  };

  const loadCustomTemplate = (templateId) => {
    const customTemplates = getCustomTemplates();
    const template = customTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // Update layout
    setLayoutTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeLayoutId ? { ...tab, layout: template.layout } : tab
      )
    );
  };

  const skipWelcome = () => {
    try {
      localStorage.setItem('specialedscreen-welcome-seen', 'true');
    } catch (e) {}
    setShowWelcomeModal(false);
  };

  const addBox = () =>
    setCustomBoxes((p) => [
      ...p,
      {
        id: `box-${Date.now()}`,
        top: 120,
        left: 180,
        width: 45,
        height: 45,
        label: '',
        icon: '',
        color: '#6B7280',
        assignedStudents: [],
      },
    ]);

  const addFloorPlan = () => {
    const newId = `plan-${Date.now()}`;
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId] || createFloorPlanSet();
      const nextPlans = [
        ...set.floorPlans,
        {
          id: newId,
          name: `Layout ${set.floorPlans.length + 1}`,
          stationConfigs: {},
          customBoxes: [],
          teacherNames: { ...DEFAULT_TEACHER_NAMES },
          students: [],
          rotationOrder: [],
          customStationColors: {},
        },
      ];
      return {
        ...prev,
        [activeLayoutId]: { ...set, floorPlans: nextPlans, activeFloorPlanId: newId },
      };
    });
  };

  const addStationToTab = (color) => {
    const defaultPositions = DEFAULT_STATION_CONFIG[color] || {
      top: 50,
      left: 50,
      width: 100,
      height: 65,
    };
    setStationConfigs((p) => ({ ...p, [color]: { ...defaultPositions } }));
    setRotationOrder((prev) => (prev.includes(color) ? prev : [...prev, color]));
  };

  const addCustomStation = () => {
    const id = `station-${Date.now()}`;
    const colorOpt =
      STATION_COLOR_OPTIONS[Math.floor(Math.random() * STATION_COLOR_OPTIONS.length)];
    setStationConfigs((p) => ({ ...p, [id]: { top: 50, left: 50, width: 100, height: 65 } }));
    setTeacherNames((p) => ({ ...p, [id]: 'New Station' }));
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.map((fp) =>
        fp.id === activeFloorPlanId
          ? {
              ...fp,
              customStationColors: {
                ...(fp.customStationColors || {}),
                [id]: { bg: colorOpt.bg, light: colorOpt.light },
              },
            }
          : fp
      );
      return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
    });
  };

  const removeStationFromTab = (color) => {
    setStationConfigs((p) => {
      const next = { ...p };
      delete next[color];
      return next;
    });
    // Only remove from global rotation order if no other tab still has this station
    const existsOnOtherTab = floorPlans.some(
      (fp) => fp.id !== activeFloorPlanId && fp.stationConfigs[color]
    );
    if (!existsOnOtherTab && rotationOrder.includes(color)) {
      const newOrder = rotationOrder.filter((k) => k !== color);
      setRotationOrder(newOrder);
      const firstRemaining = newOrder[0];
      if (firstRemaining) {
        setStudents((prev) =>
          prev.map((s) => (s.group === color ? { ...s, group: firstRemaining } : s))
        );
      }
    }
  };

  const equalizeStationSizes = () => {
    const stationKeys = tabStationKeys;
    const allItems = [];
    stationKeys.forEach((c) =>
      allItems.push({
        type: 'station',
        key: c,
        w: stationConfigs[c].width,
        h: stationConfigs[c].height,
      })
    );
    customBoxes.forEach((b) => allItems.push({ type: 'box', key: b.id, w: b.width, h: b.height }));
    if (allItems.length === 0) return;
    const targetW = allItems[0].w;
    const targetH = allItems[0].h;
    if (stationKeys.length > 0) {
      setStationConfigs((p) => {
        const next = { ...p };
        stationKeys.forEach((c) => {
          next[c] = { ...next[c], width: targetW, height: targetH };
        });
        return next;
      });
    }
    if (customBoxes.length > 0) {
      setCustomBoxes((p) => p.map((b) => ({ ...b, width: targetW, height: targetH })));
    }
  };

  const deleteFloorPlan = (id) => {
    if (floorPlans.length <= 1) return;
    if (!window.confirm('Delete this floor plan layout?')) return;
    setFloorPlansByLayout((prev) => {
      const set = prev[activeLayoutId];
      if (!set) return prev;
      const nextPlans = set.floorPlans.filter((fp) => fp.id !== id);
      const nextActive = activeFloorPlanId === id ? nextPlans[0]?.id : set.activeFloorPlanId;
      return {
        ...prev,
        [activeLayoutId]: { ...set, floorPlans: nextPlans, activeFloorPlanId: nextActive },
      };
    });
  };

  const startRenamingTab = (id, currentName) => {
    setRenamingTabId(id);
    setRenameValue(currentName);
  };

  const finishRenamingTab = () => {
    if (renamingTabId && renameValue.trim()) {
      setFloorPlansByLayout((prev) => {
        const set = prev[activeLayoutId];
        if (!set) return prev;
        const nextPlans = set.floorPlans.map((fp) =>
          fp.id === renamingTabId ? { ...fp, name: renameValue.trim() } : fp
        );
        return { ...prev, [activeLayoutId]: { ...set, floorPlans: nextPlans } };
      });
    }
    setRenamingTabId(null);
  };

  const addLayoutTab = (type = 'blank') => {
    const id = `layout-${Date.now()}`;
    const name = type === 'slides' ? 'Slides' : `Layout ${layoutTabs.length + 1}`;
    const layout = type === 'slides' ? [{ i: 'googleSlides', x: 0, y: 0, w: 12, h: 18 }] : [];
    setLayoutTabs((prev) => [...prev, { id, name, layout }]);
    setFloorPlansByLayout((prev) => ({ ...prev, [id]: createFloorPlanSet() }));
    setStudentsByLayout((prev) => ({ ...prev, [id]: [] }));
    setStationColorsByLayout((prev) => ({ ...prev, [id]: DEFAULT_STATION_COLORS }));
    setWidgetColorsByLayout((prev) => ({ ...prev, [id]: {} }));
    setGoalLaddersByLayout((prev) => ({ ...prev, [id]: createDefaultGoalLadder() }));
    setRotationOrderByLayout((prev) => ({ ...prev, [id]: [] }));
    setTimerByLayout((prev) => ({ ...prev, [id]: { ...DEFAULT_TIMER } }));
    setActiveLayoutId(id);
  };

  const deleteLayoutTab = (id) => {
    if (layoutTabs.length <= 1) return;
    if (!window.confirm('Delete this layout tab?')) return;
    setLayoutTabs((prev) => {
      const nextTabs = prev.filter((t) => t.id !== id);
      if (activeLayoutId === id && nextTabs.length > 0) {
        setActiveLayoutId(nextTabs[0].id);
      }
      return nextTabs;
    });
    setFloorPlansByLayout((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStudentsByLayout((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStationColorsByLayout((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setWidgetColorsByLayout((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setGoalLaddersByLayout((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRotationOrderByLayout((prev) => {
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
      setLayoutTabs((prev) =>
        prev.map((t) => (t.id === layoutRenamingId ? { ...t, name: layoutRenameValue.trim() } : t))
      );
    }
    setLayoutRenamingId(null);
  };

  // Mutual exclusion for edit modes
  const enterEditMode = () => {
    setIsEditMode(true);
    setIsLayoutEditMode(false);
  };
  const exitEditMode = () => {
    setIsEditMode(false);
  };
  const enterLayoutEditMode = () => {
    setIsLayoutEditMode(true);
    setIsEditMode(false);
  };
  const exitLayoutEditMode = () => {
    setIsLayoutEditMode(false);
  };
  const toggleEditMode = () => {
    if (isEditMode) exitEditMode();
    else enterEditMode();
  };
  const toggleLayoutEditMode = () => {
    if (isLayoutEditMode) exitLayoutEditMode();
    else enterLayoutEditMode();
  };

  const value = {
    // State
    globalRoster,
    setGlobalRoster,
    students,
    setStudents,
    totalTime,
    setTotalTime,
    timeRemaining,
    setTimeRemaining,
    isRunning,
    setIsRunning,
    autoRepeat,
    setAutoRepeat,
    selectedStudentId,
    setSelectedStudentId,
    rightNowText,
    setRightNowText,
    bannerFontSize,
    setBannerFontSize,
    bannerMode,
    setBannerMode,
    bannerConfig,
    setBannerConfig,
    bannerByLayout,
    setBannerByLayout,
    firstThen,
    setFirstThen,
    rotationSound,
    setRotationSound,
    voiceLevel,
    setVoiceLevel,
    countdownEvent,
    setCountdownEvent,
    countdownTime,
    setCountdownTime,
    googleSlidesUrl,
    setGoogleSlidesUrl,
    youtubeVideoUrl,
    setYoutubeVideoUrl,
    textBoxes,
    setTextBoxes,
    layoutTabs,
    setLayoutTabs,
    activeLayoutId,
    setActiveLayoutId,
    layoutRenamingId,
    setLayoutRenamingId,
    layoutRenameValue,
    setLayoutRenameValue,
    widgetColors,
    setWidgetColors,
    goalLadder,
    setGoalLadder,
    studentGoals,
    setStudentGoals,
    tokenHistory,
    setTokenHistory,
    studentNotes,
    setStudentNotes,
    studentGoalLadders,
    setStudentGoalLadders,
    studentSchedules,
    setStudentSchedules,
    customSounds,
    setCustomSounds,
    stationColors,
    setStationColors,
    rotationOrder: activeRotationOrder,
    setRotationOrder,
    timerStyle,
    setTimerStyle,
    soundVolume,
    setSoundVolume,
    clockStyle,
    setClockStyle,
    showClockDate,
    setShowClockDate,
    floorPlans,
    floorPlansByLayout,
    setFloorPlansByLayout,
    activeFloorPlanId,
    setActiveFloorPlanId,
    renamingTabId,
    setRenamingTabId,
    renameValue,
    setRenameValue,

    // Derived
    activeFloorPlan,
    stationConfigs,
    setStationConfigs,
    customBoxes,
    setCustomBoxes,
    teacherNames,
    setTeacherNames,
    setCustomStationColorsForPlan,
    customStationColors,
    allStationColors,
    tabStationKeys,

    // UI state
    performanceMode,
    setPerformanceMode,
    isDarkMode,
    setIsDarkMode,
    isWidgetLocked,
    setIsWidgetLocked,
    isPresentationMode,
    setIsPresentationMode,
    isEditMode,
    setIsEditMode,
    isLayoutEditMode,
    setIsLayoutEditMode,
    showStudentManager,
    setShowStudentManager,
    showRosterManager,
    setShowRosterManager,
    showFirstThenEditor,
    setShowFirstThenEditor,
    showGoalEditor,
    setShowGoalEditor,
    editingBox,
    setEditingBox,
    showTextBoxEditor,
    setShowTextBoxEditor,
    editingTextBoxId,
    setEditingTextBoxId,
    floorPlanRef,
    isAnimating,
    setIsAnimating,
    showAnnouncement,
    setShowAnnouncement,
    announcementPhase,
    setAnnouncementPhase,
    animationTargets,
    setAnimationTargets,
    rotationHistory,

    // Actions
    triggerRotation,
    undoRotation,
    resetRotation,
    loadTemplate,
    getCustomTemplates,
    saveCurrentLayoutAsTemplate,
    deleteCustomTemplate,
    loadCustomTemplate,
    skipWelcome,
    showWelcomeModal,
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
