import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { EMOJI_OPTIONS } from '../../constants';
import { useAppState } from '../../context/AppStateContext';

const MODES = [
  { id: 'static',   label: 'Text' },
  { id: 'rotating', label: 'Rotating' },
];

// ── Rotating messages display ────────────────────────────────────────────────
const RotatingDisplay = ({ messages, interval, fontSize }) => {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const msgs = messages?.length ? messages : ['Add messages in settings'];

  useEffect(() => {
    if (msgs.length <= 1) return;
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % msgs.length);
        setFade(true);
      }, 300);
    }, (interval || 10) * 1000);
    return () => clearInterval(id);
  }, [msgs.length, interval]);

  return (
    <div
      className="h-full w-full flex items-center justify-center px-4 transition-opacity duration-300"
      style={{ opacity: fade ? 1 : 0 }}
    >
      <span
        className="font-extrabold text-center"
        style={{ fontSize, fontFamily: "'Baloo 2', cursive", textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
      >
        {msgs[idx]}
      </span>
    </div>
  );
};

// ── Celebration overlay ──────────────────────────────────────────────────────
const CelebrationOverlay = ({ onDone }) => {
  const PARTICLES = ['⭐','🎉','✨','🌟','💥','🎊','🏆','👏'];
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: PARTICLES[i % PARTICLES.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.2 + Math.random() * 0.8}s`,
  }));

  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center">
      <style>{`
        @keyframes cel-fall {
          0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes cel-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          30%  { transform: scale(1.15); opacity: 1; }
          80%  { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed text-3xl"
          style={{ left: p.left, top: '-40px', animation: `cel-fall ${p.duration} ${p.delay} ease-in forwards` }}
        >
          {p.emoji}
        </div>
      ))}
      <div
        className="font-black text-6xl text-center"
        style={{
          fontFamily: "'Baloo 2', cursive",
          animation: 'cel-pop 3s ease forwards',
          background: 'linear-gradient(135deg, #f59e0b, #ec4899, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        AMAZING JOB!
      </div>
    </div>,
    document.body
  );
};

// ── Main Banner ──────────────────────────────────────────────────────────────
const Banner = ({ text, fontSize = 28, onEdit, onFontSizeChange, mode = 'static', onModeChange, config = {}, onConfigChange }) => {
  const { isWidgetLocked } = useAppState();
  const [showEditor, setShowEditor] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const [editText, setEditText] = useState(text);
  const [editFontSize, setEditFontSize] = useState(fontSize);
  const [editMode, setEditMode] = useState(mode);
  const [editConfig, setEditConfig] = useState(config);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textInputRef = useRef(null);

  const openEditor = () => {
    setEditText(text);
    setEditFontSize(fontSize);
    setEditMode(mode);
    setEditConfig(config);
    setShowEditor(true);
  };

  const handleSave = () => {
    onEdit(editText);
    onFontSizeChange(editFontSize);
    onModeChange(editMode);
    onConfigChange(editConfig);
    setShowEditor(false);
  };

  const updateConfig = (key, val) => setEditConfig((prev) => ({ ...prev, [key]: val }));

  const savedMessages = editConfig.savedMessages || [];

  const insertEmoji = (emoji) => {
    const input = textInputRef.current;
    if (!input) { setEditText((t) => t + emoji); return; }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = editText.slice(0, start) + emoji + editText.slice(end);
    setEditText(next);
    // Restore cursor after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const saveToBank = () => {
    if (!editText.trim() || savedMessages.includes(editText.trim())) return;
    updateConfig('savedMessages', [...savedMessages, editText.trim()]);
  };

  const renderDisplay = () => {
    if (mode === 'rotating') {
      return <RotatingDisplay messages={config.messages} interval={config.rotateInterval} fontSize={fontSize} />;
    }
    return (
      <div
        className="font-extrabold text-center px-4 w-full"
        style={{ fontSize, fontFamily: "'Baloo 2', cursive", textShadow: '0 3px 10px rgba(0,0,0,0.25)' }}
      >
        {text || 'Click to edit'}
      </div>
    );
  };

  return (
    <>
      {celebrating && <CelebrationOverlay onDone={() => setCelebrating(false)} />}

      <div
        className={`h-full w-full flex items-center relative group overflow-hidden transition-opacity ${!isWidgetLocked ? 'cursor-pointer hover:opacity-95' : ''}`}
        onClick={() => !isWidgetLocked && openEditor()}
      >
        {renderDisplay()}
        <button
          onClick={(e) => { e.stopPropagation(); setCelebrating(true); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-base"
          title="Celebrate!"
        >
          🎉
        </button>
      </div>

      {showEditor && ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowEditor(false)} />
          <div
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 dark:border-slate-600">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Banner Settings</h3>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1 p-4 pb-0">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setEditMode(m.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${editMode === m.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">

              {/* Text mode */}
              {editMode === 'static' && (
                <>
                  <div className="flex gap-2">
                    <input
                      ref={textInputRef}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Banner text..."
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button
                      onClick={() => setShowEmojiPicker((v) => !v)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${showEmojiPicker ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                      title="Insert emoji"
                    >
                      😀
                    </button>
                    <button
                      onClick={saveToBank}
                      disabled={!editText.trim() || savedMessages.includes(editText.trim())}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      title="Save to bank"
                    >
                      Save
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="p-2 bg-gray-50 border rounded-lg">
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {EMOJI_OPTIONS.map((em) => (
                          <button
                            key={em}
                            onClick={() => insertEmoji(em)}
                            className="w-8 h-8 rounded hover:bg-gray-200 text-lg flex items-center justify-center"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Font size</span>
                    <button onClick={() => setEditFontSize(Math.max(12, editFontSize - 4))} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold text-sm">−</button>
                    <span className="text-sm font-bold w-10 text-center">{editFontSize}px</span>
                    <button onClick={() => setEditFontSize(Math.min(72, editFontSize + 4))} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold text-sm">+</button>
                  </div>

                  {savedMessages.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Saved Messages</div>
                      <div className="space-y-1">
                        {savedMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${editText === msg ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => setEditText(msg)}
                          >
                            <span className="flex-1 text-sm truncate">{msg}</span>
                            {editText === msg && <span className="text-indigo-500 text-xs font-bold">active</span>}
                            <button
                              onClick={(e) => { e.stopPropagation(); updateConfig('savedMessages', savedMessages.filter((_, j) => j !== i)); }}
                              className="text-gray-300 hover:text-red-400 text-xs ml-1"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Rotating mode */}
              {editMode === 'rotating' && (
                <>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">Messages</div>
                    <div className="space-y-1.5 mb-2">
                      {(editConfig.messages || []).map((msg, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={msg}
                            onChange={(e) => {
                              const msgs = [...(editConfig.messages || [])];
                              msgs[i] = e.target.value;
                              updateConfig('messages', msgs);
                            }}
                            className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          <button
                            onClick={() => updateConfig('messages', (editConfig.messages || []).filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600 text-xs px-1"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newMessage.trim()) {
                            updateConfig('messages', [...(editConfig.messages || []), newMessage.trim()]);
                            setNewMessage('');
                          }
                        }}
                        placeholder="Add a message..."
                        className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => {
                          if (newMessage.trim()) {
                            updateConfig('messages', [...(editConfig.messages || []), newMessage.trim()]);
                            setNewMessage('');
                          }
                        }}
                        className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
                      >Add</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Rotate every</span>
                    <select
                      value={editConfig.rotateInterval || 10}
                      onChange={(e) => updateConfig('rotateInterval', Number(e.target.value))}
                      className="px-2 py-1 border rounded text-sm focus:outline-none"
                    >
                      {[5,10,15,20,30,60].map((s) => <option key={s} value={s}>{s}s</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Font size</span>
                    <button onClick={() => setEditFontSize(Math.max(12, editFontSize - 4))} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold text-sm">−</button>
                    <span className="text-sm font-bold w-10 text-center">{editFontSize}px</span>
                    <button onClick={() => setEditFontSize(Math.min(72, editFontSize + 4))} className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 font-bold text-sm">+</button>
                  </div>
                </>
              )}
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-slate-600 flex gap-3">
              <button onClick={() => setShowEditor(false)} className="flex-1 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600">
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Banner;
