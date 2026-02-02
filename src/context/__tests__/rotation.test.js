import { getNextGroup } from '../stateUtils';

describe('getNextGroup', () => {
  it('returns next group in rotation order', () => {
    const order = ['purple', 'yellow', 'blue'];
    expect(getNextGroup('purple', order)).toBe('yellow');
    expect(getNextGroup('yellow', order)).toBe('blue');
  });

  it('wraps around at end of rotation order', () => {
    const order = ['purple', 'yellow', 'blue'];
    expect(getNextGroup('blue', order)).toBe('purple');
  });

  it('handles single-station rotation', () => {
    const order = ['purple'];
    expect(getNextGroup('purple', order)).toBe('purple');
  });

  it('handles empty rotation order', () => {
    expect(getNextGroup('purple', [])).toBe('purple');
  });

  it('handles group not in rotation order', () => {
    const order = ['purple', 'yellow', 'blue'];
    // indexOf returns -1, so (-1+1) % 3 = 0 => first element
    expect(getNextGroup('green', order)).toBe('purple');
  });
});
