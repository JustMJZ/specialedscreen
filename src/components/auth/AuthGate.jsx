import React, { useState } from 'react';
import { useAuth, sendMagicLink } from '../../hooks/useAuth';

export default function AuthGate({ children }) {
  const { userId, ready } = useAuth();

  if (!ready) return <Splash text="Loading…" />;
  if (!userId) return <LoginScreen />;
  return children;
}

/* ── Full-page loading splash ─────────────────────────────────────────────── */

function Splash({ text }) {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', color: 'rgba(148,163,184,0.5)', fontSize: 14,
    }}>
      {text}
    </div>
  );
}

/* ── Login screen ─────────────────────────────────────────────────────────── */

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('sending');
    const { error } = await sendMagicLink(trimmed);
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        padding: '40px 36px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo / title */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            SpecialEdScreen
          </div>
          <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)' }}>
            Classroom management for special education
          </div>
        </div>

        {status === 'sent' ? (
          <SentState email={email} onBack={() => setStatus('idle')} />
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: 'rgba(148,163,184,0.7)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
              autoFocus
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, outline: 'none',
                color: '#e2e8f0', fontSize: 14,
                boxSizing: 'border-box',
                marginBottom: 16,
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />

            {status === 'error' && (
              <div style={{
                fontSize: 12, color: '#f87171',
                marginBottom: 12, padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
              }}>
                {errorMsg || 'Something went wrong. Try again.'}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%', padding: '12px',
                background: status === 'sending'
                  ? 'rgba(99,102,241,0.5)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Send login link'}
            </button>

            <div style={{
              marginTop: 20, fontSize: 12,
              color: 'rgba(148,163,184,0.4)', textAlign: 'center', lineHeight: 1.6,
            }}>
              No password needed. We'll email you a link that signs you in instantly.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SentState({ email, onBack }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
        Check your inbox
      </div>
      <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', lineHeight: 1.7, marginBottom: 24 }}>
        We sent a login link to<br />
        <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{email}</span><br />
        Click it to sign in. You can close this tab.
      </div>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(148,163,184,0.5)', fontSize: 12,
          cursor: 'pointer', textDecoration: 'underline',
        }}
      >
        Use a different email
      </button>
    </div>
  );
}
