export type ParseOk = {
  kind: 'ok';
  /** Parsed numeric rupees value (may have decimals for paise) */
  value: number;
  /** True if a negative sign/parentheses were detected */
  negative: boolean;
  /** What we recognized during parsing */
  detected: {
    currency?: 'INR' | undefined; // present if we saw ₹/Rs/INR markers
    unit?: 'lakh' | 'crore' | null; // highest unit detected
    raw: string; // original input
  };
};

export type ParseErr = {
  kind: 'err';
  reason: 'empty' | 'invalid' | 'overflow' | 'nonfinite';
  at?: number; // optional character index where we gave up
};

export type ParseOutput = ParseOk | ParseErr;

export interface FormatOptions {
  /** Adds currency symbol. null to suppress. Default: "INR" (₹) */
  currency?: 'INR' | null;
  /** If true, use ASCII-friendly prefix "Rs" instead of "₹" */
  ascii?: boolean;
  /** Max fraction digits. Default: 2 */
  decimals?: number;
  /**
   * standard: 1,23,45,678.90
   * compact-indian: 12.3L, 2.3Cr
   * compact-metric: 1.2k, 3.4m (optional future use, v1 kept for symmetry)
   */
  style?: 'standard' | 'compact-indian' | 'compact-metric';
  /** Minimum absolute value at which we switch to compact style. Default: 1e5 for compact-indian */
  minCompact?: number;
  /** "2 Cr" vs "2Cr". Default: false */
  spaceBetween?: boolean;
  /** Negative sign style */
  sign?: 'auto' | 'always' | 'accounting'; // accounting => (₹1,234.50)
}

export interface ParseOptions {
  /**
   * If true, allow metric units (k/m/b) as aliases: k=1e3, m=1e6, b=1e9.
   * Default: false (India-first; add later if requested by users)
   */
  allowMetricUnits?: boolean;
  /** Maximum input length to guard against pathological inputs. Default: 200 */
  maxLen?: number;
}