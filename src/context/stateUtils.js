import { DEFAULT_STUDENTS, DEFAULT_ROTATION_ORDER } from '../constants';

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

export function normalizeRotationOrder(order) {
  if (!Array.isArray(order)) return [];
  if (order.length === 0) return [];
  if (order.length < DEFAULT_ROTATION_ORDER.length) {
    const missing = DEFAULT_ROTATION_ORDER.filter(c => !order.includes(c));
    if (missing.length > 0) return [...order, ...missing];
  }
  return order;
}
