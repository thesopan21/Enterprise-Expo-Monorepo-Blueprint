import { createSessionManager } from './session';
import type { SecureStoreAdapter, Session } from './types';

function createMockAdapter(initial: Session | null = null): SecureStoreAdapter {
  let stored = initial;
  return {
    getAccessToken: jest.fn(async () => stored?.accessToken ?? null),
    getRefreshToken: jest.fn(async () => stored?.refreshToken ?? null),
    setTokens: jest.fn(async (accessToken: string, refreshToken: string) => {
      stored = { accessToken, refreshToken };
    }),
    clearTokens: jest.fn(async () => {
      stored = null;
    }),
  };
}

describe('createSessionManager', () => {
  it('has no session before restoreSession is called', () => {
    const manager = createSessionManager(createMockAdapter());

    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();
  });

  it('restores a persisted session into the in-memory cache', async () => {
    const adapter = createMockAdapter({ accessToken: 'a1', refreshToken: 'r1' });
    const manager = createSessionManager(adapter);

    const restored = await manager.restoreSession();

    expect(restored).toEqual({ accessToken: 'a1', refreshToken: 'r1' });
    expect(manager.getAccessToken()).toBe('a1');
    expect(manager.getRefreshToken()).toBe('r1');
  });

  it('restoreSession returns null when nothing was persisted', async () => {
    const manager = createSessionManager(createMockAdapter());

    expect(await manager.restoreSession()).toBeNull();
  });

  it('setSession persists tokens and updates the in-memory cache', async () => {
    const adapter = createMockAdapter();
    const manager = createSessionManager(adapter);

    await manager.setSession({ accessToken: 'a1', refreshToken: 'r1' });

    expect(adapter.setTokens).toHaveBeenCalledWith('a1', 'r1');
    expect(manager.getAccessToken()).toBe('a1');
    expect(manager.getRefreshToken()).toBe('r1');
  });

  it('clearSession clears persisted tokens and the in-memory cache', async () => {
    const adapter = createMockAdapter({ accessToken: 'a1', refreshToken: 'r1' });
    const manager = createSessionManager(adapter);
    await manager.restoreSession();

    await manager.clearSession();

    expect(adapter.clearTokens).toHaveBeenCalledTimes(1);
    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getRefreshToken()).toBeNull();
  });

  it('notifies onSessionChange listeners on setSession and clearSession', async () => {
    const manager = createSessionManager(createMockAdapter());
    const listener = jest.fn();
    manager.onSessionChange(listener);

    await manager.setSession({ accessToken: 'a1', refreshToken: 'r1' });
    await manager.clearSession();

    expect(listener).toHaveBeenNthCalledWith(1, { accessToken: 'a1', refreshToken: 'r1' });
    expect(listener).toHaveBeenNthCalledWith(2, null);
  });

  it('stops notifying a listener after it unsubscribes', async () => {
    const manager = createSessionManager(createMockAdapter());
    const listener = jest.fn();
    const unsubscribe = manager.onSessionChange(listener);

    unsubscribe();
    await manager.setSession({ accessToken: 'a1', refreshToken: 'r1' });

    expect(listener).not.toHaveBeenCalled();
  });
});
