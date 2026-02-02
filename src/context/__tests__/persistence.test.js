import { STORAGE_KEY, loadSaved } from '../../hooks/usePersistedState';

beforeEach(() => {
  localStorage.clear();
});

describe('loadSaved', () => {
  it('returns fallback when localStorage is empty', () => {
    expect(loadSaved('totalTime', 900)).toBe(900);
  });

  it('returns saved value when key exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalTime: 600 }));
    expect(loadSaved('totalTime', 900)).toBe(600);
  });

  it('returns fallback when JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{{');
    expect(loadSaved('totalTime', 900)).toBe(900);
  });

  it('returns fallback when key is missing from saved object', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ otherKey: 'value' }));
    expect(loadSaved('totalTime', 900)).toBe(900);
  });

  it('returns falsy saved values correctly (not fallback)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ autoRepeat: false }));
    expect(loadSaved('autoRepeat', true)).toBe(false);
  });
});
