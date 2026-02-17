import React from 'react';
import { render } from '@testing-library/react';
import { AppStateProvider } from '../context/AppStateContext';
import { DEFAULT_STUDENTS, DEFAULT_TEACHER_NAMES, DEFAULT_STATION_COLORS } from '../constants';

/**
 * Renders a component wrapped in AppStateProvider for testing
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} - Render result from @testing-library/react
 */
export function renderWithContext(ui, options = {}) {
  const Wrapper = ({ children }) => <AppStateProvider>{children}</AppStateProvider>;

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock app state object for testing
 * @param {Object} overrides - State values to override
 * @returns {Object} - Mock state object
 */
export function createMockState(overrides = {}) {
  return {
    // Timer state
    totalTime: 900,
    timeRemaining: 900,
    isRunning: false,
    setIsRunning: jest.fn(),
    setTotalTime: jest.fn(),
    setTimeRemaining: jest.fn(),
    autoRepeat: true,
    setAutoRepeat: jest.fn(),
    triggerRotation: jest.fn(),

    // Student state
    students: DEFAULT_STUDENTS,
    setStudents: jest.fn(),
    globalRoster: [],
    setGlobalRoster: jest.fn(),
    selectedStudentId: null,
    setSelectedStudentId: jest.fn(),

    // Station state
    stationConfigs: {},
    setStationConfigs: jest.fn(),
    teacherNames: DEFAULT_TEACHER_NAMES,
    setTeacherNames: jest.fn(),
    stationColors: DEFAULT_STATION_COLORS,
    setStationColors: jest.fn(),
    rotationOrder: [],
    setRotationOrder: jest.fn(),
    customBoxes: [],
    setCustomBoxes: jest.fn(),

    // UI state
    isEditMode: false,
    setIsEditMode: jest.fn(),
    isLayoutEditMode: false,
    setIsLayoutEditMode: jest.fn(),
    showStudentManager: false,
    setShowStudentManager: jest.fn(),
    showRosterManager: false,
    setShowRosterManager: jest.fn(),
    showFirstThenEditor: false,
    setShowFirstThenEditor: jest.fn(),
    showGoalEditor: false,
    setShowGoalEditor: jest.fn(),
    editingBox: null,
    setEditingBox: jest.fn(),
    isAnimating: false,
    setIsAnimating: jest.fn(),
    showAnnouncement: false,
    setShowAnnouncement: jest.fn(),

    // Widget state
    rightNowText: 'Working Quietly',
    setRightNowText: jest.fn(),
    bannerFontSize: 28,
    setBannerFontSize: jest.fn(),
    firstThen: {
      firstIcon: '📚',
      firstLabel: 'Reading',
      thenIcon: '🎮',
      thenLabel: 'Free Time',
    },
    setFirstThen: jest.fn(),
    voiceLevel: 1,
    setVoiceLevel: jest.fn(),
    countdownEvent: 'Lunch',
    setCountdownEvent: jest.fn(),
    countdownTime: '12:00',
    setCountdownTime: jest.fn(),
    quickMessage: 'Great job! ⭐',
    setQuickMessage: jest.fn(),
    studentGoals: {},
    setStudentGoals: jest.fn(),

    // Settings
    rotationSound: 'chime',
    setRotationSound: jest.fn(),
    soundVolume: 0.5,
    setSoundVolume: jest.fn(),
    timerStyle: 'circle',
    setTimerStyle: jest.fn(),
    performanceMode: false,
    setPerformanceMode: jest.fn(),

    // Layout state
    layoutTabs: [{ id: 'layout-1', name: 'Main Layout', layout: [] }],
    setLayoutTabs: jest.fn(),
    activeLayoutId: 'layout-1',
    setActiveLayoutId: jest.fn(),

    // Actions
    addBox: jest.fn(),
    addStationToTab: jest.fn(),
    removeStationFromTab: jest.fn(),
    equalizeStationSizes: jest.fn(),
    toggleEditMode: jest.fn(),
    toggleLayoutEditMode: jest.fn(),

    // Override with any custom values
    ...overrides,
  };
}

/**
 * Creates a mock timer state for testing timer components
 * @param {number} timeRemaining - Initial time remaining
 * @param {boolean} isRunning - Whether timer is running
 * @returns {Object} - Mock timer state
 */
export function mockTimer(timeRemaining = 900, isRunning = false) {
  return {
    totalTime: 900,
    timeRemaining,
    isRunning,
    setIsRunning: jest.fn(),
    setTotalTime: jest.fn(),
    setTimeRemaining: jest.fn(),
    autoRepeat: true,
    setAutoRepeat: jest.fn(),
    triggerRotation: jest.fn(),
    rotationSound: 'chime',
    setRotationSound: jest.fn(),
    timerStyle: 'circle',
    setTimerStyle: jest.fn(),
  };
}
