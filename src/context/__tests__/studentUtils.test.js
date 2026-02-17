import {
  ensureUniqueStudents,
  normalizeStudentsByLayout,
  createDefaultRoster,
} from '../stateUtils';

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
    const students = [{ name: 'Alice' }, { id: null, name: 'Bob' }];
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

  it('handles empty array', () => {
    const { next, changed } = ensureUniqueStudents([]);
    expect(next).toEqual([]);
    expect(changed).toBe(false);
  });

  it('preserves other student properties when regenerating ID', () => {
    const students = [
      { id: 'dup', name: 'Alice', group: 'purple', photo: 'photo.jpg' },
      { id: 'dup', name: 'Bob', group: 'yellow', photo: null },
    ];
    const { next } = ensureUniqueStudents(students);
    expect(next[1].name).toBe('Bob');
    expect(next[1].group).toBe('yellow');
    expect(next[1].photo).toBeNull();
  });

  it('generates unique IDs for multiple students without IDs', () => {
    const students = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];
    const { next } = ensureUniqueStudents(students);
    const ids = next.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
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

  it('fixes duplicate IDs within a layout in object format', () => {
    const input = {
      'layout-1': [
        { id: 'dup', name: 'Alice' },
        { id: 'dup', name: 'Bob' },
      ],
    };
    const result = normalizeStudentsByLayout(input, 'layout-1');
    const ids = result['layout-1'].map((s) => s.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('handles empty object input', () => {
    const result = normalizeStudentsByLayout({}, 'layout-1');
    expect(result).toEqual({});
  });
});

describe('createDefaultRoster', () => {
  it('returns an array of roster entries', () => {
    const roster = createDefaultRoster();
    expect(Array.isArray(roster)).toBe(true);
    expect(roster.length).toBeGreaterThan(0);
  });

  it('each entry has id, name, photo, and emoji fields', () => {
    const roster = createDefaultRoster();
    roster.forEach((entry) => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('photo');
      expect(entry).toHaveProperty('emoji');
    });
  });

  it('roster IDs are prefixed with r-', () => {
    const roster = createDefaultRoster();
    roster.forEach((entry) => {
      expect(entry.id).toMatch(/^r-/);
    });
  });
});
