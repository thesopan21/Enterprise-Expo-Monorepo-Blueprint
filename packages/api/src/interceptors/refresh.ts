import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { ApiError, normalizeError } from '../errors';
import type { ApiClientConfig } from '../types';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Single-flight refresh: every 401 that arrives while a refresh is already
// in progress awaits the SAME promise instead of triggering its own
// refresh call. `refreshPromise` is checked-and-set synchronously (no
// `await` between the check and the assignment), so there is no race
// window where two concurrent 401s could both see it as unset.
export function attachRefreshInterceptor(instance: AxiosInstance, config: ApiClientConfig): void {
  let refreshPromise: Promise<string> | null = null;

  async function refreshAccessToken(): Promise<string> {
    const refreshToken = config.tokenProvider.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available to refresh the session.');
    }
    const session = await config.refreshAccessToken(refreshToken);
    await config.tokenProvider.setSession(session);
    return session.accessToken;
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      const shouldAttemptRefresh =
        error.response?.status === 401 && originalRequest !== undefined && !originalRequest._retry;

      if (!shouldAttemptRefresh) {
        return Promise.reject(normalizeError(error));
      }

      originalRequest._retry = true;

      // Refresh failing means the session itself is no longer valid —
      // clear it and surface SESSION_EXPIRED, distinct from whatever
      // happens next when we retry the original request.
      let accessToken: string;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        accessToken = await refreshPromise;
      } catch (refreshError) {
        await config.tokenProvider.clearSession();
        config.onSessionExpired?.();
        return Promise.reject(
          new ApiError('SESSION_EXPIRED', 'Your session has expired. Please sign in again.', {
            cause: refreshError,
          }),
        );
      }

      // The refresh succeeded — retry the original request with the new
      // token. If THIS fails, it's an unrelated error (e.g. a 500, or a
      // fresh 401 that `_retry` now prevents from looping), not a
      // session-expiry, so normalize it as whatever it actually is.
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      try {
        return await instance(originalRequest);
      } catch (retryError) {
        return Promise.reject(normalizeError(retryError));
      }
    },
  );
}
