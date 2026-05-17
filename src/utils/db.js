import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vlcukhheamegpitpxqiz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsY3VraGhlYW1lZ3BpdHB4cWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwODIxNzcsImV4cCI6MjA5MjY1ODE3N30.C0aZoNGkCETJ_gimOzPz1YfhYGpGdhzjQrV_d7ZJAfc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Session ID ────────────────────────────────────────────────────────────────
function getOrCreateSessionId() {
  const key = 'bs_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const SESSION_ID = getOrCreateSessionId();

// ── Upsert full app state snapshot ───────────────────────────────────────────
export async function syncSession(appState) {
  try {
    await supabase.from('bs_sessions').upsert({
      session_id: SESSION_ID,
      user_name: appState.name || null,
      user_age: appState.age || null,
      lang: localStorage.getItem('bs_lang') || 'ru',
      coins: appState.coins || 0,
      completed_games: appState.completedGames || [],
      unlocked_locations: appState.unlockedLocations || [],
      unlocked_collectibles: appState.unlockedCollectibles || [],
      screen_time_minutes: appState.screenTimeMinutes || 0,
      reward_requests_count: (appState.rewardRequests || []).length,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });
  } catch (e) {
    // Silent fail — never block the UI
  }
}

// ── Track individual event ────────────────────────────────────────────────────
export async function trackEvent(eventType, payload = {}) {
  try {
    await supabase.from('bs_events').insert({
      session_id: SESSION_ID,
      event_type: eventType,
      game_id: payload.gameId || null,
      coins_earned: payload.coinsEarned || 0,
      metadata: payload,
    });
  } catch (e) {
    // Silent fail
  }
}

// ── Fetch all data for dev dashboard ─────────────────────────────────────────
export async function fetchAllSessions() {
  const { data, error } = await supabase
    .from('bs_sessions')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAllEvents() {
  const { data, error } = await supabase
    .from('bs_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}

export async function fetchEventStats() {
  const { data, error } = await supabase
    .from('bs_events')
    .select('event_type, game_id, coins_earned, created_at');
  if (error) throw error;
  return data || [];
}
