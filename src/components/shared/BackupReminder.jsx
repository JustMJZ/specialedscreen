import React, { useState, useEffect } from 'react';
import { BACKUP_TIMESTAMP_KEY, exportBackup } from '../../utils/backupUtils';
import { STORAGE_KEY } from '../../hooks/usePersistedState';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const SNOOZE_KEY = 'specialedscreen-backup-snoozed';

const BackupReminder = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't nudge if there's no data saved yet
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    // Don't show if snoozed recently
    const snoozed = localStorage.getItem(SNOOZE_KEY);
    if (snoozed && Date.now() - parseInt(snoozed, 10) < THIRTY_DAYS) return;

    const lastBackup = localStorage.getItem(BACKUP_TIMESTAMP_KEY);
    const elapsed = lastBackup ? Date.now() - parseInt(lastBackup, 10) : Infinity;
    if (elapsed > THIRTY_DAYS) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const handleBackup = () => {
    exportBackup();
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(SNOOZE_KEY, Date.now().toString());
    setShow(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9998] max-w-sm animate-in">
      <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">💾</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 mb-1">
              Back up your data?
            </div>
            <div className="text-xs text-gray-500 mb-3">
              Your setup is saved in this browser only. Export a backup to keep it safe.
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBackup}
                className="text-xs px-3 py-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium"
              >
                Export Backup
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 text-sm flex-shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupReminder;
