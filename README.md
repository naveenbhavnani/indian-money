# indian-money

A tiny, dependency-free TypeScript library to parse Indian currency strings (₹/Rs with lakh/crore units) into numbers and to format numbers back using the Indian numbering system, including compact L/Cr output.

[![npm version](https://badge.fury.io/js/indian-money.svg)](https://badge.fury.io/js/indian-money)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-97%25-brightgreen.svg)](https://github.com/naveenbhavnani/indian-money)

## Features

- **Parsing**: Convert messy real-world INR strings like "2.3 Cr", "45L", "Rs 1,50,000" to JavaScript numbers
- **Formatting**: Format numbers with Indian digit grouping (1,23,45,678), optional currency symbols, and compact units (L/Cr)
- **Round-trip stability**: `format(parse(s))` produces normalized output for accepted inputs
- **Zero dependencies**: No runtime dependencies, works in browsers and Node.js
- **TypeScript first**: Fully typed API with excellent IntelliSense support
- **Tiny bundle**: ~3-4 KB minified + gzipped
- **Comprehensive**: Handles mixed units ("2 cr 30 lakh"), negatives, scientific notation, and edge cases

## Installation

```bash
npm install indian-money
```

## Quick Start

```typescript
import { parseINR, formatINR } from 'indian-money';

// Parsing examples
parseINR('₹1,50,000');           // { kind: 'ok', value: 150000, ... }
parseINR('2.3 Cr');              // { kind: 'ok', value: 23000000, ... }
parseINR('2 crore 30 lakh');     // { kind: 'ok', value: 23000000, ... }
parseINR('-Rs 75,000');          // { kind: 'ok', value: -75000, negative: true, ... }
parseINR('INR 2,30,000.50');     // { kind: 'ok', value: 230000.5, ... }

// Formatting examples
formatINR(150000);                                    // "₹1,50,000.00"
formatINR(1250000, { style: 'compact-indian' });     // "₹12.5L"
formatINR(23000000, { style: 'compact-indian' });    // "₹2.3Cr"
formatINR(-1234.5, { sign: 'accounting' });          // "(₹1,234.50)"
formatINR(150000, { ascii: true });                  // "Rs 1,50,000.00"
```

## API Reference

### parseINR(input, options?)

Parses Indian currency strings into numbers with detailed metadata.

```typescript
function parseINR(input: string, opts?: ParseOptions): ParseOutput

interface ParseOptions {
  allowMetricUnits?: boolean; // Allow k/m/b units (default: false)
  maxLen?: number;            // Max input length guard (default: 200)
}

type ParseOutput = ParseOk | ParseErr

interface ParseOk {
  kind: 'ok';
  value: number;              // Parsed rupees value (may have decimals for paise)
  negative: boolean;          // True if negative sign/parentheses detected
  detected: {
    currency?: 'INR';         // Present if ₹/Rs/INR markers found
    unit?: 'lakh' | 'crore' | null; // Highest unit detected
    raw: string;              // Original input
  };
}

interface ParseErr {
  kind: 'err';
  reason: 'empty' | 'invalid' | 'overflow' | 'nonfinite';
  at?: number;                // Optional character index where parsing failed
}
```

**Supported formats:**
- **Currency markers**: `₹`, `Rs`, `Rs.`, `INR`, `रु` (case-insensitive)
- **Units**: `cr`/`crs`/`crore`/`crores` (1e7), `l`/`lac`/`lacs`/`lakh`/`lakhs` (1e5)
- **Mixed units**: "2 cr 30 lakh", "1.5 crore 25 L"
- **Signs**: Leading `-`, `+`, or accounting parentheses `(₹1,234)`
- **Separators**: Commas, spaces, non-breaking spaces in any combination
- **Scientific notation**: "1e6 L", "2.3e-2 Cr" (when units present)

### formatINR(number, options?)

Formats numbers using Indian numbering system with various options.

```typescript
function formatINR(n: number, opts?: FormatOptions): string

interface FormatOptions {
  currency?: 'INR' | null;     // Currency symbol (default: 'INR' = ₹)
  ascii?: boolean;             // Use "Rs" instead of "₹" (default: false)
  decimals?: number;           // Fraction digits (default: 2)
  style?: 'standard' | 'compact-indian' | 'compact-metric';
  minCompact?: number;         // Min value for compact style (default: 1e5)
  spaceBetween?: boolean;      // "2 Cr" vs "2Cr" (default: false)
  sign?: 'auto' | 'always' | 'accounting'; // Negative formatting
}
```

**Style options:**
- **standard**: `₹1,23,45,678.90` (Indian grouping)
- **compact-indian**: `₹12.3L`, `₹2.3Cr` (Indian units)
- **compact-metric**: `₹1.2k`, `₹3.4m` (international units)

### Helper Functions

#### toIndianCompact(number, options?)

```typescript
function toIndianCompact(n: number, opts?: {
  decimals?: number;
  spaceBetween?: boolean;
}): string

toIndianCompact(1230000);     // "12.3L"
toIndianCompact(23000000);    // "2.3Cr"
```

#### fromIndianCompact(input)

```typescript
function fromIndianCompact(input: string): ParseOutput

fromIndianCompact('2.3 Cr'); // { kind: 'ok', value: 23000000, ... }
```

## Advanced Examples

### Error Handling

```typescript
const result = parseINR('invalid input');
if (result.kind === 'err') {
  console.log(`Parse error: ${result.reason}`);
  if (result.at !== undefined) {
    console.log(`Error at position: ${result.at}`);
  }
} else {
  console.log(`Parsed value: ${result.value}`);
}
```

### Round-trip Processing

```typescript
// Parse user input, then format for display
const userInput = "2 cr 30 lakh";
const parsed = parseINR(userInput);

if (parsed.kind === 'ok') {
  const formatted = formatINR(parsed.value, { 
    style: 'compact-indian',
    spaceBetween: true 
  });
  console.log(formatted); // "₹2.3 Cr"
}
```

### Custom Formatting

```typescript
// ASCII-friendly accounting format
formatINR(-150000, {
  ascii: true,
  sign: 'accounting',
  decimals: 0
}); // "(Rs 1,50,000)"

// Compact with custom threshold
formatINR(75000, {
  style: 'compact-indian',
  minCompact: 50000,
  spaceBetween: true
}); // "₹0.75 L"
```

### Working with Mixed Units

```typescript
// Parse complex mixed unit expressions
parseINR('₹2 crore 50 lakh 75 thousand'); // Not supported - use "2.505 cr"
parseINR('₹2.505 cr');                   // { kind: 'ok', value: 25050000, ... }

// Mixed units are limited to crore + lakh combinations
parseINR('1 cr 50 lakh');    // ✅ { kind: 'ok', value: 15000000, ... }
parseINR('50 lakh 25 thousand'); // ❌ { kind: 'err', reason: 'invalid' }
```

## Use Cases

### E-commerce & Fintech
```typescript
// Parse user input in investment calculator
const userInput = "2.5 cr";
const investment = parseINR(userInput);
if (investment.kind === 'ok') {
  const returns = investment.value * 0.12; // 12% returns
  console.log(`Annual returns: ${formatINR(returns, { style: 'compact-indian' })}`);
}
```

### Data Import/Export
```typescript
// Normalize CSV data containing mixed INR formats
const csvData = ["Rs 1,50,000", "2.3Cr", "₹45L"];
const normalized = csvData
  .map(parseINR)
  .filter(result => result.kind === 'ok')
  .map(result => result.value);
```

### Content Processing
```typescript
// Clean scraped financial data
const scrapedText = "Property value: ₹2 crore 30 lakh";
const match = scrapedText.match(/₹[\d\s,cr lakh]+/i);
if (match) {
  const parsed = parseINR(match[0]);
  if (parsed.kind === 'ok') {
    console.log(`Standardized: ${formatINR(parsed.value)}`);
  }
}
```

## Browser Support

Works in all modern browsers and Node.js 18+. Uses `Intl.NumberFormat` when available, with automatic fallback for environments without internationalization support.

## Performance

- **Parsing**: ~1M operations/second
- **Formatting**: ~500K operations/second
- **Bundle size**: ~3.4KB minified + gzipped
- **Memory**: Zero-copy string parsing, minimal allocations

## Comparison with Alternatives

| Feature | indian-money | Intl.NumberFormat | Other libraries |
|---------|-------------|------------------|----------------|
| Parse INR strings | ✅ | ❌ | Limited |
| Indian formatting | ✅ | ✅ | Limited |
| Lakh/Crore units | ✅ | ❌ | Some |
| Mixed units ("2 cr 30 lakh") | ✅ | ❌ | ❌ |
| TypeScript support | ✅ | ✅ | Varies |
| Bundle size | 3.4KB | 0KB (built-in) | Varies |
| Zero dependencies | ✅ | ✅ | ❌ |

## Contributing

Contributions welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and submit pull requests to our [GitHub repository](https://github.com/naveenbhavnani/indian-money).

## License

MIT License. See [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.