/**
 * Unit conversion — the single source of numeric truth.
 *
 * Every measurement in the app is stored internally in millimetres.
 * Display units are derived views only; converting never mutates the
 * underlying value. Factors for in/ft are exact by international
 * definition (1 in = 25.4 mm).
 */

export type Unit = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export type UnitSystem = 'metric' | 'imperial';

/** Metric system uses m for large values, cm mid, mm small — chosen at display time. */
export const DISPLAY_UNITS: Record<UnitSystem, Unit[]> = {
  metric: ['mm', 'cm', 'm'],
  imperial: ['in', 'ft'],
};

export const UNIT_LABELS: Record<Unit, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  in: 'in',
  ft: 'ft',
};

/** Exact conversion factors to millimetres. */
export const FACTORS_MM: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
};

/** Sensible input bounds (in mm): 0.1 mm grain of rice … 10 km Golden Gate Bridge. */
export const MIN_MM = 0.1;
export const MAX_MM = 10_000_000;

export function toMm(value: number, unit: Unit): number {
  return value * FACTORS_MM[unit];
}

export function fromMm(mm: number, unit: Unit): number {
  return mm / FACTORS_MM[unit];
}

export function convert(value: number, from: Unit, to: Unit): number {
  return fromMm(toMm(value, from), to);
}

/** Trim trailing zeros from a fixed-precision number string. */
function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}

/** Default fraction digits per unit for readable classroom labels. */
const DEFAULT_DIGITS: Record<Unit, number> = {
  mm: 0,
  cm: 1,
  m: 2,
  in: 1,
  ft: 2,
};

/** Format an internal mm value in a display unit, e.g. 1828.8 → "6 ft". */
export function formatMm(
  mm: number,
  unit: Unit,
  maxFractionDigits?: number,
): string {
  const digits = maxFractionDigits ?? DEFAULT_DIGITS[unit];
  return `${trimZeros(fromMm(mm, unit).toFixed(digits))} ${UNIT_LABELS[unit]}`;
}

/**
 * Imperial convention for heights/lengths of everyday scale:
 * 1737.36 mm → "5 ft 8 in". Values under 1 ft render as inches only.
 * Falls back to plain feet beyond 99 ft (no yard/mile formatting).
 */
export function formatImperialHeight(mm: number): string {
  if (mm < FACTORS_MM.ft) return formatMm(mm, 'in');
  const totalInches = fromMm(mm, 'in');
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  if (inches === 12) return `${feet + 1} ft`;
  if (inches === 0) return `${feet} ft`;
  return `${feet} ft ${inches} in`;
}

/**
 * Parse "5'8"" / "5 ft 8 in" / "5ft8" style input into mm.
 * Returns null when the string doesn't match the feet-inches pattern —
 * callers then fall back to plain numeric parsing.
 */
export function parseFeetInches(raw: string): number | null {
  const m = raw
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)\s*(\d+(?:\.\d+)?)?\s*(?:"|in|inch|inches)?$/i);
  if (!m) return null;
  const feet = parseFloat(m[1]);
  const inches = m[2] ? parseFloat(m[2]) : 0;
  if (!Number.isFinite(feet) || !Number.isFinite(inches)) return null;
  return toMm(feet, 'ft') + toMm(inches, 'in');
}

export interface ParseResult {
  ok: boolean;
  mm?: number;
  error?: string;
}

/**
 * Validate and normalise user-entered measurements.
 * Zero, negative, non-finite and out-of-bound values are rejected with a
 * message that is safe to show in the UI.
 */
export function parseMeasurement(raw: string, unit: Unit): ParseResult {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Enter a measurement.' };

  const bounds = (mm: number): ParseResult => {
    if (mm < MIN_MM) {
      return { ok: false, error: 'That measurement is too small to draw (minimum 0.1 mm).' };
    }
    if (mm > MAX_MM) {
      return { ok: false, error: 'That measurement is too large (maximum 10,000 m).' };
    }
    return { ok: true, mm };
  };

  const numeric = Number(text.replace(/,/g, ''));
  if (Number.isFinite(numeric) && text !== '') {
    if (numeric <= 0) {
      return { ok: false, error: 'Measurement must be greater than zero.' };
    }
    return bounds(toMm(numeric, unit));
  }

  // Not plain numeric — try "5'8"" / "5 ft 8 in" before giving up.
  const ftIn = parseFeetInches(text);
  if (ftIn !== null && ftIn > 0) return bounds(ftIn);

  return { ok: false, error: 'Enter a number, e.g. 30 or 7.5.' };
}

/** Pick a comfortable metric display unit for a magnitude (mm → cm → m). */
export function autoMetricUnit(mm: number): Unit {
  if (mm < 10) return 'mm';
  if (mm < 1000) return 'cm';
  return 'm';
}
