export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function hasStringProperty<K extends string>(value: unknown, key: K): value is Record<K, string> {
  return typeof value === 'object' && value !== null && key in value && typeof (value as Record<K, unknown>)[key] === 'string';
}

// Best-effort human-readable message extraction from an unknown thrown
// value — Error instances, plain strings, and objects with a string
// `message` field (e.g. a parsed API error body) all resolve sensibly.
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (hasStringProperty(error, 'message')) {
    return error.message;
  }
  return 'An unknown error occurred.';
}
