const STATE_KEY = 'bayan-sulu-kids:state';
const SCREEN_KEY = 'bayan-sulu-kids:screen';
const REWARD_REQUESTS_KEY = 'bayan-sulu-kids:rewardRequests';
const APPROVED_COUPONS_KEY = 'bayan-sulu-kids:approvedCoupons';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback;
    }

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? { ...fallback, ...parsed }
      : fallback;
  } catch {
    return fallback;
  }
}

function readString(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

function writeString(key, value) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, value);
}

export function loadAppState(fallback) {
  return readJson(STATE_KEY, fallback);
}

export function saveAppState(state) {
  writeJson(STATE_KEY, state);
}

export function loadScreen(fallback) {
  return readString(SCREEN_KEY, fallback);
}

export function saveScreen(screen) {
  writeString(SCREEN_KEY, screen);
}

export function loadRewardRequests(fallback = []) {
  return readJson(REWARD_REQUESTS_KEY, fallback);
}

export function saveRewardRequests(requests) {
  writeJson(REWARD_REQUESTS_KEY, requests);
}

export function loadApprovedCoupons(fallback = []) {
  return readJson(APPROVED_COUPONS_KEY, fallback);
}

export function saveApprovedCoupons(coupons) {
  writeJson(APPROVED_COUPONS_KEY, coupons);
}
