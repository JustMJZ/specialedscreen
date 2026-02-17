// Starter templates for new users
import { DEFAULT_STATION_COLORS } from '../constants';

export const TEMPLATES = {
  simpleInstruction: {
    id: 'simpleInstruction',
    name: 'Simple Instruction',
    description: 'Clean layout with text instructions, timer, and floor plan',
    layout: [
      { i: 'textBox', x: 0, y: 0, w: 6, h: 23 },
      { i: 'timerPanel', x: 0, y: 23, w: 6, h: 14 },
      { i: 'floorplan', x: 6, y: 0, w: 6, h: 37 },
    ],
    floorPlan: {
      name: 'Main Floor Plan',
      stationConfigs: {
        purple: { top: 20, left: 20, width: 120, height: 100 },
        yellow: { top: 20, left: 350, width: 120, height: 100 },
        blue: { top: 150, left: 20, width: 120, height: 100 },
        green: { top: 150, left: 350, width: 120, height: 100 },
      },
      teacherNames: {
        purple: 'Teacher 1',
        yellow: 'Teacher 2',
        blue: 'Teacher 3',
        green: 'Teacher 4',
      },
      students: [],
      rotationOrder: ['purple', 'yellow', 'blue', 'green'],
      customBoxes: [],
      customStationColors: {},
    },
    rightNowText: 'Today\'s Instructions',
    firstThen: {
      firstIcon: '📝',
      firstLabel: 'Work',
      thenIcon: '✅',
      thenLabel: 'Done',
    },
    voiceLevel: 1,
  },
  essential: {
    id: 'essential',
    name: 'Essential Classroom',
    description: 'Core features for station rotations and classroom management',
    layout: [
      { i: 'banner', x: 0, y: 0, w: 12, h: 2 },
      { i: 'floorplan', x: 0, y: 2, w: 8, h: 20 },
      { i: 'timerPanel', x: 8, y: 2, w: 4, h: 13 },
      { i: 'stationGroups', x: 8, y: 15, w: 4, h: 7 },
      { i: 'voiceLevel', x: 0, y: 22, w: 3, h: 8 },
      { i: 'clock', x: 3, y: 22, w: 5, h: 8 },
      { i: 'firstThen', x: 8, y: 22, w: 4, h: 8 },
    ],
    floorPlan: {
      name: 'Main Floor Plan',
      stationConfigs: {
        purple: { top: 20, left: 20, width: 120, height: 100 },
        yellow: { top: 5, left: 682.265625, width: 110, height: 98 },
        blue: { top: 140, left: 20, width: 120, height: 100 },
        green: { top: 195, left: 672.265625, width: 120, height: 100 },
      },
      teacherNames: {
        purple: 'Ms. Smith',
        yellow: 'Mr. Johnson',
        blue: 'Mrs. Davis',
        green: 'Ms. Garcia',
      },
      students: [],
      rotationOrder: ['purple', 'yellow', 'blue', 'green'],
      customBoxes: [],
      customStationColors: {},
    },
    rightNowText: 'Welcome to Class! 🎉',
    firstThen: {
      firstIcon: '📚',
      firstLabel: 'Reading',
      thenIcon: '🎮',
      thenLabel: 'Free Time',
    },
    voiceLevel: 1,
  },
};

export const applyTemplate = (template) => {
  return {
    layoutItems: template.layout,
    floorPlan: {
      id: 'floor-plan-1',
      name: template.floorPlan.name,
      stationConfigs: template.floorPlan.stationConfigs,
      teacherNames: template.floorPlan.teacherNames,
      students: template.floorPlan.students,
      rotationOrder: template.floorPlan.rotationOrder,
      customBoxes: template.floorPlan.customBoxes || [],
      customStationColors: template.floorPlan.customStationColors || {},
    },
    rightNowText: template.rightNowText,
    firstThen: template.firstThen,
    voiceLevel: template.voiceLevel,
    stationColors: DEFAULT_STATION_COLORS,
  };
};
