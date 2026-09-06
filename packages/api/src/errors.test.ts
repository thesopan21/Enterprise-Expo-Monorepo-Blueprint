import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { ApiError, normalizeError } from './errors';

async function captureAxiosError(setup: (mock: MockAdapter) => void): Promise<unknown> {
  const instance = axios.create();
  const mock = new MockAdapter(instance);
  setup(mock);
  try {
    await instance.get('/x');
    throw new Error('expected the request to reject');
  } catch (error) {
    return error;
  }
}

describe('normalizeError', () => {
  it('returns an already-normalized ApiError unchanged', () => {
    const original = new ApiError('SESSION_EXPIRED', 'Session expired');

    expect(normalizeError(original)).toBe(original);
  });

  it('maps a request timeout to TIMEOUT', async () => {
    const error = await captureAxiosError((mock) => mock.onGet('/x').timeout());

    expect(normalizeError(error)).toMatchObject({ code: 'TIMEOUT' });
  });

  it('maps a connection-level network error (no response) to NETWORK', async () => {
    const error = await captureAxiosError((mock) => mock.onGet('/x').networkError());

    expect(normalizeError(error)).toMatchObject({ code: 'NETWORK' });
  });

  it.each([
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [422, 'VALIDATION'],
    [429, 'RATE_LIMITED'],
    [500, 'SERVER'],
    [503, 'SERVER'],
    [418, 'UNKNOWN'],
  ] as const)('maps HTTP %d to %s', async (status, code) => {
    const error = await captureAxiosError((mock) => mock.onGet('/x').reply(status));

    expect(normalizeError(error)).toMatchObject({ code, status });
  });

  it('maps a plain Error to UNKNOWN, preserving its message', () => {
    expect(normalizeError(new Error('boom'))).toMatchObject({ code: 'UNKNOWN', message: 'boom' });
  });

  it('maps a non-Error thrown value to UNKNOWN', () => {
    expect(normalizeError('boom')).toMatchObject({ code: 'UNKNOWN' });
  });
});
