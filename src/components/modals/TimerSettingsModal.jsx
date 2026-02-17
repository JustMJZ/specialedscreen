import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ROTATION_SOUNDS, playSound } from '../../constants/sounds';

const TIMER_STYLES = [
  { id: 'ring', icon: '⏱️', label: 'Ring', description: 'Classic circular timer' },
  { id: 'hourglass', icon: '⏳', label: 'Sand', description: 'Hourglass with flowing sand' },
  { id: 'space', icon: '🪐', label: 'Space', description: 'Rocket orbiting planet' },
  { id: 'ocean', icon: '🌊', label: 'Ocean', description: 'Boat sailing across waves' },
  { id: 'arcade', icon: '🕹️', label: 'Arcade', description: 'Retro gaming vibes' },
  { id: 'classic', icon: '🔢', label: 'Classic', description: 'Simple progress bar' },
];

const TimerSettingsModal = ({
  show,
  onClose,
  timerStyle,
  setTimerStyle,
  totalTime,
  setTotalTime,
  setTimeRemaining,
  isRunning,
  autoRepeat,
  setAutoRepeat,
  rotationSound,
  setRotationSound,
  customSounds,
  setCustomSounds,
  soundVolume,
  setSoundVolume,
  isEditMode,
}) => {
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMins, setCustomMins] = useState(Math.floor(totalTime / 60));
  const [customSecs, setCustomSecs] = useState(totalTime % 60);
  const fileInputRef = useRef(null);

  if (!show) return null;

  const allSounds = [
    ...ROTATION_SOUNDS,
    ...customSounds.map((s) => ({ id: s.id, name: `🎵 ${s.name}`, type: 'custom' })),
  ];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const name = window.prompt('Name for this sound:', file.name.replace(/\.[^.]+$/, ''));
    if (!name) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newSound = { id: `custom-${Date.now()}`, name, dataUrl: ev.target.result };
      setCustomSounds([...customSounds, newSound]);
      setRotationSound(newSound.id);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteSound = (id) => {
    if (!window.confirm('Delete this custom sound?')) return;
    setCustomSounds(customSounds.filter((s) => s.id !== id));
    if (rotationSound === id) setRotationSound('none');
  };

  const setCustomTime = () => {
    const total = customMins * 60 + customSecs;
    setTotalTime(total);
    setTimeRemaining(total);
    setShowCustomTime(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-settings-title"
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 id="timer-settings-title" className="text-2xl font-bold text-gray-800">
              Timer Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Customize your timer appearance and behavior
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
              aria-label="Done and close"
            >
              Done
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 pb-8 space-y-8">
          {/* Timer Style Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Timer Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIMER_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setTimerStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    timerStyle === style.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{style.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Duration Section */}
          {!isRunning && (
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Duration</h3>
              {!showCustomTime ? (
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => {
                        setTotalTime(minutes * 60);
                        setTimeRemaining(minutes * 60);
                      }}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        Math.floor(totalTime / 60) === minutes && totalTime % 60 === 0
                          ? 'bg-teal-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCustomMins(Math.floor(totalTime / 60));
                      setCustomSecs(totalTime % 60);
                      setShowCustomTime(true);
                    }}
                    className="px-6 py-3 rounded-lg font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
                  >
                    ⏱️ Custom
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={customMins}
                        onChange={(e) => setCustomMins(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold"
                      />
                    </div>
                    <span className="text-2xl text-gray-400 mt-5">:</span>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Seconds</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customSecs}
                        onChange={(e) =>
                          setCustomSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={setCustomTime}
                      className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors"
                    >
                      ✓ Set Time
                    </button>
                    <button
                      onClick={() => setShowCustomTime(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Rotation Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rotation</h3>
            <button
              onClick={() => setAutoRepeat(!autoRepeat)}
              disabled={isEditMode}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                autoRepeat ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              } ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {autoRepeat ? '🔁 Auto-Rotate' : '👆 Manual Rotate'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {autoRepeat
                      ? 'Automatically rotate students when timer completes'
                      : 'Click "Next" button to rotate students manually'}
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${autoRepeat ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${autoRepeat ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`}
                  />
                </div>
              </div>
            </button>
          </section>

          {/* Sound Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rotation Sound</h3>

            {/* Sound Selection */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {allSounds.map((sound) => (
                <div
                  key={sound.id}
                  className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    rotationSound === sound.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                  }`}
                  onClick={() => {
                    setRotationSound(sound.id);
                    playSound(sound.id, customSounds, soundVolume);
                  }}
                >
                  <div className="flex-1 font-medium text-gray-700">{sound.name}</div>
                  {sound.type === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSound(sound.id);
                      }}
                      className="text-red-400 hover:text-red-600 px-2"
                    >
                      ✕
                    </button>
                  )}
                  {rotationSound === sound.id && <span className="text-purple-500">✓</span>}
                </div>
              ))}
            </div>

            {/* Upload Custom Sound */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              + Upload Custom Sound
            </button>

            {/* Volume Slider */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Volume</label>
              <div className="flex items-center gap-3">
                <span className="text-xl">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  onMouseUp={() => playSound(rotationSound, customSounds, soundVolume)}
                  onTouchEnd={() => playSound(rotationSound, customSounds, soundVolume)}
                  className="flex-1 h-2 accent-purple-500 cursor-pointer"
                />
                <span className="text-xl">🔊</span>
                <span className="text-sm font-mono text-gray-600 w-12 text-right">
                  {Math.round(soundVolume * 100)}%
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimerSettingsModal;
