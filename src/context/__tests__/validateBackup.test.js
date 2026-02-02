import { validateBackup } from '../stateUtils';

describe('validateBackup', () => {
  const validBackup = {
    layoutTabs: [{ id: 'layout-1', name: 'Main', layout: [] }],
    activeLayoutId: 'layout-1',
    totalTime: 900,
    studentsByLayout: {},
    floorPlansByLayout: {},
    rotationOrderByLayout: {},
  };

  it('accepts a valid backup', () => {
    const { valid, error } = validateBackup(validBackup);
    expect(valid).toBe(true);
    expect(error).toBeNull();
  });

  it('rejects null', () => {
    const { valid } = validateBackup(null);
    expect(valid).toBe(false);
  });

  it('rejects arrays', () => {
    const { valid } = validateBackup([1, 2, 3]);
    expect(valid).toBe(false);
  });

  it('rejects strings', () => {
    const { valid } = validateBackup('not an object');
    expect(valid).toBe(false);
  });

  it('rejects object missing layoutTabs', () => {
    const { valid, error } = validateBackup({ activeLayoutId: 'layout-1', totalTime: 900 });
    expect(valid).toBe(false);
    expect(error).toContain('layoutTabs');
  });

  it('rejects object missing activeLayoutId', () => {
    const { valid, error } = validateBackup({
      layoutTabs: [{ id: 'layout-1' }],
      totalTime: 900,
    });
    expect(valid).toBe(false);
    expect(error).toContain('activeLayoutId');
  });

  it('rejects empty layoutTabs array', () => {
    const { valid, error } = validateBackup({ ...validBackup, layoutTabs: [] });
    expect(valid).toBe(false);
    expect(error).toContain('no layout tabs');
  });

  it('rejects object with too few expected keys', () => {
    const { valid, error } = validateBackup({
      layoutTabs: [{ id: 'layout-1' }],
      activeLayoutId: 'layout-1',
    });
    expect(valid).toBe(false);
    expect(error).toContain('missing too many');
  });

  it('accepts backup with exactly 3 expected keys', () => {
    const { valid } = validateBackup({
      layoutTabs: [{ id: 'layout-1' }],
      activeLayoutId: 'layout-1',
      totalTime: 900,
    });
    expect(valid).toBe(true);
  });
});
