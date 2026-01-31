// Default grid layout (12-column grid) replicating original two-column appearance.
// Each item: { i: widgetId, x, y, w, h }
// Row height is ~30px with the default rowHeight setting.

const defaultLayout = [
  // Banner: full width top
  { i: 'banner', x: 0, y: 0, w: 12, h: 2 },

  // Floor plan: left 7 columns
  { i: 'floorplan', x: 0, y: 2, w: 7, h: 14 },

  // Right sidebar widgets: right 5 columns, stacked
  { i: 'timerPanel', x: 7, y: 2, w: 5, h: 8 },
  { i: 'tokenBoard', x: 7, y: 10, w: 5, h: 2 },
  { i: 'voiceLevel', x: 7, y: 12, w: 5, h: 2 },
  { i: 'firstThen', x: 7, y: 14, w: 5, h: 2 },
  { i: 'stationGroups', x: 7, y: 16, w: 5, h: 4 },

  // Additional widgets positioned below
  { i: 'countdown', x: 7, y: 20, w: 5, h: 2 },
  { i: 'quickMessage', x: 7, y: 22, w: 5, h: 2 },
  { i: 'starPoints', x: 7, y: 24, w: 5, h: 3 },
  { i: 'clock', x: 7, y: 27, w: 5, h: 1 },
];

export default defaultLayout;
