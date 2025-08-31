import { describe, it, expect } from 'vitest';
import { parseINR, formatINR } from './index.js';

describe('Edge coverage tests', () => {
  describe('Parser overflow edge cases', () => {
    it('should handle overflow in mixed units - overflow case', () => {
      // Use a very large number to trigger overflow
      const result = parseINR('90071992547409921 cr 90071992547409921 lakh');
      expect(result).toEqual({
        kind: 'err',
        reason: 'overflow',
      });
    });

    it('should handle nonfinite in mixed units', () => {
      // Create a case that results in NaN by using invalid number
      const result = parseINR('NaN cr 0 lakh');
      expect(result).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });

    it('should handle unknown unit key in single unit parsing', () => {
      // This is to cover the case where unitKey doesn't exist in UNIT_MULT
      const result = parseINR('2.3 invalidunit');
      expect(result).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });
  });

  describe('Formatter edge cases', () => {
    it('should handle compact metric with exact 1e6 threshold', () => {
      const result = formatINR(1000000, { style: 'compact-metric' });
      expect(result).toBe('₹1m');
    });

    it('should handle compact metric with exact 1e9 threshold', () => {
      const result = formatINR(1000000000, { style: 'compact-metric' });
      expect(result).toBe('₹1b');
    });
  });
});