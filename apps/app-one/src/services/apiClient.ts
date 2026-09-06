import { createApiClient } from "@workspace/api";
import { sessionManager } from "@workspace/auth";

import { API_BASE_URL } from "@/config/env";
import { refreshAccessToken } from "@/features/auth/api/authApi";

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  tokenProvider: sessionManager,
  refreshAccessToken,
});
