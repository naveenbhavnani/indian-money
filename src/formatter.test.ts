import { describe, it, expect } from 'vitest';
import { formatINR } from './formatter.js';

describe('formatINR', () => {
  describe('basic formatting', () => {
    it('should format simple number with default options', () => {
      expect(formatINR(150000)).toBe('₹1,50,000.00');
    });

    it('should format with ASCII currency', () => {
      expect(formatINR(150000, { ascii: true })).toBe('Rs 1,50,000.00');
    });

    it('should format without currency', () => {
      expect(formatINR(150000, { currency: null })).toBe('1,50,000.00');
    });

    it('should format with custom decimals', () => {
      expect(formatINR(123456.789, { decimals: 3 })).toBe('₹1,23,456.789');
    });

    it('should format with no decimals', () => {
      expect(formatINR(150000, { decimals: 0 })).toBe('₹1,50,000');
    });
  });

  describe('sign handling', () => {
    it('should format negative number with auto sign', () => {
      expect(formatINR(-1234.5)).toBe('-₹1,234.50');
    });

    it('should format negative number with accounting sign', () => {
      expect(formatINR(-1234.5, { sign: 'accounting' })).toBe('(₹1,234.50)');
    });

    it('should format positive number with always sign', () => {
      expect(formatINR(1234.5, { sign: 'always' })).toBe('+₹1,234.50');
    });

    it('should format negative number with always sign', () => {
      expect(formatINR(-1234.5, { sign: 'always' })).toBe('-₹1,234.50');
    });
  });

  describe('compact Indian style', () => {
    it('should format crore values', () => {
      expect(formatINR(23000000, { style: 'compact-indian' })).toBe('₹2.3Cr');
    });

    it('should format lakh values', () => {
      expect(formatINR(1250000, { style: 'compact-indian' })).toBe('₹12.5L');
    });

    it('should format with space between number and unit', () => {
      expect(formatINR(23000000, { style: 'compact-indian', spaceBetween: true })).toBe('₹2.3 Cr');
    });

    it('should not use compact for values below minCompact', () => {
      expect(formatINR(50000, { style: 'compact-indian' })).toBe('₹50,000.00');
    });

    it('should use compact with custom minCompact threshold', () => {
      expect(formatINR(100000, { style: 'compact-indian', minCompact: 100000 })).toBe('₹1L');
    });

    it('should remove trailing zeros in compact format', () => {
      expect(formatINR(10000000, { style: 'compact-indian' })).toBe('₹1Cr');
    });

    it('should format with custom decimals in compact mode', () => {
      expect(formatINR(12345678, { style: 'compact-indian', decimals: 3 })).toBe('₹1.235Cr');
    });
  });

  describe('compact metric style', () => {
    it('should format billions', () => {
      expect(formatINR(1500000000, { style: 'compact-metric' })).toBe('₹1.5b');
    });

    it('should format millions', () => {
      expect(formatINR(2500000, { style: 'compact-metric' })).toBe('₹2.5m');
    });

    it('should format thousands', () => {
      expect(formatINR(1500, { style: 'compact-metric' })).toBe('₹1.5k');
    });

    it('should format small values normally', () => {
      expect(formatINR(500, { style: 'compact-metric' })).toBe('₹500.00');
    });
  });

  describe('Indian number formatting', () => {
    it('should use Indian grouping for large numbers', () => {
      expect(formatINR(12345678.90)).toBe('₹1,23,45,678.90');
    });

    it('should handle numbers with many digits', () => {
      expect(formatINR(123456789012)).toBe('₹1,23,45,67,89,012.00');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatINR(0)).toBe('₹0.00');
    });

    it('should handle very small numbers', () => {
      expect(formatINR(0.01)).toBe('₹0.01');
    });

    it('should handle very large numbers', () => {
      expect(formatINR(999999999999)).toBe('₹9,99,99,99,99,999.00');
    });

    it('should throw error for non-finite numbers', () => {
      expect(() => formatINR(Infinity)).toThrow('Cannot format non-finite number');
      expect(() => formatINR(NaN)).toThrow('Cannot format non-finite number');
    });
  });

  describe('combination options', () => {
    it('should combine ASCII, accounting, and compact-indian', () => {
      expect(formatINR(-23000000, {
        ascii: true,
        sign: 'accounting',
        style: 'compact-indian'
      })).toBe('(Rs 2.3Cr)');
    });

    it('should combine all formatting options', () => {
      expect(formatINR(12500000, {
        ascii: true,
        style: 'compact-indian',
        spaceBetween: true,
        decimals: 1,
        sign: 'always'
      })).toBe('+Rs 1.3 Cr');
    });
  });
});