import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';

const TextBox = ({ id, isLayoutEditMode }) => {
  const { textBoxes = {}, setShowTextBoxEditor, setEditingTextBoxId } = useAppState();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get config for this specific textBox instance
  const config = textBoxes[id] || {
    title: 'Click to Edit',
    content: 'Add your instructions here...',
    fontSize: 20,
    format: 'plain',
    voiceName: '',
    ttsEnabled: true,
    fontFamily: 'Arial, sans-serif',
    borderStyle: 'none',
    textAlign: 'left',
  };

  const { title, content, fontSize, format, voiceName, ttsEnabled, fontFamily, borderStyle, textAlign } = config;

  const handleClick = () => {
    if (isLayoutEditMode) return; // Don't open editor when dragging/resizing
    setEditingTextBoxId(id);
    setShowTextBoxEditor(true);
  };

  const handleTextToSpeech = (e) => {
    e.stopPropagation(); // Prevent opening editor

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser');
      return;
    }

    // If already speaking, stop
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Create speech text (remove highlight markers for TTS)
    const cleanContent = content?.replace(/==/g, '') || '';
    const cleanTitle = title?.replace(/==/g, '') || '';
    const speechText = `${cleanTitle ? cleanTitle + '. ' : ''}${cleanContent}`;

    if (!speechText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Use selected voice if configured
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = (e) => {
    e.stopPropagation();

    // Create a print window
    const printWindow = window.open('', '_blank');
    const cleanContent = content?.replace(/==/g, '') || '';
    const cleanTitle = title?.replace(/==/g, '') || '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print: ${cleanTitle || 'Text Box'}</title>
          <style>
            body {
              font-family: ${fontFamily};
              font-size: ${fontSize}px;
              padding: 40px;
              line-height: 1.6;
            }
            h1 {
              font-size: ${fontSize * 1.4}px;
              margin-bottom: 20px;
            }
            p {
              margin-bottom: 10px;
            }
            ul, ol {
              margin: 10px 0;
              padding-left: 30px;
            }
            li {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          ${cleanTitle ? `<h1>${cleanTitle}</h1>` : ''}
          ${format === 'bullets' ? '<ul>' : format === 'numbered' ? '<ol>' : ''}
          ${cleanContent.split('\n').filter(line => line.trim()).map(line => {
            if (format === 'bullets' || format === 'numbered') {
              return `<li>${line}</li>`;
            }
            return `<p>${line}</p>`;
          }).join('')}
          ${format === 'bullets' ? '</ul>' : format === 'numbered' ? '</ol>' : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Parse text to render highlights
  const parseHighlights = (text) => {
    if (!text) return [];
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

  // Format content based on format type
  const formatContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n').filter(line => line.trim());

    if (format === 'bullets') {
      return (
        <ul className={`list-disc space-y-1 ${textAlign === 'center' ? 'list-inside' : textAlign === 'right' ? 'list-inside' : 'list-inside'}`}>
          {lines.map((line, i) => (
            <li key={i}>{renderTextWithHighlights(line)}</li>
          ))}
        </ul>
      );
    }

    if (format === 'numbered') {
      return (
        <ol className={`list-decimal space-y-1 ${textAlign === 'center' ? 'list-inside' : textAlign === 'right' ? 'list-inside' : 'list-inside'}`}>
          {lines.map((line, i) => (
            <li key={i}>{renderTextWithHighlights(line)}</li>
          ))}
        </ol>
      );
    }

    // Plain text - preserve line breaks
    return lines.map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">{renderTextWithHighlights(line)}</p>
    ));
  };

  return (
    <div
      onClick={handleClick}
      className={`h-full w-full flex flex-col p-6 ${!isLayoutEditMode ? 'cursor-pointer hover:bg-black/5' : ''} transition-colors relative group ${getBorderClass(borderStyle)}`}
    >
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Print button */}
        {(content && content.trim()) && (
          <button
            onClick={handlePrint}
            className="w-10 h-10 rounded-full bg-green-500/90 hover:bg-green-600 flex items-center justify-center text-white backdrop-blur-sm transition-all"
            title="Print"
          >
            🖨️
          </button>
        )}
        {/* Text-to-Speech button (only if enabled) */}
        {ttsEnabled && (content && content.trim()) && (
          <button
            onClick={handleTextToSpeech}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all ${
              isSpeaking
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500/90 hover:bg-blue-600'
            }`}
            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
          >
            {isSpeaking ? '⏸' : '🔊'}
          </button>
        )}
        {/* Edit button */}
        <div className="w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-800 flex items-center justify-center text-white backdrop-blur-sm transition-colors">
          📝
        </div>
      </div>

      {/* Title */}
      {title && (
        <h3
          className={`font-bold text-gray-800 mb-4 leading-tight ${getAlignmentClass(textAlign)}`}
          style={{ fontSize: `${fontSize * 1.4}px`, fontFamily }}
        >
          {renderTextWithHighlights(title)}
        </h3>
      )}

      {/* Content */}
      <div
        className={`text-gray-700 overflow-y-auto flex-1 leading-relaxed ${getAlignmentClass(textAlign)}`}
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        {formatContent(content)}
      </div>

      {/* Empty state hint */}
      {(!content || content.trim() === '') && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-2">📝</div>
            <div className="text-sm font-medium">Click to add instructions</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextBox;
