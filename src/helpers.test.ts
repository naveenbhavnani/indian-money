import { describe, it, expect } from 'vitest';
import { toIndianCompact, fromIndianCompact } from './helpers.js';

describe('toIndianCompact', () => {
  describe('crore formatting', () => {
    it('should format crore values', () => {
      expect(toIndianCompact(23000000)).toBe('2.3Cr');
    });

    it('should format crore values with custom decimals', () => {
      expect(toIndianCompact(23456789, { decimals: 2 })).toBe('2.35Cr');
    });

    it('should format crore values with space', () => {
      expect(toIndianCompact(23000000, { spaceBetween: true })).toBe('2.3 Cr');
    });

    it('should remove trailing zeros', () => {
      expect(toIndianCompact(10000000)).toBe('1Cr');
    });
  });

  describe('lakh formatting', () => {
    it('should format lakh values', () => {
      expect(toIndianCompact(1250000)).toBe('12.5L');
    });

    it('should format lakh values with custom decimals', () => {
      expect(toIndianCompact(1234567, { decimals: 2 })).toBe('12.35L');
    });

    it('should format lakh values with space', () => {
      expect(toIndianCompact(1250000, { spaceBetween: true })).toBe('12.5 L');
    });

    it('should remove trailing zeros for lakhs', () => {
      expect(toIndianCompact(1000000)).toBe('10L');
    });
  });

  describe('small values', () => {
    it('should format values below 1 lakh as-is', () => {
      expect(toIndianCompact(99999)).toBe('99999');
    });

    it('should format small values with decimals', () => {
      expect(toIndianCompact(123.456, { decimals: 2 })).toBe('123.46');
    });

    it('should remove trailing zeros for small values', () => {
      expect(toIndianCompact(100, { decimals: 2 })).toBe('100');
    });
  });

  describe('negative values', () => {
    it('should handle negative crore values', () => {
      expect(toIndianCompact(-23000000)).toBe('-2.3Cr');
    });

    it('should handle negative lakh values', () => {
      expect(toIndianCompact(-1250000)).toBe('-12.5L');
    });

    it('should handle negative small values', () => {
      expect(toIndianCompact(-50000)).toBe('-50000');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(toIndianCompact(0)).toBe('0');
    });

    it('should handle very large numbers', () => {
      expect(toIndianCompact(999999999999)).toBe('100000Cr');
    });

    it('should throw error for non-finite numbers', () => {
      expect(() => toIndianCompact(Infinity)).toThrow('Cannot format non-finite number');
      expect(() => toIndianCompact(NaN)).toThrow('Cannot format non-finite number');
    });
  });
});

describe('fromIndianCompact', () => {
  it('should parse compact crore format', () => {
    const result = fromIndianCompact('2.3Cr');
    expect(result).toEqual({
      kind: 'ok',
      value: 23000000,
      negative: false,
      detected: {
        currency: undefined,
        unit: 'crore',
        raw: '2.3Cr',
      },
    });
  });

  it('should parse compact lakh format', () => {
    const result = fromIndianCompact('12.5L');
    expect(result).toEqual({
      kind: 'ok',
      value: 1250000,
      negative: false,
      detected: {
        currency: undefined,
        unit: 'lakh',
        raw: '12.5L',
      },
    });
  });

  it('should parse compact format with spaces', () => {
    const result = fromIndianCompact('2.3 Cr');
    expect(result).toEqual({
      kind: 'ok',
      value: 23000000,
      negative: false,
      detected: {
        currency: undefined,
        unit: 'crore',
        raw: '2.3 Cr',
      },
    });
  });

  it('should return error for invalid format', () => {
    const result = fromIndianCompact('invalid');
    expect(result).toEqual({
      kind: 'err',
      reason: 'invalid',
    });
  });

  it('should handle currency symbols', () => {
    const result = fromIndianCompact('₹2.3Cr');
    expect(result).toEqual({
      kind: 'ok',
      value: 23000000,
      negative: false,
      detected: {
        currency: 'INR',
        unit: 'crore',
        raw: '₹2.3Cr',
      },
    });
  });
});