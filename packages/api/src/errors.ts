import axios from 'axios';

export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN';

// So UI code never touches a raw AxiosError — only ever this normalized
// shape, via ApiErrorCode.
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(code: ApiErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'ApiError';
    this.code = code;
    this.status = options?.status;
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError('TIMEOUT', 'The request timed out.', {
        status: error.response?.status,
        cause: error,
      });
    }

    if (!error.response) {
      return new ApiError('NETWORK', 'A network error occurred. Check your connection and try again.', {
        cause: error,
      });
    }

    const status = error.response.status;
    switch (status) {
      case 401:
        return new ApiError('UNAUTHORIZED', 'You are not authorized to perform this action.', {
          status,
          cause: error,
        });
      case 403:
        return new ApiError('FORBIDDEN', 'You do not have permission to perform this action.', {
          status,
          cause: error,
        });
      case 404:
        return new ApiError('NOT_FOUND', 'The requested resource was not found.', { status, cause: error });
      case 409:
        return new ApiError('CONFLICT', 'The request could not be completed due to a conflict.', {
          status,
          cause: error,
        });
      case 422:
        return new ApiError('VALIDATION', 'The request was invalid.', { status, cause: error });
      case 429:
        return new ApiError('RATE_LIMITED', 'Too many requests. Please try again later.', {
          status,
          cause: error,
        });
      default:
        if (status >= 500) {
          return new ApiError('SERVER', 'A server error occurred. Please try again later.', {
            status,
            cause: error,
          });
        }
        return new ApiError('UNKNOWN', 'An unexpected error occurred.', { status, cause: error });
    }
  }

  return new ApiError('UNKNOWN', error instanceof Error ? error.message : 'An unexpected error occurred.', {
    cause: error,
  });
}
