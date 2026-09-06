import { getErrorMessage, isError } from './error';

describe('isError', () => {
  it('returns true for an Error instance', () => {
    expect(isError(new Error('boom'))).toBe(true);
  });

  it('returns false for a non-Error value', () => {
    expect(isError('boom')).toBe(false);
    expect(isError({ message: 'boom' })).toBe(false);
    expect(isError(null)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('extracts the message from an Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns a plain string unchanged', () => {
    expect(getErrorMessage('boom')).toBe('boom');
  });

  it('extracts message from an object with a string message field', () => {
    expect(getErrorMessage({ message: 'boom' })).toBe('boom');
  });

  it('falls back to a generic message for anything else', () => {
    expect(getErrorMessage(42)).toBe('An unknown error occurred.');
    expect(getErrorMessage(null)).toBe('An unknown error occurred.');
    expect(getErrorMessage({})).toBe('An unknown error occurred.');
    expect(getErrorMessage({ message: 42 })).toBe('An unknown error occurred.');
  });
});
