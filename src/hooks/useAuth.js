import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages auth session. Returns:
 *   { userId, ready, session }
 *
 * Magic link flow is handled by AuthGate — this hook just tracks session state.
 * Supabase JS automatically detects the #access_token hash from the magic link
 * redirect and exchanges it for a session via onAuthStateChange.
 */
export function useAuth() {
  const [userId, setUserId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUserId(session?.user?.id ?? null);
        setReady(true);
      }
    });

    // Listen for sign-in (including magic link callback) and sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserId(session?.user?.id ?? null);
        if (!ready) setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line

  return { userId, ready };
}

/**
 * Send a magic link to the given email address.
 * Returns { error } — null error means the email was sent.
 */
export async function sendMagicLink(email) {
  const redirectTo = window.location.origin + '/specialedscreen';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  return { error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  await supabase.auth.signOut();
}
