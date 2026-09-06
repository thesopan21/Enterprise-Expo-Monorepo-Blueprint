// TEMPORARY placeholder — in-memory only, no persistence, no token refresh.
// Superseded by @workspace/auth (Phase 7) and @workspace/api (Phase 8); do not extend this file.
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type Session = {
  userId: string;
};

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signIn: (newSession) => setSession(newSession),
      signOut: () => setSession(null),
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
