import type { AnalyticsClient } from "./types";

// The default client — every call is a deliberate no-op. Analytics stays
// silent until an app swaps this out for a real vendor SDK behind the same
// AnalyticsClient interface; see README.md.
export const noopAnalyticsClient: AnalyticsClient = {
  track() {},
  screen() {},
  identify() {},
  reset() {},
};
