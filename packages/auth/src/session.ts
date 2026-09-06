import type { SecureStoreAdapter, Session, SessionListener, SessionManager } from "./types";

// getAccessToken/getRefreshToken read from an in-memory cache (not
// SecureStore directly) so they can be synchronous — @workspace/api's
// per-request auth header injection (Phase 8) needs a sync read. The
// cache is populated by restoreSession() on app start and kept in sync
// by setSession()/clearSession().
//
// Takes its adapter by injection (no default) so this stays unit-testable
// with a mocked SecureStoreAdapter, without ever importing the real
// secureStore.ts/expo-secure-store — see index.ts for the wired-up
// singleton used by the app.
export function createSessionManager(adapter: SecureStoreAdapter): SessionManager {
  let current: Session | null = null;
  const listeners = new Set<SessionListener>();

  function notify() {
    for (const listener of listeners) {
      listener(current);
    }
  }

  return {
    getAccessToken() {
      return current?.accessToken ?? null;
    },
    getRefreshToken() {
      return current?.refreshToken ?? null;
    },
    async setSession(session) {
      await adapter.setTokens(session.accessToken, session.refreshToken);
      current = session;
      notify();
    },
    async clearSession() {
      await adapter.clearTokens();
      current = null;
      notify();
    },
    async restoreSession() {
      const [accessToken, refreshToken] = await Promise.all([
        adapter.getAccessToken(),
        adapter.getRefreshToken(),
      ]);
      current = accessToken && refreshToken ? { accessToken, refreshToken } : null;
      notify();
      return current;
    },
    onSessionChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
