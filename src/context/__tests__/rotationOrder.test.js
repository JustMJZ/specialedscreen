import { normalizeRotationOrder } from '../stateUtils';

describe('normalizeRotationOrder', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeRotationOrder(null)).toEqual([]);
    expect(normalizeRotationOrder(undefined)).toEqual([]);
    expect(normalizeRotationOrder('purple')).toEqual([]);
    expect(normalizeRotationOrder(42)).toEqual([]);
  });

  it('returns empty array for empty array', () => {
    expect(normalizeRotationOrder([])).toEqual([]);
  });

  it('appends missing default stations when order is partial', () => {
    const result = normalizeRotationOrder(['purple', 'yellow']);
    expect(result[0]).toBe('purple');
    expect(result[1]).toBe('yellow');
    expect(result).toContain('blue');
    expect(result).toContain('green');
    expect(result).toContain('pink');
    expect(result.length).toBe(5);
  });

  it('returns order unchanged when all defaults are present', () => {
    const full = ['purple', 'yellow', 'blue', 'green', 'pink'];
    expect(normalizeRotationOrder(full)).toEqual(full);
  });

  it('returns order unchanged when it has more than default count', () => {
    const extended = ['purple', 'yellow', 'blue', 'green', 'pink', 'station-custom'];
    expect(normalizeRotationOrder(extended)).toEqual(extended);
  });

  it('preserves custom order while appending missing defaults', () => {
    const result = normalizeRotationOrder(['blue', 'purple']);
    expect(result[0]).toBe('blue');
    expect(result[1]).toBe('purple');
    // Missing defaults appended after
    expect(result.indexOf('yellow')).toBeGreaterThan(1);
    expect(result.indexOf('green')).toBeGreaterThan(1);
    expect(result.indexOf('pink')).toBeGreaterThan(1);
  });
});
