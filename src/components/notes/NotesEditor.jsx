import React, { useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import './notes.css';

const SAVE_DELAY = 800;

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecdd3', '#fed7aa', '#e9d5ff',
];

const TEXT_COLORS = [
  '#dc2626', '#2563eb', '#16a34a', '#ea580c', '#9333ea', '#0f172a',
];

export default function NotesEditor({ doc, onSave }) {
  const saveTimer = useRef(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'
  const [showHighlights, setShowHighlights] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: doc.content || '',
    onUpdate: ({ editor }) => {
      setSaveStatus('saving');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onSave(editor.getJSON());
        setSaveStatus('saved');
      }, SAVE_DELAY);
    },
  });

  const handlePrint = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>${doc.title}</title>
      <style>
        body { font-family: Georgia, serif; font-size: 16px; line-height: 1.8; color: #1e293b; padding: 48px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 2em; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; }
        h2 { font-size: 1.5em; font-weight: 700; margin-top: 24px; }
        h3 { font-size: 1.2em; font-weight: 600; margin-top: 20px; }
        ul { list-style: disc; padding-left: 28px; } ol { list-style: decimal; padding-left: 28px; }
        ul[data-type="taskList"] { list-style: none; padding-left: 4px; }
        ul[data-type="taskList"] li { display: flex; gap: 10px; margin-bottom: 6px; }
        blockquote { border-left: 4px solid #6366f1; padding-left: 16px; color: #475569; font-style: italic; margin: 16px 0; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
        th { background: #f8fafc; font-weight: 700; }
        a { color: #3b82f6; } mark { border-radius: 3px; padding: 1px 2px; }
        code { background: #f1f5f9; padding: 2px 5px; border-radius: 3px; }
        pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; }
        hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
      </style>
    </head><body><h1>${doc.title}</h1>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  }, [editor, doc.title]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('URL:', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Toolbar */}
      <div
        className="notes-no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          padding: '6px 12px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          flexShrink: 0,
        }}
      >
        {/* History */}
        <TBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</TBtn>
        <TBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</TBtn>

        <TSep />

        {/* Inline marks */}
        <TBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></TBtn>
        <TBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></TBtn>
        <TBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></TBtn>
        <TBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></TBtn>

        <TSep />

        {/* Headings */}
        <TBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={{ fontSize: 11, fontWeight: 700 }}>H1</TBtn>
        <TBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={{ fontSize: 11, fontWeight: 700 }}>H2</TBtn>
        <TBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={{ fontSize: 11, fontWeight: 700 }}>H3</TBtn>

        <TSep />

        {/* Lists */}
        <TBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.5" fill="currentColor"/><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="7" r="1.5" fill="currentColor"/><rect x="5" y="6" width="8" height="2" rx="1" fill="currentColor"/><circle cx="2" cy="10.5" r="1.5" fill="currentColor"/><rect x="5" y="9.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
        </TBtn>
        <TBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><text x="0" y="5" fontSize="5" fontWeight="bold" fill="currentColor">1.</text><rect x="5" y="2.5" width="8" height="2" rx="1" fill="currentColor"/><text x="0" y="9" fontSize="5" fontWeight="bold" fill="currentColor">2.</text><rect x="5" y="6" width="8" height="2" rx="1" fill="currentColor"/><text x="0" y="13" fontSize="5" fontWeight="bold" fill="currentColor">3.</text><rect x="5" y="9.5" width="8" height="2" rx="1" fill="currentColor"/></svg>
        </TBtn>
        <TBtn title="Task list" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M2 4l1 1 1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><rect x="7" y="2.5" width="6" height="2" rx="1" fill="currentColor"/><rect x="1" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="7" y="9" width="6" height="2" rx="1" fill="currentColor"/></svg>
        </TBtn>

        <TSep />

        {/* Block */}
        <TBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M1 3h3v3H2a2 2 0 0 0 2 2v2a4 4 0 0 1-3-3.9V3zm6 0h3v3H8a2 2 0 0 0 2 2v2a4 4 0 0 1-3-3.9V3z"/></svg>
        </TBtn>
        <TBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</TBtn>

        <TSep />

        {/* Highlight color picker */}
        <div style={{ position: 'relative' }}>
          <TBtn
            title="Highlight"
            active={editor.isActive('highlight')}
            onClick={() => { setShowHighlights(v => !v); setShowColors(false); }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="7" rx="2" fill="#fef08a" stroke="#94a3b8" strokeWidth="1"/><rect x="1" y="9" width="10" height="2" rx="1" fill="#f59e0b"/></svg>
              <span style={{ fontSize: 8 }}>▾</span>
            </span>
          </TBtn>
          {showHighlights && (
            <ColorPicker
              colors={HIGHLIGHT_COLORS}
              onPick={(c) => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlights(false); }}
              onClear={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlights(false); }}
              onClose={() => setShowHighlights(false)}
            />
          )}
        </div>

        {/* Text color picker */}
        <div style={{ position: 'relative' }}>
          <TBtn
            title="Text color"
            active={editor.isActive('textStyle')}
            onClick={() => { setShowColors(v => !v); setShowHighlights(false); }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: editor.getAttributes('textStyle').color || '#1e293b' }}>A</span>
              <span style={{ fontSize: 8 }}>▾</span>
            </span>
          </TBtn>
          {showColors && (
            <ColorPicker
              colors={TEXT_COLORS}
              onPick={(c) => { editor.chain().focus().setColor(c).run(); setShowColors(false); }}
              onClear={() => { editor.chain().focus().unsetColor().run(); setShowColors(false); }}
              onClose={() => setShowColors(false)}
            />
          )}
        </div>

        <TSep />

        {/* Text align */}
        <TBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="2" rx="1"/><rect x="1" y="6" width="8" height="2" rx="1"/><rect x="1" y="10" width="12" height="2" rx="1"/></svg>
        </TBtn>
        <TBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="2" rx="1"/><rect x="3" y="6" width="8" height="2" rx="1"/><rect x="1" y="10" width="12" height="2" rx="1"/></svg>
        </TBtn>
        <TBtn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="2" width="12" height="2" rx="1"/><rect x="5" y="6" width="8" height="2" rx="1"/><rect x="1" y="10" width="12" height="2" rx="1"/></svg>
        </TBtn>

        <TSep />

        {/* Table */}
        <TBtn title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="12" height="12" rx="1"/><line x1="1" y1="5" x2="13" y2="5"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="5" y1="5" x2="5" y2="13"/><line x1="9" y1="5" x2="9" y2="13"/></svg>
        </TBtn>

        {/* Link */}
        <TBtn title="Link" active={editor.isActive('link')} onClick={setLink}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5.5 8.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L6.5 2.5"/><path d="M8.5 5.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L7.5 11.5"/></svg>
        </TBtn>

        <TSep />

        {/* Print */}
        <TBtn title="Print document" onClick={handlePrint}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5V1h8v4"/><rect x="1" y="5" width="12" height="6" rx="1"/><path d="M3 11v2h8v-2"/><circle cx="11" cy="8" r="1" fill="currentColor" stroke="none"/></svg>
        </TBtn>

        {/* Save status */}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: saveStatus === 'saving' ? '#94a3b8' : '#22c55e', fontWeight: 500, paddingRight: 4 }}>
          {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
        </div>
      </div>

      {/* Editor content */}
      <div
        className="notes-editor-content"
        style={{ flex: 1, overflowY: 'auto', background: '#fff' }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/* ── Toolbar sub-components ─────────────────────────────────────────────── */

function TBtn({ children, active, disabled, onClick, title, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, height: 28, padding: '0 5px', borderRadius: 6,
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: active ? '#e0e7ff' : hovered ? '#f1f5f9' : 'transparent',
        color: active ? '#4338ca' : disabled ? '#cbd5e1' : '#475569',
        fontSize: 13, fontFamily: 'inherit', transition: 'background 0.1s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function TSep() {
  return <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 3px', flexShrink: 0 }} />;
}

function ColorPicker({ colors, onPick, onClear, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      <div style={{
        position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4,
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex', gap: 5, flexWrap: 'wrap', width: 120,
      }}>
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            title={c}
            style={{
              width: 22, height: 22, borderRadius: 5, border: '2px solid rgba(0,0,0,0.1)',
              background: c, cursor: 'pointer', padding: 0,
            }}
          />
        ))}
        <button
          onClick={onClear}
          title="Clear"
          style={{
            width: 22, height: 22, borderRadius: 5, border: '2px solid #e2e8f0',
            background: 'transparent', cursor: 'pointer', fontSize: 10, color: '#94a3b8',
          }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
