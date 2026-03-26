import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import NotesEditor from './NotesEditor';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

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
      // Auth failed — fall back to empty state
      setLoading(false);
      return;
    }

    (async () => {
      try {
        let loaded = await fetchDocs(userId);

        if (loaded.length === 0) {
          // First time — seed defaults
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
        background: '#0f172a', color: 'rgba(148,163,184,0.6)', fontSize: 14,
      }}>
        Loading notes…
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <div
        className="notes-no-print"
        style={{
          width: 230,
          flexShrink: 0,
          background: 'rgba(15,23,42,0.98)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(148,163,184,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>
            Documents
          </div>
          <button
            onClick={handleNewDoc}
            style={{
              width: '100%', padding: '7px 12px', borderRadius: 8,
              background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + New Document
          </button>
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
            <div style={{ padding: '24px 10px', fontSize: 12, color: 'rgba(148,163,184,0.4)', textAlign: 'center' }}>
              No documents yet
            </div>
          )}
        </div>

        {/* Back to dashboard */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 8,
              color: 'rgba(148,163,184,0.55)', fontSize: 12, fontWeight: 500,
              textDecoration: 'none', transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
                borderBottom: '1px solid #f1f5f9',
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
            color: '#94a3b8', flexDirection: 'column', gap: 8,
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
        color: '#0f172a', background: 'transparent',
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
        background: isActive ? 'rgba(99,102,241,0.2)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.5 }}>📄</span>

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
              width: '100%', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(99,102,241,0.5)', borderRadius: 4,
              color: '#e2e8f0', fontSize: 12, padding: '1px 4px', outline: 'none',
            }}
          />
        ) : (
          <>
            <div style={{
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#a5b4fc' : '#cbd5e1',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {doc.title}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', marginTop: 1 }}>
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
