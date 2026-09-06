import axios, { type AxiosInstance } from "axios";

import { attachAuthInterceptor } from "./interceptors/auth";
import { attachRefreshInterceptor } from "./interceptors/refresh";
import type { ApiClientConfig } from "./types";

const DEFAULT_TIMEOUT_MS = 15000;

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
  });

  attachAuthInterceptor(instance, config.tokenProvider);
  attachRefreshInterceptor(instance, config);

  return instance;
}
