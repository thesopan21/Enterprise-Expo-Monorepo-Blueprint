export interface Session {
  accessToken: string;
  refreshToken: string;
}

export type SessionListener = (session: Session | null) => void;

// Adapter boundary so session.ts is unit-testable without a real
// SecureStore-backed native module (see secureStore.ts and its tests).
export interface SecureStoreAdapter {
  getAccessToken(): string | null | Promise<string | null>;
  getRefreshToken(): string | null | Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}

// Consumed by @workspace/api (Phase 8) via dependency injection — api
// depends on this interface only, never imports @workspace/auth's
// implementation, so there is no auth <-> api import cycle.
export interface TokenProvider {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setSession(session: Session): Promise<void>;
  clearSession(): Promise<void>;
}

export interface SessionManager extends TokenProvider {
  restoreSession(): Session | null | Promise<Session | null>;
  onSessionChange(listener: SessionListener): () => void;
}
