export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsClient {
  track(event: string, properties?: AnalyticsProperties): void;
  screen(name: string, properties?: AnalyticsProperties): void;
  identify(userId: string, traits?: AnalyticsProperties): void;
  reset(): void;
}
