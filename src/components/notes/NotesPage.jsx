import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotesEditor from './NotesEditor';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const C = {
  coral:     '#FB7F6E',
  coralLight:'#FFF1EF',
  teal:      '#14B8A6',
  cream:     '#FFFBF7',
  border:    '#FDE8E4',
  text:      '#334155',
  muted:     '#94a3b8',
};

function createDoc(title) {
  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    content: null,
    updatedAt: new Date().toISOString(),
  };
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ── Supabase helpers ─────────────────────────────────────────────────────── */

async function fetchDocs(userId) {
  const { data, error } = await supabase
    .from('notes_docs')
    .select('id, title, content, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    updatedAt: r.updated_at,
  }));
}

async function upsertDoc(userId, doc) {
  const { error } = await supabase.from('notes_docs').upsert({
    id: doc.id,
    user_id: userId,
    title: doc.title,
    content: doc.content ?? null,
    updated_at: doc.updatedAt,
  });
  if (error) throw error;
}

async function deleteDoc(id) {
  const { error } = await supabase.from('notes_docs').delete().eq('id', id);
  if (error) throw error;
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function NotesPage() {
  const { userId, ready } = useAuth();
  const [docs, setDocs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  // Load docs once auth is ready
  useEffect(() => {
    if (!ready || initialised.current) return;
    initialised.current = true;

    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        let loaded = await fetchDocs(userId);

        if (loaded.length === 0) {
          const defaults = [
            createDoc('Sub Plans'),
            createDoc('Teacher Notes'),
            createDoc('IEP Notes'),
          ];
          await Promise.all(defaults.map((d) => upsertDoc(userId, d)));
          loaded = defaults;
        }

        setDocs(loaded);
        setActiveId(loaded[0]?.id ?? null);
      } catch (err) {
        console.error('Failed to load notes:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, userId]);

  const handleSave = useCallback((id, content) => {
    const updatedAt = new Date().toISOString();
    setDocs((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, content, updatedAt } : d
      );
      const updated = next.find((d) => d.id === id);
      if (updated && userId) upsertDoc(userId, updated).catch(console.error);
      return next;
    });
  }, [userId]);

  const handleNewDoc = async () => {
    const doc = createDoc('Untitled');
    setDocs((prev) => [doc, ...prev]);
    setActiveId(doc.id);
    setRenamingId(doc.id);
    setRenameValue('Untitled');
    if (userId) upsertDoc(userId, doc).catch(console.error);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    setDocs((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
    deleteDoc(id).catch(console.error);
  };

  const finishRename = useCallback(() => {
    if (!renamingId) return;
    const title = renameValue.trim() || 'Untitled';
    const updatedAt = new Date().toISOString();
    setDocs((prev) => {
      const next = prev.map((d) =>
        d.id === renamingId ? { ...d, title, updatedAt } : d
      );
      const updated = next.find((d) => d.id === renamingId);
      if (updated && userId) upsertDoc(userId, updated).catch(console.error);
      return next;
    });
    setRenamingId(null);
  }, [renamingId, renameValue, userId]);

  const handleTitleRename = useCallback((docId, title) => {
    const updatedAt = new Date().toISOString();
    setDocs((prev) => {
      const next = prev.map((d) =>
        d.id === docId ? { ...d, title, updatedAt } : d
      );
      const updated = next.find((d) => d.id === docId);
      if (updated && userId) upsertDoc(userId, updated).catch(console.error);
      return next;
    });
  }, [userId]);

  const activeDoc = docs.find((d) => d.id === activeId) ?? null;

  if (!ready || loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: C.cream, color: C.muted, fontSize: 14,
      }}>
        Loading notes…
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: C.cream }}>

      {/* ── Sidebar ── */}
      <div
        className="notes-no-print"
        style={{
          width: 230,
          flexShrink: 0,
          background: '#fff',
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '0 0 0',
          background: `linear-gradient(135deg, ${C.coral} 0%, #f97316 100%)`,
          flexShrink: 0,
        }}>
          <div style={{ padding: '18px 14px 14px' }}>
            <div style={{
              fontSize: 14, fontWeight: 800, color: '#fff',
              letterSpacing: '0.02em', marginBottom: 10,
            }}>
              Documents
            </div>
            <button
              onClick={handleNewDoc}
              style={{
                width: '100%', padding: '7px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              + New Document
            </button>
          </div>
        </div>

        {/* Document list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {docs.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeId}
              isRenaming={renamingId === doc.id}
              renameValue={renameValue}
              onSelect={() => setActiveId(doc.id)}
              onDoubleClick={() => { setRenamingId(doc.id); setRenameValue(doc.title); }}
              onRenameChange={(e) => setRenameValue(e.target.value)}
              onRenameBlur={finishRename}
              onRenameKeyDown={(e) => {
                if (e.key === 'Enter') finishRename();
                if (e.key === 'Escape') setRenamingId(null);
              }}
              onDelete={() => handleDelete(doc.id)}
            />
          ))}
          {docs.length === 0 && (
            <div style={{ padding: '24px 10px', fontSize: 12, color: C.muted, textAlign: 'center' }}>
              No documents yet
            </div>
          )}
        </div>

        {/* Back to dashboard */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 8,
              color: C.muted, fontSize: 12, fontWeight: 500,
              textDecoration: 'none', transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = C.coralLight}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Editor area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#fff' }}>
        {activeDoc ? (
          <>
            <div
              className="notes-no-print"
              style={{
                padding: '10px 56px 0',
                background: '#fff',
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            >
              <DocTitleInput
                doc={activeDoc}
                onRename={(title) => handleTitleRename(activeDoc.id, title)}
              />
            </div>
            <NotesEditor
              key={activeDoc.id}
              doc={activeDoc}
              onSave={(content) => handleSave(activeDoc.id, content)}
            />
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.muted, flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontSize: 32 }}>📄</div>
            <div style={{ fontSize: 14 }}>Select or create a document</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Document title (editable inline in the main area) ──────────────────── */

function DocTitleInput({ doc, onRename }) {
  const [value, setValue] = useState(doc.title);

  useEffect(() => { setValue(doc.title); }, [doc.id, doc.title]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => { const t = value.trim() || 'Untitled'; onRename(t); setValue(t); }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      style={{
        width: '100%', border: 'none', outline: 'none',
        fontSize: 22, fontWeight: 700, fontFamily: 'Georgia, serif',
        color: C.text, background: 'transparent',
        padding: '10px 0', lineHeight: 1.3,
      }}
      placeholder="Untitled"
    />
  );
}

/* ── Sidebar document row ───────────────────────────────────────────────── */

function DocRow({ doc, isActive, isRenaming, renameValue, onSelect, onDoubleClick, onRenameChange, onRenameBlur, onRenameKeyDown, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer',
        background: isActive ? C.coralLight : hovered ? '#fafafa' : 'transparent',
        border: `1px solid ${isActive ? C.border : 'transparent'}`,
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6 }}>📄</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {isRenaming ? (
          <input
            value={renameValue}
            onChange={onRenameChange}
            onBlur={onRenameBlur}
            onKeyDown={onRenameKeyDown}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', background: C.coralLight,
              border: `1px solid ${C.coral}`, borderRadius: 4,
              color: C.text, fontSize: 12, padding: '1px 4px', outline: 'none',
            }}
          />
        ) : (
          <>
            <div style={{
              fontSize: 12, fontWeight: isActive ? 700 : 400,
              color: isActive ? C.coral : C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {doc.title}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
              {formatDate(doc.updatedAt)}
            </div>
          </>
        )}
      </div>

      {hovered && !isRenaming && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(239,68,68,0.55)', fontSize: 11,
            padding: '0 2px', lineHeight: 1, flexShrink: 0,
          }}
          title="Delete"
        >
          ✕
        </button>
      )}
    </div>
  );
}
