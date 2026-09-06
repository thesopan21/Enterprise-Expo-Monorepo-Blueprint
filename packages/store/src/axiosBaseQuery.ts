import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { normalizeError, type ApiError } from '@workspace/api';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
}

// Adapts RTK Query's createApi() to route through an app-supplied
// AxiosInstance (the same one @workspace/api's createApiClient() produces)
// instead of RTK Query's default fetchBaseQuery — preserving that
// instance's auth-header injection, single-flight refresh, and ApiError
// normalization untouched.
export function axiosBaseQuery(axiosInstance: AxiosInstance): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> {
  return async ({ url, method = 'GET', data, params }) => {
    try {
      const response = await axiosInstance.request({ url, method, data, params });
      return { data: response.data };
    } catch (error) {
      return { error: normalizeError(error) };
    }
  };
}
