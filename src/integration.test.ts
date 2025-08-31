import { describe, it, expect } from 'vitest';
import { parseINR, formatINR, toIndianCompact, fromIndianCompact } from './index.js';

describe('Integration Tests', () => {
  describe('round-trip stability', () => {
    const testCases = [
      '₹1,50,000',
      '2.3 Cr',
      '-Rs 75,000',
      'INR 2,30,000.50',
      '2 crore 30 lakh',
      '45L',
      '(₹1,50,000)',
      '+ 45 L',
    ];

    testCases.forEach((input) => {
      it(`should have round-trip stability for: ${input}`, () => {
        const parsed = parseINR(input);
        if (parsed.kind === 'ok') {
          const formatted = formatINR(parsed.value, { style: 'standard' });
          const reparsed = parseINR(formatted);
          
          expect(reparsed.kind).toBe('ok');
          if (reparsed.kind === 'ok') {
            expect(Math.abs(reparsed.value - parsed.value)).toBeLessThan(0.01);
          }
        }
      });
    });
  });

  describe('format -> parse -> format consistency', () => {
    const testValues = [
      123.45,
      150000,
      1250000,
      23000000,
      -75000,
      0,
      999.99,
    ];

    testValues.forEach((value) => {
      it(`should be consistent for value: ${value}`, () => {
        const formatted1 = formatINR(value);
        const parsed = parseINR(formatted1);
        
        expect(parsed.kind).toBe('ok');
        if (parsed.kind === 'ok') {
          const formatted2 = formatINR(parsed.value);
          expect(formatted1).toBe(formatted2);
        }
      });
    });
  });

  describe('compact format round-trips', () => {
    const testValues = [
      1250000, // 12.5L
      23000000, // 2.3Cr
      100000000, // 10Cr
      500000, // 5L
    ];

    testValues.forEach((value) => {
      it(`should round-trip compact format for: ${value}`, () => {
        const compact = toIndianCompact(value);
        const parsed = fromIndianCompact(compact);
        
        expect(parsed.kind).toBe('ok');
        if (parsed.kind === 'ok') {
          expect(Math.abs(parsed.value - value)).toBeLessThan(1); // Allow for rounding
        }
      });
    });
  });

  describe('edge case combinations', () => {
    it('should handle negative compact values', () => {
      const value = -23000000;
      const formatted = formatINR(value, { style: 'compact-indian', sign: 'accounting' });
      expect(formatted).toBe('(₹2.3Cr)');
    });

    it('should handle ASCII + compact combination', () => {
      const value = 1250000;
      const formatted = formatINR(value, { 
        style: 'compact-indian', 
        ascii: true, 
        spaceBetween: true 
      });
      expect(formatted).toBe('Rs 12.5 L');
    });

    it('should parse mixed case units', () => {
      const result = parseINR('2.5 LAKH');
      expect(result.kind).toBe('ok');
      if (result.kind === 'ok') {
        expect(result.value).toBe(250000);
      }
    });

    it('should handle complex mixed units with currency', () => {
      const result = parseINR('₹2 cr 50 lakh');
      expect(result).toEqual({
        kind: 'ok',
        value: 25000000,
        negative: false,
        detected: {
          currency: 'INR',
          unit: 'crore',
          raw: '₹2 cr 50 lakh',
        },
      });
    });
  });

  describe('error propagation', () => {
    it('should propagate parsing errors consistently', () => {
      const invalidInputs = [
        'cr 2',
        '2.3 carore',
        'invalid input',
        '9999999999999 Cr',
      ];

      invalidInputs.forEach((input) => {
        const result = parseINR(input);
        expect(result.kind).toBe('err');
      });
    });

    it('should handle formatting errors consistently', () => {
      expect(() => formatINR(NaN)).toThrow();
      expect(() => formatINR(Infinity)).toThrow();
      expect(() => toIndianCompact(NaN)).toThrow();
    });
  });

  describe('performance characteristics', () => {
    it('should handle multiple operations efficiently', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        const value = Math.random() * 100000000;
        const formatted = formatINR(value, { style: 'compact-indian' });
        const parsed = parseINR(formatted);
        expect(parsed.kind).toBe('ok');
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});