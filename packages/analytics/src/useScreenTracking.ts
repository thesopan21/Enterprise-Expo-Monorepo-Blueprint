import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";

import type { AnalyticsClient, AnalyticsProperties } from "./types";

// Tracks a `.screen()` call on every Expo Router pathname change. Reads
// `properties` from a ref rather than the effect's dependency array, since a
// caller-provided properties object is typically a fresh literal on every
// render — depending on it directly would re-fire the effect without a real
// navigation having happened.
export function useScreenTracking(client: AnalyticsClient, properties?: AnalyticsProperties): void {
  const pathname = usePathname();
  const propertiesRef = useRef(properties);
  propertiesRef.current = properties;

  useEffect(() => {
    client.screen(pathname, propertiesRef.current);
  }, [client, pathname]);
}
