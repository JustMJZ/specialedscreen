export const STORAGE_KEY = 'specialedscreen-state';

export const loadSaved = (key, fallback) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && key in saved) return saved[key];
  } catch (e) {}
  return fallback;
};
