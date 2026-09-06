import type { Session } from "@workspace/auth";

// No real backend exists yet — this simulates one against a single fixed
// account so the sign-in -> protected route -> sign-out loop can be
// proven end-to-end (see docs/02_phased_implementation_plan.md Phase 10's
// documented "Known risks"). Replace with real HTTP calls through
// @workspace/api's client once a backend is available.
const FAKE_ACCOUNT = { email: "demo@example.com", password: "password123" };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createFakeSession(): Session {
  return {
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  };
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export async function signIn(credentials: SignInCredentials): Promise<Session> {
  await delay(400);
  if (credentials.email !== FAKE_ACCOUNT.email || credentials.password !== FAKE_ACCOUNT.password) {
    throw new Error("Invalid email or password.");
  }
  return createFakeSession();
}

export async function refreshAccessToken(refreshToken: string): Promise<Session> {
  await delay(200);
  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }
  return createFakeSession();
}
