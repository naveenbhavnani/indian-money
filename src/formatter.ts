import { FormatOptions } from './types.js';

function fallbackIndianGrouping(num: number, decimals: number): string {
  const parts = num.toString().split('.');
  const integerPart = parts[0] || '0';
  const fractionalPart = parts[1];
  
  // Group the integer part using Indian numbering system
  let grouped = '';
  const digits = integerPart.split('').reverse();
  
  for (let i = 0; i < digits.length; i++) {
    if (i === 3) {
      grouped = ',' + grouped;
    } else if (i > 3 && (i - 3) % 2 === 0) {
      grouped = ',' + grouped;
    }
    grouped = digits[i] + grouped;
  }
  
  // Add fractional part
  if (fractionalPart !== undefined || decimals > 0) {
    const fraction = fractionalPart || '';
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    if (paddedFraction) {
      grouped += '.' + paddedFraction;
    }
  }
  
  return grouped;
}

function formatWithIntl(num: number, decimals: number): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Fallback if Intl is not available
    return fallbackIndianGrouping(Math.abs(num), decimals);
  }
}

export function formatINR(n: number, opts: FormatOptions = {}): string {
  const {
    currency = 'INR',
    ascii = false,
    decimals = 2,
    style = 'standard',
    minCompact = 1e5,
    spaceBetween = false,
    sign = 'auto',
  } = opts;

  if (!Number.isFinite(n)) {
    throw new Error('Cannot format non-finite number');
  }

  const isNegative = n < 0;
  const absN = Math.abs(n);

  let formatted = '';

  // Handle compact styles
  if (style === 'compact-indian' && absN >= minCompact) {
    if (absN >= 1e7) {
      // Crore
      const croreValue = absN / 1e7;
      const croreFormatted = croreValue.toFixed(decimals).replace(/\.?0+$/, '');
      formatted = croreFormatted + (spaceBetween ? ' ' : '') + 'Cr';
    } else if (absN >= 1e5) {
      // Lakh
      const lakhValue = absN / 1e5;
      const lakhFormatted = lakhValue.toFixed(decimals).replace(/\.?0+$/, '');
      formatted = lakhFormatted + (spaceBetween ? ' ' : '') + 'L';
    } else {
      formatted = formatWithIntl(absN, decimals);
    }
  } else if (style === 'compact-metric') {
    // Compact metric style (like Intl.NumberFormat compact)
    if (absN >= 1e9) {
      const bValue = absN / 1e9;
      formatted = bValue.toFixed(1).replace(/\.?0+$/, '') + 'b';
    } else if (absN >= 1e6) {
      const mValue = absN / 1e6;
      formatted = mValue.toFixed(1).replace(/\.?0+$/, '') + 'm';
    } else if (absN >= 1e3) {
      const kValue = absN / 1e3;
      formatted = kValue.toFixed(1).replace(/\.?0+$/, '') + 'k';
    } else {
      formatted = formatWithIntl(absN, decimals);
    }
  } else {
    // Standard formatting
    formatted = formatWithIntl(absN, decimals);
  }

  // Apply currency prefix
  let result = formatted;
  if (currency === 'INR') {
    const currencySymbol = ascii ? 'Rs ' : '₹';
    result = currencySymbol + formatted;
  }

  // Apply sign
  if (isNegative) {
    if (sign === 'accounting') {
      result = `(${result})`;
    } else {
      result = '-' + result;
    }
  } else if (sign === 'always') {
    result = '+' + result;
  }

  return result;
}