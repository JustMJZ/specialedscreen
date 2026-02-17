import { STORAGE_KEY } from '../hooks/usePersistedState';
import { validateBackup } from '../context/stateUtils';

/**
 * Exports the current app state as a JSON backup file
 * @param {Function} onComplete - Optional callback to run after export
 */
export const exportBackup = (onComplete) => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `specialedscreen-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  if (onComplete) onComplete();
};

/**
 * Imports a backup file and restores the app state
 * @param {Event} e - File input change event
 * @param {Function} onComplete - Optional callback to run after import
 */
export const importBackup = (e, onComplete) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      const { valid, error } = validateBackup(parsed);

      if (!valid) {
        alert(`This file does not look like a valid SpecialEdScreen backup.\n\n${error}`);
        return;
      }

      if (!window.confirm('This will replace all your current data. Are you sure?')) {
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.location.reload();
    } catch {
      alert('Could not read this file. Make sure it is a valid backup file.');
    }
  };

  reader.readAsText(file);
  e.target.value = '';

  if (onComplete) onComplete();
};
