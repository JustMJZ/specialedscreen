import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { COLORS } from '../../constants';
import { ROTATION_SOUNDS, playSound } from '../../constants/sounds';

const TimerPanel = () => {
  const {
    timeRemaining, totalTime, isRunning, setIsRunning,
    setTimeRemaining, setTotalTime,
    autoRepeat, setAutoRepeat,
    triggerRotation, isAnimating, isEditMode,
    rotationSound, setRotationSound,
    customSounds, setCustomSounds,
  } = useAppState();

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const progress = timeRemaining / totalTime;
  const [showCustom, setShowCustom] = useState(false);
  const [customMins, setCustomMins] = useState(Math.floor(totalTime / 60));
  const [customSecs, setCustomSecs] = useState(totalTime % 60);
  const fileInputRef = useRef(null);

  const disabled = isEditMode || isAnimating;
  let barColor = progress < 0.07 ? '#FF8A7A' : progress < 0.15 ? '#FFD166' : '#5BC0BE';

  // Sound helpers
  const allSounds = [...ROTATION_SOUNDS, ...customSounds.map(s => ({ id: s.id, name: `🎵 ${s.name}`, type: 'custom' }))];

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
    setCustomSounds(customSounds.filter(s => s.id !== id));
    if (rotationSound === id) setRotationSound('none');
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-md flex flex-col gap-2">
      {/* Timer display */}
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '56px', color: COLORS.text, lineHeight: 1, fontFamily: "'Fredoka One', cursive" }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        <span className={`text-sm px-2 py-1 rounded-full ${isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isRunning ? '●' : '○'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress * 100}%`, backgroundColor: barColor }} />
      </div>

      {/* Time presets */}
      {!isRunning && !showCustom && (
        <div className="flex gap-1 justify-center flex-wrap">
          {[5, 10, 15, 20].map(m => (
            <button key={m} onClick={() => { setTotalTime(m * 60); setTimeRemaining(m * 60); }}
              className={`px-2 py-0.5 text-xs rounded font-medium ${Math.floor(totalTime / 60) === m && totalTime % 60 === 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'}`} disabled={disabled}>{m}m</button>
          ))}
          <button onClick={() => { setCustomMins(Math.floor(totalTime / 60)); setCustomSecs(totalTime % 60); setShowCustom(true); }}
            className="px-2 py-0.5 text-xs rounded font-medium bg-purple-100 text-purple-600" disabled={disabled}>⏱️</button>
        </div>
      )}
      {!isRunning && showCustom && (
        <div className="flex items-center justify-center gap-1">
          <input type="number" min="0" max="120" value={customMins} onChange={(e) => setCustomMins(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-10 px-1 py-0.5 border rounded text-center text-sm" />
          <span className="text-xs">:</span>
          <input type="number" min="0" max="59" value={customSecs} onChange={(e) => setCustomSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="w-10 px-1 py-0.5 border rounded text-center text-sm" />
          <button onClick={() => { const total = customMins * 60 + customSecs; setTotalTime(total); setTimeRemaining(total); setShowCustom(false); }}
            className="px-2 py-0.5 text-xs rounded bg-teal-500 text-white font-medium">✓</button>
          <button onClick={() => setShowCustom(false)} className="px-2 py-0.5 text-xs rounded bg-gray-200">✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        <button onClick={() => setIsRunning(!isRunning)} className="px-4 py-2 rounded-lg font-bold text-white text-sm"
          style={{ backgroundColor: isRunning ? '#FF8A7A' : '#5BC0BE', opacity: disabled ? 0.5 : 1 }} disabled={disabled}>
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button onClick={() => setTimeRemaining(totalTime)} className="px-3 py-2 rounded-lg font-bold bg-gray-200 text-gray-700 text-sm"
          style={{ opacity: disabled ? 0.5 : 1 }} disabled={disabled}>↺</button>
        <button onClick={triggerRotation} className="px-3 py-2 rounded-lg font-bold text-sm"
          style={{ backgroundColor: isAnimating ? '#FEF3C7' : '#E5E7EB', color: isAnimating ? '#D97706' : '#374151', opacity: isEditMode ? 0.5 : 1 }} disabled={disabled}>
          ⏭ Next
        </button>
        <button onClick={() => setAutoRepeat(!autoRepeat)} className={`px-3 py-2 rounded-lg font-bold text-sm ${autoRepeat ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
          style={{ opacity: isEditMode ? 0.5 : 1 }} disabled={isEditMode}>{autoRepeat ? '🔁' : '👆'}</button>
      </div>

      {/* Sound selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500">🔊</span>
        <select value={rotationSound} onChange={(e) => { setRotationSound(e.target.value); playSound(e.target.value, customSounds); }}
          className="flex-1 px-2 py-1 text-sm border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-300">
          {allSounds.map(sound => (<option key={sound.id} value={sound.id}>{sound.name}</option>))}
        </select>
        <button onClick={() => playSound(rotationSound, customSounds)} className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200">▶</button>
      </div>
      <div className="flex items-center gap-1">
        <input ref={fileInputRef} type="file" accept=".mp3,.wav,.ogg" className="hidden" onChange={handleUpload} />
        <button onClick={() => fileInputRef.current.click()} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded text-gray-600">+ Upload Sound</button>
        {customSounds.find(s => s.id === rotationSound) && (
          <button onClick={() => handleDeleteSound(rotationSound)} className="text-xs bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded text-red-500">🗑️ Delete</button>
        )}
      </div>
    </div>
  );
};

export default TimerPanel;
