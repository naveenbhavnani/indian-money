import { ParseOptions, ParseOutput } from './types.js';

const RX = {
  currency: /^(₹|rs\.?|inr|रु)/i,
  sep: /[\s\u00A0,]+/g,
};

const UNIT_MULT: Record<string, number> = {
  cr: 1e7,
  crs: 1e7,
  crore: 1e7,
  crores: 1e7,
  l: 1e5,
  lac: 1e5,
  lacs: 1e5,
  lakh: 1e5,
  lakhs: 1e5,
  // Metric units (optional)
  k: 1e3,
  m: 1e6,
  b: 1e9,
};

function parseNumberLoose(s: string): number {
  const cleaned = s.replace(/[\s,\u00A0]+/g, '');
  return Number(cleaned);
}

export function parseINR(
  input: string,
  opts: ParseOptions = {}
): ParseOutput {
  let s = input?.trim() ?? '';
  if (!s) return { kind: 'err', reason: 'empty' };

  const maxLen = opts.maxLen ?? 200;
  if (s.length > maxLen) {
    return { kind: 'err', reason: 'invalid' };
  }

  let negative = false;

  // Check for accounting parentheses
  if (/^\(/.test(s) && /\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }

  // Check for leading sign
  if (/^[-+]/.test(s)) {
    negative = s[0] === '-' || negative;
    s = s.slice(1).trim();
  }

  let detectedCurrency: 'INR' | undefined;
  // Strip currency marker
  s = s
    .replace(RX.currency, () => {
      detectedCurrency = 'INR';
      return '';
    })
    .trim();

  // Normalize separators: replace commas with spaces, collapse whitespace
  s = s.replace(/,/g, ' ').replace(/[\s\u00A0]+/g, ' ').trim();

  // Try mixed units first: "X cr Y lakh"
  let m = s.match(
    /^([0-9]+(?:\s[0-9]+)*(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)\s*(cr(?:s)?|crores?)\s+([0-9]+(?:\s[0-9]+)*(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)\s*(l(?:acs?)?|lakhs?)$/i
  );
  if (m) {
    const x = parseNumberLoose(m[1]!);
    const y = parseNumberLoose(m[3]!);
    const v = x * 1e7 + y * 1e5;

    if (!Number.isFinite(v)) {
      return { kind: 'err', reason: 'nonfinite' };
    }
    if (Math.abs(v) > Number.MAX_SAFE_INTEGER) {
      return { kind: 'err', reason: 'overflow' };
    }

    return {
      kind: 'ok',
      value: negative ? -v : v,
      negative,
      detected: {
        currency: detectedCurrency,
        unit: 'crore',
        raw: input,
      },
    };
  }

  // Try scalar × unit: "X cr|lakh|lac|l" (and optionally k/m/b)
  const unitPattern = opts.allowMetricUnits
    ? /^([0-9]+(?:\s[0-9]+)*(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)\s*(cr(?:s)?|crores?|l(?:acs?)?|lakhs?|k|m|b)$/i
    : /^([0-9]+(?:\s[0-9]+)*(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)\s*(cr(?:s)?|crores?|l(?:acs?)?|lakhs?)$/i;

  m = s.match(unitPattern);
  if (m) {
    const x = parseNumberLoose(m[1]!);
    const u = m[2]!.toLowerCase();

    // Determine unit key
    let unitKey: string;
    let detectedUnit: 'lakh' | 'crore' | null = null;

    if (u.startsWith('cr') || u === 'crore' || u === 'crores') {
      unitKey = 'crore';
      detectedUnit = 'crore';
    } else if (u === 'l' || u.startsWith('lac') || u.startsWith('lak')) {
      unitKey = u.startsWith('lak') ? 'lakh' : u.startsWith('lac') ? 'lac' : 'l';
      detectedUnit = 'lakh';
    } else if (opts.allowMetricUnits && (u === 'k' || u === 'm' || u === 'b')) {
      unitKey = u;
      detectedUnit = null; // Metric units don't map to Indian units
    } else {
      return { kind: 'err', reason: 'invalid' };
    }

    const mult = UNIT_MULT[unitKey];
    if (!mult) {
      return { kind: 'err', reason: 'invalid' };
    }

    const v = x * mult;

    if (!Number.isFinite(v)) {
      return { kind: 'err', reason: 'nonfinite' };
    }
    if (Math.abs(v) > Number.MAX_SAFE_INTEGER) {
      return { kind: 'err', reason: 'overflow' };
    }

    return {
      kind: 'ok',
      value: negative ? -v : v,
      negative,
      detected: {
        currency: detectedCurrency,
        unit: detectedUnit,
        raw: input,
      },
    };
  }

  // Try plain number
  const v = parseNumberLoose(s);
  if (!Number.isFinite(v)) {
    return { kind: 'err', reason: 'invalid' };
  }

  return {
    kind: 'ok',
    value: negative ? -v : v,
    negative,
    detected: {
      currency: detectedCurrency,
      unit: null,
      raw: input,
    },
  };
}