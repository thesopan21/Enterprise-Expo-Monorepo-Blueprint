import { jwtDecode } from "jwt-decode";

// Decode-only — this never verifies a token's signature. The server is
// the source of truth for validity; this is for reading claims client-side
// (e.g. to pre-emptively refresh before a known expiry) only.
export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [claim: string]: unknown;
}

export function decodeJwt<T extends JwtPayload = JwtPayload>(token: string): T | null {
  try {
    return jwtDecode<T>(token);
  } catch {
    return null;
  }
}

// A malformed token, or one with no `exp` claim at all, is treated as
// expired (fail closed) rather than assumed to never expire.
export function isJwtExpired(token: string, clockSkewSeconds = 0): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) {
    return true;
  }
  const nowSeconds = Date.now() / 1000;
  return payload.exp <= nowSeconds - clockSkewSeconds;
}
