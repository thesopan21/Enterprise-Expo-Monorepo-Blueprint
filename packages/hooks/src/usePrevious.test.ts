import { renderHook } from '@testing-library/react-native';

import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('returns undefined on the first render', async () => {
    const { result } = await renderHook(({ value }: { value: string }) => usePrevious(value), {
      initialProps: { value: 'a' },
    });

    expect(result.current).toBeUndefined();
  });

  it('returns the previous value after each rerender', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => usePrevious(value), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'b' });
    expect(result.current).toBe('a');

    await rerender({ value: 'c' });
    expect(result.current).toBe('b');
  });
});
