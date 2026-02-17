import React, { useState, useRef, useEffect } from 'react';

// Common classroom icons
const CLASSROOM_ICONS = [
  '✏️', '📝', '📚', '📖', '🎒', '✋', '🙋', '💭',
  '👀', '👂', '🗣️', '🤫', '🚶', '🪑', '🚽', '🚰',
  '🍎', '🥤', '⏰', '⏱️', '✅', '❌', '⭐', '🎯',
  '🎨', '✂️', '🖍️', '🖊️', '💻', '🖥️', '📱', '🎧',
  '🧠', '❤️', '😊', '🤔', '💪', '👍', '🙏', '🎉'
];

// Font options (including dyslexia-friendly fonts)
const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
];

// Border style options
const BORDER_STYLES = [
  { value: 'none', label: 'None', preview: 'border-0' },
  { value: 'solid-thin', label: 'Thin', preview: 'border-2 border-gray-300' },
  { value: 'solid-thick', label: 'Thick', preview: 'border-4 border-gray-400' },
  { value: 'dashed', label: 'Dashed', preview: 'border-2 border-dashed border-gray-400' },
  { value: 'dotted', label: 'Dotted', preview: 'border-2 border-dotted border-gray-400' },
  { value: 'double', label: 'Double', preview: 'border-4 border-double border-gray-400' },
];

const TextBoxEditor = ({ textBoxId, config, onUpdate, onClose }) => {
  const [title, setTitle] = useState(config?.title || '');
  const [content, setContent] = useState(config?.content || '');
  const [fontSize, setFontSize] = useState(config?.fontSize || 20);
  const [format, setFormat] = useState(config?.format || 'plain');
  const [voiceName, setVoiceName] = useState(config?.voiceName || '');
  const [ttsEnabled, setTtsEnabled] = useState(config?.ttsEnabled !== false); // Default true
  const [fontFamily, setFontFamily] = useState(config?.fontFamily || 'Arial, sans-serif');
  const [borderStyle, setBorderStyle] = useState(config?.borderStyle || 'none');
  const [textAlign, setTextAlign] = useState(config?.textAlign || 'left');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('textBoxTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const contentRef = useRef(null);
  const settingsRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    // Voices might load asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleSave = () => {
    onUpdate(textBoxId, {
      title,
      content,
      fontSize,
      format,
      voiceName,
      ttsEnabled,
      fontFamily,
      borderStyle,
      textAlign,
    });
    onClose();
  };

  const saveAsTemplate = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const templateName = prompt('Enter a name for this template:');
    if (!templateName || !templateName.trim()) return;

    const newTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      title,
      content,
      fontSize,
      format,
      voiceName,
      ttsEnabled,
      fontFamily,
      borderStyle,
      textAlign,
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('textBoxTemplates', JSON.stringify(updatedTemplates));
    alert(`Template "${templateName.trim()}" saved successfully!`);
  };

  const loadTemplate = (e, template) => {
    e.preventDefault();
    e.stopPropagation();

    setTitle(template.title || '');
    setContent(template.content || '');
    setFontSize(template.fontSize || 20);
    setFormat(template.format || 'plain');
    setVoiceName(template.voiceName || '');
    setTtsEnabled(template.ttsEnabled !== false);
    setFontFamily(template.fontFamily || 'Arial, sans-serif');
    setBorderStyle(template.borderStyle || 'none');
    setTextAlign(template.textAlign || 'left');
    setShowTemplates(false);
    setShowSettings(false);
  };

  const deleteTemplate = (e, templateId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Delete this template?')) return;
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('textBoxTemplates', JSON.stringify(updatedTemplates));
  };

  const insertIcon = (icon) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    // Insert icon at cursor position
    const beforeCursor = text.substring(0, start);
    const afterCursor = text.substring(end);

    // Insert icon with space at cursor position
    const newContent = beforeCursor + icon + ' ' + afterCursor;
    setContent(newContent);

    // Set cursor position after inserted icon and space
    setTimeout(() => {
      textarea.focus();
      const newPos = start + icon.length + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const highlightText = () => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;

    if (start === end) {
      alert('Please select some text to highlight');
      return;
    }

    const beforeSelection = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterSelection = text.substring(end);

    // Wrap selected text with highlight markers
    const newContent = beforeSelection + '==' + selectedText + '==' + afterSelection;
    setContent(newContent);

    // Set cursor after the highlighted text
    setTimeout(() => {
      textarea.focus();
      const newPos = end + 4; // After both == markers
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Parse text to render highlights
  const parseHighlights = (text) => {
    const parts = [];
    let currentIndex = 0;
    const regex = /==(.*?)==/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before highlight
      if (match.index > currentIndex) {
        parts.push({ type: 'text', content: text.substring(currentIndex, match.index) });
      }
      // Add highlighted text
      parts.push({ type: 'highlight', content: match[1] });
      currentIndex = regex.lastIndex;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(currentIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  // Render text with highlights
  const renderTextWithHighlights = (text) => {
    const parts = parseHighlights(text);
    return parts.map((part, i) => {
      if (part.type === 'highlight') {
        return <mark key={i} className="bg-yellow-200 px-1 rounded">{part.content}</mark>;
      }
      return <span key={i}>{part.content}</span>;
    });
  };

  // Get border class based on style
  const getBorderClass = (style) => {
    const borderMap = {
      'none': '',
      'solid-thin': 'border-2 border-gray-300',
      'solid-thick': 'border-4 border-gray-400',
      'dashed': 'border-2 border-dashed border-gray-400',
      'dotted': 'border-2 border-dotted border-gray-400',
      'double': 'border-4 border-double border-gray-400',
    };
    return borderMap[style] || '';
  };

  // Get text alignment class
  const getAlignmentClass = (align) => {
    const alignMap = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right',
    };
    return alignMap[align] || 'text-left';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="textbox-editor-title"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 id="textbox-editor-title" className="text-xl font-bold text-white">
              Text Box Editor
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">Create instructions for your students</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors flex items-center gap-2"
              >
                ⚙️ Settings
              </button>
              {showSettings && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 z-50 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    {/* Font Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Font Family
                      </label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm bg-white"
                      >
                        {FONT_OPTIONS.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Border Style */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Border Style
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {BORDER_STYLES.map((style) => (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => setBorderStyle(style.value)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              borderStyle === style.value
                                ? 'bg-indigo-500 text-white ring-1 ring-indigo-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Format Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Format
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { value: 'plain', label: 'Plain', icon: '📄' },
                          { value: 'bullets', label: 'Bullets', icon: '•' },
                          { value: 'numbered', label: 'Numbers', icon: '1.' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormat(option.value)}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                              format === option.value
                                ? 'bg-indigo-500 text-white ring-1 ring-indigo-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-base">{option.icon}</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { value: 'left', label: 'Left', icon: '⬅️' },
                          { value: 'center', label: 'Center', icon: '↔️' },
                          { value: 'right', label: 'Right', icon: '➡️' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTextAlign(option.value)}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                              textAlign === option.value
                                ? 'bg-indigo-500 text-white ring-1 ring-indigo-400'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-base">{option.icon}</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Text-to-Speech Toggle */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ttsEnabled}
                          onChange={(e) => setTtsEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500"
                        />
                        <span className="text-xs font-bold text-gray-700">Enable Text-to-Speech</span>
                      </label>
                    </div>

                    {/* Voice Selection (only if TTS enabled) */}
                    {ttsEnabled && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          TTS Voice
                        </label>
                        <select
                          value={voiceName}
                          onChange={(e) => setVoiceName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-sm bg-white"
                        >
                          <option value="">Default Voice</option>
                          {availableVoices.map((voice, i) => (
                            <option key={i} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <hr className="border-gray-200" />

                    {/* Templates */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-700">
                          Templates ({templates.length})
                        </label>
                        <button
                          type="button"
                          onClick={saveAsTemplate}
                          className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium"
                        >
                          💾 Save
                        </button>
                      </div>
                      {templates.length === 0 ? (
                        <div className="text-center text-gray-400 py-3 text-xs">
                          No templates saved yet
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {templates.map((template) => (
                            <div key={template.id} className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => loadTemplate(e, template)}
                                className="flex-1 text-left px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded text-xs font-medium text-blue-700"
                              >
                                {template.name}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => deleteTemplate(e, template.id)}
                                className="w-7 h-7 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-600 text-sm"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Routine, Steps to Success..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Instructions
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={highlightText}
                    className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 text-gray-800 rounded-lg text-xs font-medium transition-colors"
                    title="Highlight selected text"
                  >
                    🖍️ Highlight
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    {showIconPicker ? '▼' : '▶'} Icons
                  </button>
                </div>
              </div>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your instructions here... Each line will become a new item if using bullets or numbers. Use ==text== to highlight important words."
                rows={12}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              />
              {showIconPicker && (
                <div className="mt-2 bg-white rounded-xl border-2 border-gray-200 p-3 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {CLASSROOM_ICONS.map((icon, i) => (
                      <button
                        key={i}
                        onClick={() => insertIcon(icon)}
                        className="w-10 h-10 flex items-center justify-center text-2xl rounded-lg hover:bg-blue-50 hover:ring-2 hover:ring-blue-400 transition-all"
                        title={`Insert ${icon}`}
                        type="button"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Font Size Slider */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Font Size: {fontSize}px
              </label>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <input
                  type="range"
                  min="14"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #BFDBFE 0%, #60A5FA ${((fontSize - 14) / (48 - 14)) * 100}%, #E5E7EB ${((fontSize - 14) / (48 - 14)) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Small (14px)</span>
                  <span>Large (48px)</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Preview
              </label>
              <div className={`bg-white rounded-xl p-6 min-h-[200px] ${getBorderClass(borderStyle)}`}>
                {title && (
                  <h3
                    className={`font-bold text-gray-800 mb-4 leading-tight ${getAlignmentClass(textAlign)}`}
                    style={{ fontSize: `${fontSize * 1.4}px`, fontFamily }}
                  >
                    {renderTextWithHighlights(title)}
                  </h3>
                )}
                <div
                  className={`text-gray-700 leading-relaxed ${getAlignmentClass(textAlign)}`}
                  style={{ fontSize: `${fontSize}px`, fontFamily }}
                >
                  {content ? (
                    format === 'bullets' ? (
                      <ul className="list-disc list-inside space-y-1">
                        {content.split('\n').filter(line => line.trim()).map((line, i) => (
                          <li key={i}>{renderTextWithHighlights(line)}</li>
                        ))}
                      </ul>
                    ) : format === 'numbered' ? (
                      <ol className="list-decimal list-inside space-y-1">
                        {content.split('\n').filter(line => line.trim()).map((line, i) => (
                          <li key={i}>{renderTextWithHighlights(line)}</li>
                        ))}
                      </ol>
                    ) : (
                      content.split('\n').filter(line => line.trim()).map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">{renderTextWithHighlights(line)}</p>
                      ))
                    )
                  ) : (
                    <div className="text-gray-400 italic">Your preview will appear here...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextBoxEditor;
