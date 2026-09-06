import type { TokenProvider } from "@workspace/auth";
import type { AxiosInstance } from "axios";

export function attachAuthInterceptor(instance: AxiosInstance, tokenProvider: TokenProvider): void {
  instance.interceptors.request.use((config) => {
    const accessToken = tokenProvider.getAccessToken();
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return config;
  });
}
