const COOKIE_NAME = "studymouse_favs";
const COOKIE_MAX_AGE_DAYS = 365;

/**
 * Get favorited paper IDs from Cookie (with localStorage fallback).
 */
export function getFavoritePaperIds(): string[] {
  if (typeof document === "undefined") return [];
  
  // 1. Read from Cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn("[FavoritesService] Failed to parse cookie, checking localStorage", e);
    }
  }

  // 2. Fallback to localStorage
  try {
    const raw = localStorage.getItem(COOKIE_NAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Re-write cookie from localStorage
        saveFavoritePaperIds(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[FavoritesService] Failed to read localStorage", e);
  }

  return [];
}

/**
 * Persist favorited paper IDs to Cookie and localStorage.
 */
export function saveFavoritePaperIds(ids: string[]): void {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(ids));
  const expires = new Date(Date.now() + COOKIE_MAX_AGE_DAYS * 864e5).toUTCString();
  
  // Write cookie with 1 year expiration
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`;

  // Dual-sync to localStorage
  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(ids));
  } catch (e) {
    console.warn("[FavoritesService] Failed to sync to localStorage", e);
  }
}

/**
 * Toggle a paper in/out of favorites.
 */
export function toggleFavoritePaperId(id: string): { isFavorite: boolean; newFavorites: string[] } {
  const current = getFavoritePaperIds();
  const exists = current.includes(id);
  const newFavorites = exists ? current.filter(item => item !== id) : [id, ...current];
  
  saveFavoritePaperIds(newFavorites);
  return { isFavorite: !exists, newFavorites };
}
