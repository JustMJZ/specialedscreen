import { DEFAULT_STUDENTS } from '../constants';

function createStudentId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function ensureUniqueStudents(list) {
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

export function normalizeStudentsByLayout(saved, fallbackLayoutId) {
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

export function createDefaultRoster() {
  return DEFAULT_STUDENTS.map(s => ({
    id: `r-${s.id}`,
    name: s.name,
    photo: s.photo || null,
    emoji: s.emoji || null,
  }));
}

export function getNextGroup(currentGroup, rotationOrder) {
  if (!rotationOrder || rotationOrder.length === 0) return currentGroup;
  return rotationOrder[(rotationOrder.indexOf(currentGroup) + 1) % rotationOrder.length];
}

const REQUIRED_BACKUP_KEYS = ['layoutTabs', 'activeLayoutId'];
const EXPECTED_BACKUP_KEYS = [
  'layoutTabs', 'activeLayoutId', 'totalTime', 'studentsByLayout',
  'floorPlansByLayout', 'rotationOrderByLayout',
];

export function validateBackup(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, error: 'File does not contain a valid data object.' };
  }
  for (const key of REQUIRED_BACKUP_KEYS) {
    if (!(key in data)) {
      return { valid: false, error: `Missing required field: "${key}".` };
    }
  }
  if (!Array.isArray(data.layoutTabs) || data.layoutTabs.length === 0) {
    return { valid: false, error: 'Backup contains no layout tabs.' };
  }
  const presentCount = EXPECTED_BACKUP_KEYS.filter(k => k in data).length;
  if (presentCount < 3) {
    return { valid: false, error: 'File is missing too many expected fields to be a valid backup.' };
  }
  return { valid: true, error: null };
}

export function normalizeRotationOrder(order) {
  if (!Array.isArray(order)) return [];
  return order;
}
