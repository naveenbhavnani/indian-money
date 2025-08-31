import { describe, it, expect, vi } from 'vitest';
import { formatINR } from './formatter.js';

describe('Fallback tests', () => {
  describe('when Intl is not available', () => {
    it('should use fallback formatting', () => {
      // Mock Intl to throw an error
      const originalIntl = global.Intl;
      vi.stubGlobal('Intl', undefined);

      const result = formatINR(12345678.90, { decimals: 2 });
      expect(result).toMatch(/₹1,23,45,678\.90/);

      // Restore Intl
      vi.stubGlobal('Intl', originalIntl);
    });

    it('should handle fallback grouping with no decimals', () => {
      const originalIntl = global.Intl;
      vi.stubGlobal('Intl', undefined);

      const result = formatINR(12345678, { decimals: 0 });
      expect(result).toMatch(/₹1,23,45,678/);

      vi.stubGlobal('Intl', originalIntl);
    });

    it('should handle fallback grouping with fractional input', () => {
      const originalIntl = global.Intl;
      vi.stubGlobal('Intl', undefined);

      const result = formatINR(123.456, { decimals: 2 });
      expect(result).toBe('₹123.45');

      vi.stubGlobal('Intl', originalIntl);
    });
  });

  describe('Intl NumberFormat errors', () => {
    it('should fallback when Intl.NumberFormat throws', () => {
      const originalIntl = global.Intl;
      
      // Mock Intl.NumberFormat to throw an error
      const mockIntl = {
        NumberFormat: vi.fn().mockImplementation(() => {
          throw new Error('Intl not supported');
        })
      };
      vi.stubGlobal('Intl', mockIntl);

      const result = formatINR(12345678.90, { decimals: 2 });
      expect(result).toMatch(/₹1,23,45,678\.90/);

      vi.stubGlobal('Intl', originalIntl);
    });
  });

  describe('edge cases in compact metric format', () => {
    it('should format small values in metric style', () => {
      const result = formatINR(999, { style: 'compact-metric' });
      expect(result).toBe('₹999.00');
    });
  });
});