import { decodeJwt, isJwtExpired } from './jwt';

function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('decodeJwt', () => {
  it('decodes a well-formed token', () => {
    const token = makeToken({ sub: 'user-1', exp: 9999999999 });

    expect(decodeJwt(token)).toMatchObject({ sub: 'user-1', exp: 9999999999 });
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeJwt('')).toBeNull();
  });
});

describe('isJwtExpired', () => {
  it('returns false for a token with a future exp claim', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });

    expect(isJwtExpired(token)).toBe(false);
  });

  it('returns true for a token with a past exp claim', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });

    expect(isJwtExpired(token)).toBe(true);
  });

  it('returns true for a malformed token', () => {
    expect(isJwtExpired('not-a-jwt')).toBe(true);
  });

  it('returns true for a token with no exp claim (fail closed)', () => {
    const token = makeToken({ sub: 'user-1' });

    expect(isJwtExpired(token)).toBe(true);
  });

  it('honors a clock-skew tolerance', () => {
    const token = makeToken({ exp: Math.floor(Date.now() / 1000) - 5 });

    expect(isJwtExpired(token, 10)).toBe(false);
  });
});
