import MockAdapter from 'axios-mock-adapter';

import { createApiClient } from './client';
import type { ApiClientConfig } from './types';

function createMockTokenProvider(initialAccessToken: string | null = 'expired-token') {
  let accessToken = initialAccessToken;
  let refreshToken: string | null = 'refresh-token';
  return {
    getAccessToken: jest.fn(() => accessToken),
    getRefreshToken: jest.fn(() => refreshToken),
    setSession: jest.fn(async (session: { accessToken: string; refreshToken: string }) => {
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
    }),
    clearSession: jest.fn(async () => {
      accessToken = null;
      refreshToken = null;
    }),
  };
}

function createClient(overrides: Partial<ApiClientConfig> & { tokenProvider: ApiClientConfig['tokenProvider'] }) {
  const client = createApiClient({
    baseURL: 'https://api.example.com',
    refreshAccessToken: jest.fn(),
    ...overrides,
  });
  return { client, mock: new MockAdapter(client) };
}

describe('createApiClient — auth header injection', () => {
  it('attaches the Authorization header when an access token is available', async () => {
    const tokenProvider = createMockTokenProvider('valid-token');
    const { client, mock } = createClient({ tokenProvider });
    mock.onGet('/me').reply(200, { ok: true });

    await client.get('/me');

    expect(mock.history.get[0]?.headers?.Authorization).toBe('Bearer valid-token');
  });

  it('omits the Authorization header when there is no access token', async () => {
    const tokenProvider = createMockTokenProvider(null);
    const { client, mock } = createClient({ tokenProvider });
    mock.onGet('/me').reply(200, { ok: true });

    await client.get('/me');

    expect(mock.history.get[0]?.headers?.Authorization).toBeUndefined();
  });
});

describe('createApiClient — refresh handling', () => {
  it('retries a single 401 request after a successful refresh', async () => {
    const tokenProvider = createMockTokenProvider();
    const refreshAccessToken = jest.fn(async () => ({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
    }));
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken });
    mock.onGet('/me').replyOnce(401).onGet('/me').reply(200, { id: 'u1' });

    const response = await client.get('/me');

    expect(response.data).toEqual({ id: 'u1' });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(refreshAccessToken).toHaveBeenCalledWith('refresh-token');
    expect(tokenProvider.setSession).toHaveBeenCalledWith({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
    });
    expect(mock.history.get[1]?.headers?.Authorization).toBe('Bearer new-token');
  });

  it('triggers exactly one refresh call for N concurrent 401s', async () => {
    const tokenProvider = createMockTokenProvider();
    const refreshAccessToken = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { accessToken: 'new-token', refreshToken: 'new-refresh' };
    });
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken });
    mock.onGet('/a').replyOnce(401).onGet('/a').reply(200, { id: 'a' });
    mock.onGet('/b').replyOnce(401).onGet('/b').reply(200, { id: 'b' });
    mock.onGet('/c').replyOnce(401).onGet('/c').reply(200, { id: 'c' });

    const [a, b, c] = await Promise.all([client.get('/a'), client.get('/b'), client.get('/c')]);

    expect(a.data).toEqual({ id: 'a' });
    expect(b.data).toEqual({ id: 'b' });
    expect(c.data).toEqual({ id: 'c' });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('clears the session and surfaces SESSION_EXPIRED when refresh fails', async () => {
    const tokenProvider = createMockTokenProvider();
    const onSessionExpired = jest.fn();
    const refreshAccessToken = jest.fn(async () => {
      throw new Error('refresh token rejected by server');
    });
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken, onSessionExpired });
    mock.onGet('/me').reply(401);

    await expect(client.get('/me')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(tokenProvider.clearSession).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('does not treat a post-refresh retry failure as session expiry', async () => {
    const tokenProvider = createMockTokenProvider();
    const refreshAccessToken = jest.fn(async () => ({
      accessToken: 'new-token',
      refreshToken: 'new-refresh',
    }));
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken });
    mock.onGet('/me').replyOnce(401).onGet('/me').reply(500);

    await expect(client.get('/me')).rejects.toMatchObject({ code: 'SERVER' });

    expect(tokenProvider.clearSession).not.toHaveBeenCalled();
  });

  it('does not loop or re-refresh when the retried request also returns 401', async () => {
    const tokenProvider = createMockTokenProvider();
    const refreshAccessToken = jest.fn(async () => ({
      accessToken: 'still-bad',
      refreshToken: 'still-bad-refresh',
    }));
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken });
    mock.onGet('/me').reply(401);

    await expect(client.get('/me')).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mock.history.get).toHaveLength(2);
  });

  it('surfaces SESSION_EXPIRED when there is no refresh token to use', async () => {
    const tokenProvider = createMockTokenProvider();
    tokenProvider.getRefreshToken.mockReturnValue(null);
    const refreshAccessToken = jest.fn();
    const { client, mock } = createClient({ tokenProvider, refreshAccessToken });
    mock.onGet('/me').reply(401);

    await expect(client.get('/me')).rejects.toMatchObject({ code: 'SESSION_EXPIRED' });

    expect(refreshAccessToken).not.toHaveBeenCalled();
    expect(tokenProvider.clearSession).toHaveBeenCalledTimes(1);
  });
});
