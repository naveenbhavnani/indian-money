import { describe, it, expect } from 'vitest';
import { parseINR } from './parser.js';

describe('parseINR', () => {
  describe('empty input', () => {
    it('should return empty error for empty string', () => {
      expect(parseINR('')).toEqual({
        kind: 'err',
        reason: 'empty',
      });
    });

    it('should return empty error for whitespace only', () => {
      expect(parseINR('   ')).toEqual({
        kind: 'err',
        reason: 'empty',
      });
    });

    it('should return empty error for null/undefined', () => {
      expect(parseINR(null as any)).toEqual({
        kind: 'err',
        reason: 'empty',
      });
    });
  });

  describe('currency markers', () => {
    it('should parse ₹ symbol', () => {
      const result = parseINR('₹1,50,000');
      expect(result).toEqual({
        kind: 'ok',
        value: 150000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: '₹1,50,000',
        },
      });
    });

    it('should parse Rs prefix', () => {
      const result = parseINR('Rs 2,30,000');
      expect(result).toEqual({
        kind: 'ok',
        value: 230000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: 'Rs 2,30,000',
        },
      });
    });

    it('should parse Rs. prefix', () => {
      const result = parseINR('Rs. 75,000');
      expect(result).toEqual({
        kind: 'ok',
        value: 75000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: 'Rs. 75,000',
        },
      });
    });

    it('should parse INR prefix', () => {
      const result = parseINR('INR 2,30,000.50');
      expect(result).toEqual({
        kind: 'ok',
        value: 230000.5,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: 'INR 2,30,000.50',
        },
      });
    });

    it('should parse रु prefix', () => {
      const result = parseINR('रु 1,00,000');
      expect(result).toEqual({
        kind: 'ok',
        value: 100000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: 'रु 1,00,000',
        },
      });
    });
  });

  describe('plain numbers', () => {
    it('should parse simple number', () => {
      const result = parseINR('123.45');
      expect(result).toEqual({
        kind: 'ok',
        value: 123.45,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '123.45',
        },
      });
    });

    it('should parse number with Indian formatting', () => {
      const result = parseINR('1,23,45,678.90');
      expect(result).toEqual({
        kind: 'ok',
        value: 12345678.9,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '1,23,45,678.90',
        },
      });
    });

    it('should parse number with spaces', () => {
      const result = parseINR('1 23 45 678');
      expect(result).toEqual({
        kind: 'ok',
        value: 12345678,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '1 23 45 678',
        },
      });
    });
  });

  describe('crore units', () => {
    it('should parse "cr" unit', () => {
      const result = parseINR('2.3 Cr');
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

    it('should parse "crore" unit', () => {
      const result = parseINR('1.5 crore');
      expect(result).toEqual({
        kind: 'ok',
        value: 15000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '1.5 crore',
        },
      });
    });

    it('should parse "crores" unit', () => {
      const result = parseINR('3 crores');
      expect(result).toEqual({
        kind: 'ok',
        value: 30000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '3 crores',
        },
      });
    });
  });

  describe('lakh units', () => {
    it('should parse "L" unit', () => {
      const result = parseINR('45L');
      expect(result).toEqual({
        kind: 'ok',
        value: 4500000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '45L',
        },
      });
    });

    it('should parse "lakh" unit', () => {
      const result = parseINR('2.5 lakh');
      expect(result).toEqual({
        kind: 'ok',
        value: 250000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '2.5 lakh',
        },
      });
    });

    it('should parse "lac" unit', () => {
      const result = parseINR('1.2 lac');
      expect(result).toEqual({
        kind: 'ok',
        value: 120000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '1.2 lac',
        },
      });
    });
  });

  describe('mixed units', () => {
    it('should parse "X cr Y lakh"', () => {
      const result = parseINR('2 crore 30 lakh');
      expect(result).toEqual({
        kind: 'ok',
        value: 23000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '2 crore 30 lakh',
        },
      });
    });

    it('should parse "X cr Y L"', () => {
      const result = parseINR('1.5 cr 25 L');
      expect(result).toEqual({
        kind: 'ok',
        value: 17500000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '1.5 cr 25 L',
        },
      });
    });

    it('should parse "X cr 0 lakh"', () => {
      const result = parseINR('2 cr 0 lakh');
      expect(result).toEqual({
        kind: 'ok',
        value: 20000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '2 cr 0 lakh',
        },
      });
    });
  });

  describe('negative numbers', () => {
    it('should parse negative with minus sign', () => {
      const result = parseINR('-Rs 75,000');
      expect(result).toEqual({
        kind: 'ok',
        value: -75000,
        negative: true,
        detected: {
          currency: 'INR',
          unit: null,
          raw: '-Rs 75,000',
        },
      });
    });

    it('should parse negative with parentheses', () => {
      const result = parseINR('(₹1,50,000)');
      expect(result).toEqual({
        kind: 'ok',
        value: -150000,
        negative: true,
        detected: {
          currency: 'INR',
          unit: null,
          raw: '(₹1,50,000)',
        },
      });
    });

    it('should parse positive with plus sign', () => {
      const result = parseINR('+ 45 L');
      expect(result).toEqual({
        kind: 'ok',
        value: 4500000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '+ 45 L',
        },
      });
    });
  });

  describe('metric units (when enabled)', () => {
    it('should parse "k" unit when allowMetricUnits is true', () => {
      const result = parseINR('500k', { allowMetricUnits: true });
      expect(result).toEqual({
        kind: 'ok',
        value: 500000,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '500k',
        },
      });
    });

    it('should parse "m" unit when allowMetricUnits is true', () => {
      const result = parseINR('2.5m', { allowMetricUnits: true });
      expect(result).toEqual({
        kind: 'ok',
        value: 2500000,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '2.5m',
        },
      });
    });

    it('should not parse "k" unit when allowMetricUnits is false', () => {
      const result = parseINR('500k', { allowMetricUnits: false });
      expect(result).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });
  });

  describe('error cases', () => {
    it('should return invalid for invalid input', () => {
      expect(parseINR('cr 2')).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });

    it('should return invalid for misspelled units', () => {
      expect(parseINR('2.3 carore')).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });

    it('should return invalid for input exceeding maxLen', () => {
      const longInput = 'Rs 1,'.repeat(100) + '000';
      expect(parseINR(longInput, { maxLen: 50 })).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });

    it('should return overflow for very large numbers', () => {
      const result = parseINR('9999999999999 Cr');
      expect(result).toEqual({
        kind: 'err',
        reason: 'overflow',
      });
    });

    it('should return nonfinite for infinite results', () => {
      const result = parseINR('1e309 Cr');
      expect(result).toEqual({
        kind: 'err',
        reason: 'nonfinite',
      });
    });
  });

  describe('edge cases', () => {
    it('should parse currency after whitespace', () => {
      const result = parseINR('₹ 2.3Cr');
      expect(result).toEqual({
        kind: 'ok',
        value: 23000000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: 'crore',
          raw: '₹ 2.3Cr',
        },
      });
    });

    it('should parse with mixed separators', () => {
      const result = parseINR('Rs.2,30,000');
      expect(result).toEqual({
        kind: 'ok',
        value: 230000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: 'Rs.2,30,000',
        },
      });
    });

    it('should handle case insensitive units', () => {
      expect(parseINR('2 CRORE')).toEqual({
        kind: 'ok',
        value: 20000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '2 CRORE',
        },
      });
    });
  });
});