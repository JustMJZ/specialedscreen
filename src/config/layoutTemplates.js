// Layout templates for quick-start layouts
// Each template defines a pre-configured widget arrangement

const layoutTemplates = {
  'Simple Instruction': {
    name: 'Simple Instruction',
    description: 'Text instructions, timer, and floor plan',
    layout: [
      // TextBox: left side, top
      { i: 'textBox', x: 0, y: 0, w: 6, h: 23, minW: 3, minH: 3 },

      // TimerPanel: left side, bottom
      { i: 'timerPanel', x: 0, y: 23, w: 6, h: 14, minW: 2, minH: 4 },

      // FloorPlan: right side, full height
      { i: 'floorplan', x: 6, y: 0, w: 6, h: 37, minW: 3, minH: 4 },
    ],
  },

  'Default': {
    name: 'Default',
    description: 'Classic layout with banner and widgets',
    layout: [
      // Banner: full width top
      { i: 'banner', x: 0, y: 0, w: 12, h: 2, minW: 2, minH: 1 },

      // Floor plan: left 7 columns
      { i: 'floorplan', x: 0, y: 2, w: 7, h: 14, minW: 3, minH: 4 },

      // Right sidebar widgets: right 5 columns, stacked
      { i: 'timerPanel', x: 7, y: 2, w: 5, h: 8, minW: 2, minH: 4 },
      { i: 'tokenBoard', x: 7, y: 10, w: 5, h: 2, minW: 2, minH: 1 },
      { i: 'voiceLevel', x: 7, y: 12, w: 5, h: 2, minW: 2, minH: 2 },
      { i: 'firstThen', x: 7, y: 14, w: 5, h: 2, minW: 2, minH: 2 },
      { i: 'stationGroups', x: 7, y: 16, w: 5, h: 4, minW: 2, minH: 2 },

      // Additional widgets positioned below
      { i: 'countdown', x: 7, y: 20, w: 5, h: 2, minW: 2, minH: 1 },
      { i: 'quickMessage', x: 7, y: 22, w: 5, h: 2, minW: 2, minH: 1 },
      { i: 'clock', x: 7, y: 24, w: 5, h: 1, minW: 1, minH: 1 },
    ],
  },

  'Focus View': {
    name: 'Focus View',
    description: 'Large floor plan with essential controls',
    layout: [
      // Banner: full width top
      { i: 'banner', x: 0, y: 0, w: 12, h: 2, minW: 2, minH: 1 },

      // Floor plan: large center
      { i: 'floorplan', x: 0, y: 2, w: 8, h: 20, minW: 3, minH: 4 },

      // TimerPanel: right side
      { i: 'timerPanel', x: 8, y: 2, w: 4, h: 13, minW: 2, minH: 4 },

      // Station groups: right side bottom
      { i: 'stationGroups', x: 8, y: 15, w: 4, h: 7, minW: 2, minH: 2 },

      // Voice level: bottom left
      { i: 'voiceLevel', x: 0, y: 22, w: 3, h: 8, minW: 2, minH: 2 },

      // Clock: bottom center
      { i: 'clock', x: 3, y: 22, w: 5, h: 8, minW: 1, minH: 1 },

      // First Then: bottom right
      { i: 'firstThen', x: 8, y: 22, w: 4, h: 8, minW: 2, minH: 2 },
    ],
  },
};

export default layoutTemplates;
