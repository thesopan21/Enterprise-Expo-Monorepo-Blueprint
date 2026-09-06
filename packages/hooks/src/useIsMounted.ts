import { useCallback, useEffect, useRef } from 'react';

// Guards async state updates after unmount, e.g.:
//   const isMounted = useIsMounted();
//   const data = await fetchThing();
//   if (isMounted()) setState(data);
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => mountedRef.current, []);
}
