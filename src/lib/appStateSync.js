import { supabase } from './supabase';

export async function fetchCloudAppState(userId) {
  const { data, error } = await supabase
    .from('app_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No row yet — first time
    throw error;
  }
  return data;
}

export async function saveCloudAppState(userId, stateData) {
  const { error } = await supabase.from('app_state').upsert({
    user_id: userId,
    data: stateData,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
