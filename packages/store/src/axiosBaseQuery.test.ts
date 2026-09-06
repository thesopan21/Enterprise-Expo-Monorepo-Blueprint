import type { BaseQueryApi } from '@reduxjs/toolkit/query';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { axiosBaseQuery } from './axiosBaseQuery';

const fakeApi = {} as BaseQueryApi;

describe('axiosBaseQuery', () => {
  it('maps a successful response to { data }', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    mock.onGet('/items').reply(200, [{ id: '1', name: 'One' }]);

    const result = await axiosBaseQuery(instance)({ url: '/items' }, fakeApi, {});

    expect(result).toEqual({ data: [{ id: '1', name: 'One' }] });
  });

  it('maps a failed response to a normalized ApiError, not a raw AxiosError', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    mock.onGet('/items').reply(404);

    const result = await axiosBaseQuery(instance)({ url: '/items' }, fakeApi, {});

    expect(result.data).toBeUndefined();
    expect(result.error).toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(result.error).toBeInstanceOf(Error);
  });

  it('sends the method/data/params through to the underlying request', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    mock.onPost('/items').reply((config) => [200, { received: JSON.parse(config.data) }]);

    const result = await axiosBaseQuery(instance)(
      { url: '/items', method: 'POST', data: { name: 'New' } },
      fakeApi,
      {},
    );

    expect(result).toEqual({ data: { received: { name: 'New' } } });
  });
});
