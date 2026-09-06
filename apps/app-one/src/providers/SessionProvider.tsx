import { sessionManager } from "@workspace/auth";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";

interface SessionContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restore() {
      const session = await sessionManager.restoreSession();
      if (isMounted) {
        setIsAuthenticated(session !== null);
        setIsLoading(false);
      }
    }
    restore();

    const unsubscribe = sessionManager.onSessionChange((session) => {
      setIsAuthenticated(session !== null);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value: SessionContextValue = {
    isAuthenticated,
    isLoading,
    signOut: async () => sessionManager.clearSession(),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
