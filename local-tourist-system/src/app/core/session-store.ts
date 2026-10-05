/**
 * Thin wrapper over sessionStorage. Data lives only for the current browser tab session,
 * which is what the SRS requires for the one-day plan (tourists have no account).
 * Every call is guarded because storage can be unavailable (private mode, server rendering).
 */
export function readSession<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: unknown): void {
  try {
    if (value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage unavailable: the app keeps working from in-memory state.
  }
}
