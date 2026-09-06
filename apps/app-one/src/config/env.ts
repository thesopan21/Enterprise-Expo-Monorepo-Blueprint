// Minimal placeholder — the full per-environment strategy (staging/prod
// config, secrets handling) is Phase 24's responsibility, not this one.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com';
