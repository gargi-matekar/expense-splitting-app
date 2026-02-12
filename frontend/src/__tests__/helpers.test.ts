import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
  truncateText,
  handleApiError,
} from '../utils/helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(1500.50)).toBe('₹1,501');
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('handles negative values', () => {
      expect(formatCurrency(-500)).toBe('-₹500');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan|15|2024/);
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime correctly', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const formatted = formatDateTime(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getInitials', () => {
    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    it('handles single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('returns uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncateText(text, 20)).toBe('This is a very long ...');
    });

    it('does not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 20)).toBe('Short text');
    });

    it('handles exact length', () => {
      const text = 'Exact length text';
      expect(truncateText(text, 17)).toBe('Exact length text');
    });
  });

  describe('handleApiError', () => {
    it('extracts error message from response', () => {
      const error = {
        response: {
          data: {
            message: 'Custom error message',
          },
        },
      };
      expect(handleApiError(error)).toBe('Custom error message');
    });

    it('uses error message property', () => {
      const error = {
        message: 'Network error',
      };
      expect(handleApiError(error)).toBe('Network error');
    });

    it('returns default message for unknown errors', () => {
      const error = {};
      expect(handleApiError(error)).toBe('An unexpected error occurred');
    });
  });
});