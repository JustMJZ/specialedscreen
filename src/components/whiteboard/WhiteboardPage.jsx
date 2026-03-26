import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Excalidraw, MainMenu, WelcomeScreen, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'specialedscreen_whiteboard_v1';
const SAVE_DELAY_MS = 1500;

function loadLocalData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return { elements: parsed.elements || [], appState: parsed.appState || {}, files: parsed.files || {}, scrollToContent: false };
  } catch {
    return null;
  }
}

async function fetchCloudWhiteboard(userId) {
  const { data, error } = await supabase
    .from('whiteboard_state')
    .select('data')
    .eq('user_id', userId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data?.data ?? null;
}

async function saveCloudWhiteboard(userId, jsonData) {
  await supabase.from('whiteboard_state').upsert({
    user_id: userId,
    data: jsonData,
    updated_at: new Date().toISOString(),
  });
}

export default function WhiteboardPage() {
  const { userId } = useAuth();
  const [initialData, setInitialData] = useState(loadLocalData);
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const excalidrawApiRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Load cloud state once userId is ready
  useEffect(() => {
    if (!userId || cloudLoaded) return;
    setCloudLoaded(true);
    fetchCloudWhiteboard(userId).then((saved) => {
      if (!saved) return;
      // Apply cloud state to the canvas if it's already mounted
      if (excalidrawApiRef.current) {
        excalidrawApiRef.current.updateScene({
          elements: saved.elements || [],
          appState: saved.appState || {},
        });
        if (saved.files) excalidrawApiRef.current.addFiles(Object.values(saved.files));
      } else {
        // Canvas not mounted yet — set as initial data
        setInitialData({
          elements: saved.elements || [],
          appState: saved.appState || {},
          files: saved.files || {},
          scrollToContent: false,
        });
      }
    }).catch((err) => console.warn('Whiteboard cloud load failed:', err.message));
  }, [userId, cloudLoaded]);

  const handleChange = useCallback((elements, appState, files) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const json = serializeAsJSON(elements, appState, files, 'database');
        localStorage.setItem(STORAGE_KEY, json);
        if (userId) {
          saveCloudWhiteboard(userId, JSON.parse(json)).catch((err) =>
            console.warn('Whiteboard cloud save failed:', err.message)
          );
        }
      } catch {
        // ignore
      }
    }, SAVE_DELAY_MS);
  }, [userId]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Excalidraw
        initialData={initialData}
        onChange={handleChange}
        excalidrawAPI={(api) => { excalidrawApiRef.current = api; }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>

        <WelcomeScreen>
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Heading>
              Classroom Whiteboard
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>

      <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(15,23,42,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e2e8f0', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
