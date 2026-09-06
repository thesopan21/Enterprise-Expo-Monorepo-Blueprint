import { createApi } from '@reduxjs/toolkit/query/react';
import type { AxiosInstance } from 'axios';

import { axiosBaseQuery } from '../axiosBaseQuery';

export interface ExampleItem {
  id: string;
  name: string;
}

// Reference slice — a template to copy and replace with real endpoints,
// not a real feature. Demonstrates a query, a mutation, and tag-based
// cache invalidation between them (the mutation invalidates the list,
// causing an automatic refetch).
export function createExampleApi(axiosInstance: AxiosInstance) {
  return createApi({
    reducerPath: 'exampleApi',
    baseQuery: axiosBaseQuery(axiosInstance),
    tagTypes: ['ExampleItem'],
    endpoints: (builder) => ({
      getExampleItems: builder.query<ExampleItem[], void>({
        query: () => ({ url: '/example-items' }),
        providesTags: (result) => [
          ...(result ?? []).map(({ id }) => ({ type: 'ExampleItem' as const, id })),
          { type: 'ExampleItem' as const, id: 'LIST' },
        ],
      }),
      createExampleItem: builder.mutation<ExampleItem, { name: string }>({
        query: (body) => ({ url: '/example-items', method: 'POST', data: body }),
        invalidatesTags: [{ type: 'ExampleItem', id: 'LIST' }],
      }),
    }),
  });
}

export type ExampleApi = ReturnType<typeof createExampleApi>;
