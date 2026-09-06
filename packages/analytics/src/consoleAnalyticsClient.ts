import type { AnalyticsClient, AnalyticsProperties } from "./types";

function log(call: string, ...details: unknown[]): void {
  console.log(`[analytics] ${call}`, ...details);
}

// Dev-only — logs every call instead of sending it anywhere, so
// instrumentation can be verified before a real vendor is wired in. Never
// use this in production: it's a verification aid, not a vendor.
export const consoleAnalyticsClient: AnalyticsClient = {
  track(event: string, properties?: AnalyticsProperties) {
    log("track", event, properties ?? {});
  },
  screen(name: string, properties?: AnalyticsProperties) {
    log("screen", name, properties ?? {});
  },
  identify(userId: string, traits?: AnalyticsProperties) {
    log("identify", userId, traits ?? {});
  },
  reset() {
    log("reset");
  },
};
