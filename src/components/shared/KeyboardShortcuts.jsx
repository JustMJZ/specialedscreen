import React, { useState, useEffect } from 'react';

/**
 * KeyboardShortcuts - Displays helpful keyboard shortcuts to users
 * Shows on first visit or when user presses '?' key
 */
const KeyboardShortcuts = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Show shortcuts when user presses '?' or 'h'
      if (e.key === '?' || (e.key === 'h' && e.ctrlKey)) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
      // Hide on Escape
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Press ?)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setIsVisible(false)}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-800">
              ⌨️ Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* General shortcuts */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">General</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['?']} description="Show/hide keyboard shortcuts" />
                <ShortcutRow keys={['Esc']} description="Close modals and menus" />
                <ShortcutRow keys={['P']} description="Toggle presentation mode" />
              </div>
            </section>

            {/* Navigation */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Navigation</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['Tab']} description="Move between interactive elements" />
                <ShortcutRow keys={['Shift', 'Tab']} description="Move backward between elements" />
                <ShortcutRow keys={['Enter']} description="Activate buttons and links" />
                <ShortcutRow keys={['Space']} description="Toggle checkboxes and buttons" />
              </div>
            </section>

            {/* Timer controls */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Timer Controls (when focused)
              </h3>
              <div className="space-y-2">
                <ShortcutRow keys={['Space']} description="Start/pause timer" />
                <ShortcutRow keys={['R']} description="Reset timer" />
                <ShortcutRow keys={['Enter']} description="Trigger rotation" />
              </div>
            </section>

            {/* Accessibility */}
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Accessibility</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['Ctrl', '+']} description="Zoom in (browser)" mac="Cmd +" />
                <ShortcutRow keys={['Ctrl', '-']} description="Zoom out (browser)" mac="Cmd -" />
                <ShortcutRow keys={['Ctrl', '0']} description="Reset zoom (browser)" mac="Cmd 0" />
              </div>
            </section>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Most buttons and controls can be accessed using the Tab key
              and activated with Enter or Space. Screen reader users can use standard navigation
              commands to explore the interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortcutRow = ({ keys, description, mac }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-gray-400 mx-1">+</span>}
        </React.Fragment>
      ))}
    </div>
    <span className="text-gray-600 text-sm ml-4">{description}</span>
  </div>
);

export default KeyboardShortcuts;
