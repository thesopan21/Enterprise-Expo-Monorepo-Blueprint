import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { createAppStore } from './store';

describe('createAppStore — example API tag invalidation', () => {
  it('refetches the list after a mutation invalidates its tag', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    mock.onGet('/example-items').replyOnce(200, [{ id: '1', name: 'First' }]);
    mock.onPost('/example-items').reply(200, { id: '2', name: 'Second' });
    mock.onGet('/example-items').reply(200, [
      { id: '1', name: 'First' },
      { id: '2', name: 'Second' },
    ]);

    const { store, exampleApi } = createAppStore(instance);

    function wrapper({ children }: PropsWithChildren) {
      return <Provider store={store}>{children}</Provider>;
    }

    const { result } = renderHook(
      () => ({
        list: exampleApi.endpoints.getExampleItems.useQuery(),
        createItem: exampleApi.endpoints.createExampleItem.useMutation(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.list.data).toHaveLength(1));

    const [createItem] = result.current.createItem;
    await createItem({ name: 'Second' });

    await waitFor(() => expect(result.current.list.data).toHaveLength(2));
    expect(result.current.list.data).toEqual([
      { id: '1', name: 'First' },
      { id: '2', name: 'Second' },
    ]);
  });
});
