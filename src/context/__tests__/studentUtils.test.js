import { ensureUniqueStudents, normalizeStudentsByLayout } from '../stateUtils';

describe('ensureUniqueStudents', () => {
  it('keeps students that already have unique IDs', () => {
    const students = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ];
    const { next, changed } = ensureUniqueStudents(students);
    expect(changed).toBe(false);
    expect(next).toEqual(students);
  });

  it('assigns IDs to students without IDs', () => {
    const students = [
      { name: 'Alice' },
      { id: null, name: 'Bob' },
    ];
    const { next, changed } = ensureUniqueStudents(students);
    expect(changed).toBe(true);
    expect(next[0].id).toBeTruthy();
    expect(next[1].id).toBeTruthy();
    expect(next[0].name).toBe('Alice');
    expect(next[1].name).toBe('Bob');
  });

  it('regenerates duplicate IDs', () => {
    const students = [
      { id: 'same', name: 'Alice' },
      { id: 'same', name: 'Bob' },
    ];
    const { next, changed } = ensureUniqueStudents(students);
    expect(changed).toBe(true);
    expect(next[0].id).toBe('same');
    expect(next[1].id).not.toBe('same');
    expect(next[1].id).toBeTruthy();
  });

  it('handles null/undefined input', () => {
    const { next, changed } = ensureUniqueStudents(null);
    expect(next).toEqual([]);
    expect(changed).toBe(false);
  });
});

describe('normalizeStudentsByLayout', () => {
  it('converts array format (legacy) to per-layout object', () => {
    const legacy = [
      { id: '1', name: 'Alice', group: 'purple' },
      { id: '2', name: 'Bob', group: 'yellow' },
    ];
    const result = normalizeStudentsByLayout(legacy, 'layout-1');
    expect(result).toHaveProperty('layout-1');
    expect(result['layout-1']).toHaveLength(2);
    expect(result['layout-1'][0].name).toBe('Alice');
  });

  it('normalizes object format (current) with unique IDs per layout', () => {
    const input = {
      'layout-1': [{ id: 'a', name: 'Alice' }],
      'layout-2': [{ id: 'b', name: 'Bob' }],
    };
    const result = normalizeStudentsByLayout(input, 'layout-1');
    expect(result['layout-1']).toHaveLength(1);
    expect(result['layout-2']).toHaveLength(1);
  });

  it('returns empty structure for empty input', () => {
    const result = normalizeStudentsByLayout(null, 'layout-1');
    // null input falls through to DEFAULT_STUDENTS
    expect(result).toHaveProperty('layout-1');
    expect(Array.isArray(result['layout-1'])).toBe(true);
  });
});
