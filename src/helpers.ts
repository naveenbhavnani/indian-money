import { ParseOutput } from './types.js';
import { parseINR } from './parser.js';

export function toIndianCompact(
  n: number,
  opts?: { decimals?: number; spaceBetween?: boolean }
): string {
  const { decimals = 1, spaceBetween = false } = opts || {};

  if (!Number.isFinite(n)) {
    throw new Error('Cannot format non-finite number');
  }

  const absN = Math.abs(n);
  let result = '';

  if (absN >= 1e7) {
    // Crore
    const croreValue = absN / 1e7;
    const croreFormatted = croreValue.toFixed(decimals).replace(/\.?0+$/, '');
    result = croreFormatted + (spaceBetween ? ' ' : '') + 'Cr';
  } else if (absN >= 1e5) {
    // Lakh
    const lakhValue = absN / 1e5;
    const lakhFormatted = lakhValue.toFixed(decimals).replace(/\.?0+$/, '');
    result = lakhFormatted + (spaceBetween ? ' ' : '') + 'L';
  } else {
    // Below 1 lakh, return as-is with specified decimals
    result = absN.toFixed(decimals).replace(/\.?0+$/, '');
  }

  return n < 0 ? '-' + result : result;
}

export function fromIndianCompact(input: string): ParseOutput {
  // This is essentially an alias to parseINR with focus on compact forms
  return parseINR(input);
}