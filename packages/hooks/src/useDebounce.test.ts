import { act, renderHook } from '@testing-library/react-native';

import { useDebounce } from './useDebounce';

async function advanceTimersByTime(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the initial value immediately', async () => {
    const { result } = await renderHook(({ value }: { value: string }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    });

    expect(result.current).toBe('a');
  });

  it('does not update before the delay elapses', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'b' });

    expect(result.current).toBe('a');
  });

  it('updates to the latest value once the delay elapses', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'b' });
    await advanceTimersByTime(200);

    expect(result.current).toBe('b');
  });

  it('only reflects the last value when it changes multiple times within the delay', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebounce(value, 200), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'b' });
    await advanceTimersByTime(100);
    await rerender({ value: 'c' });
    await advanceTimersByTime(100);
    expect(result.current).toBe('a');

    await advanceTimersByTime(100);
    expect(result.current).toBe('c');
  });
});
