import { formatDate, formatRelativeTime, isValidDate } from './date';

describe('isValidDate', () => {
  it('returns true for a valid Date', () => {
    expect(isValidDate(new Date('2026-01-01'))).toBe(true);
  });

  it('returns false for an invalid Date', () => {
    expect(isValidDate(new Date('not-a-date'))).toBe(false);
  });

  it('returns false for a non-Date value', () => {
    expect(isValidDate('2026-01-01')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats a Date instance', () => {
    expect(formatDate(new Date('2026-03-15T00:00:00Z'), { dateStyle: 'medium' }, 'en-US')).toBe(
      'Mar 15, 2026',
    );
  });

  it('formats an ISO string input the same as an equivalent Date', () => {
    expect(formatDate('2026-03-15T00:00:00Z', { dateStyle: 'medium' }, 'en-US')).toBe('Mar 15, 2026');
  });

  it('throws for an invalid date input', () => {
    expect(() => formatDate('not-a-date')).toThrow(RangeError);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-03-15T12:00:00Z');

  it('formats a past time as "ago"', () => {
    const twoHoursAgo = new Date('2026-03-15T10:00:00Z');
    expect(formatRelativeTime(twoHoursAgo, now, 'en-US')).toBe('2 hours ago');
  });

  it('formats a future time as "in"', () => {
    const inThreeDays = new Date('2026-03-18T12:00:00Z');
    expect(formatRelativeTime(inThreeDays, now, 'en-US')).toBe('in 3 days');
  });

  it('throws for an invalid date input', () => {
    expect(() => formatRelativeTime('not-a-date', now)).toThrow(RangeError);
  });
});
