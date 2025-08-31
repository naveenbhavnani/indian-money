import { describe, it, expect } from 'vitest';
import { parseINR } from './parser.js';

describe('Parser edge cases', () => {
  describe('scientific notation with units', () => {
    it('should handle valid scientific notation', () => {
      const result = parseINR('1e3 L');
      expect(result).toEqual({
        kind: 'ok',
        value: 100000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '1e3 L',
        },
      });
    });

    it('should handle negative scientific notation', () => {
      const result = parseINR('1e-3 L');
      expect(result).toEqual({
        kind: 'ok',
        value: 100,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'lakh',
          raw: '1e-3 L',
        },
      });
    });
  });

  describe('mixed units with scientific notation', () => {
    it('should handle mixed units with scientific notation', () => {
      const result = parseINR('1e1 cr 2e1 lakh');
      expect(result).toEqual({
        kind: 'ok',
        value: 102000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: 'crore',
          raw: '1e1 cr 2e1 lakh',
        },
      });
    });
  });

  describe('metric units edge cases', () => {
    it('should not parse metric units when disabled', () => {
      const result = parseINR('500b', { allowMetricUnits: false });
      expect(result).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });

    it('should parse billion unit when enabled', () => {
      const result = parseINR('1.5b', { allowMetricUnits: true });
      expect(result).toEqual({
        kind: 'ok',
        value: 1500000000,
        negative: false,
        detected: {
          currency: undefined,
          unit: null,
          raw: '1.5b',
        },
      });
    });
  });

  describe('currency edge cases', () => {
    it('should handle currency with no space', () => {
      const result = parseINR('₹2.3');
      expect(result).toEqual({
        kind: 'ok',
        value: 2.3,
        negative: false,
        detected: {
          currency: 'INR',
          unit: null,
          raw: '₹2.3',
        },
      });
    });
  });

  describe('invalid unit combinations', () => {
    it('should reject unknown unit', () => {
      const result = parseINR('2.3 xyz');
      expect(result).toEqual({
        kind: 'err',
        reason: 'invalid',
      });
    });
  });

  describe('overflow edge cases', () => {
    it('should detect overflow in mixed units', () => {
      const result = parseINR('999999999999 cr 999999999999 lakh');
      expect(result).toEqual({
        kind: 'err',
        reason: 'overflow',
      });
    });

    it('should detect overflow in single units', () => {
      const result = parseINR('99999999999999 cr');
      expect(result).toEqual({
        kind: 'err',
        reason: 'overflow',
      });
    });
  });
});