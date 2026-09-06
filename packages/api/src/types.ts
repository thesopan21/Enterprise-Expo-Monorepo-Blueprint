import type { Session, TokenProvider } from "@workspace/auth";

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  tokenProvider: TokenProvider;
  refreshAccessToken: (refreshToken: string) => Promise<Session>;
  onSessionExpired?: () => void;
}
