/**
 * Unit conversion — the single source of numeric truth.
 *
 * Every measurement is stored internally in one base unit per family:
 *   linear (height/length/width/diameter) → millimetres
 *   weight                                → grams
 *   volume                                → millilitres (= cm³)
 *   area                                  → square millimetres
 * Display units are derived views; converting never mutates base values.
 * Imperial factors are exact by international definition.
 */

export type Unit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft';
export type MassUnit = 'g' | 'kg' | 't' | 'oz' | 'lb' | 'ton';
export type VolumeUnit = 'ml' | 'l' | 'm³' | 'floz' | 'gal';
export type AreaUnit = 'mm²' | 'cm²' | 'm²' | 'km²' | 'sq ft' | 'sq mi';

export type UnitSystem = 'metric' | 'imperial';

export const UNIT_LABELS: Record<Unit, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  km: 'km',
  in: 'in',
  ft: 'ft',
};

export const MASS_LABELS: Record<MassUnit, string> = {
  g: 'g',
  kg: 'kg',
  t: 't',
  oz: 'oz',
  lb: 'lb',
  ton: 'ton',
};

export const VOLUME_LABELS: Record<VolumeUnit, string> = {
  ml: 'ml',
  l: 'l',
  'm³': 'm³',
  floz: 'fl oz',
  gal: 'gal',
};

export const AREA_LABELS: Record<AreaUnit, string> = {
  'mm²': 'mm²',
  'cm²': 'cm²',
  'm²': 'm²',
  'km²': 'km²',
  'sq ft': 'sq ft',
  'sq mi': 'sq mi',
};

/** Exact conversion factors to the base unit. */
export const FACTORS_MM: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  km: 1_000_000,
  in: 25.4,
  ft: 304.8,
};

export const FACTORS_G: Record<MassUnit, number> = {
  g: 1,
  kg: 1000,
  t: 1_000_000,
  oz: 28.349_523_125,
  lb: 453.59237,
  ton: 907_184.74, // US short ton = 2000 lb
};

export const FACTORS_ML: Record<VolumeUnit, number> = {
  ml: 1,
  l: 1000,
  'm³': 1_000_000,
  floz: 29.573_529_562_5, // US fluid ounce
  gal: 3785.411_784, // US liquid gallon
};

export const FACTORS_MM2: Record<AreaUnit, number> = {
  'mm²': 1,
  'cm²': 100,
  'm²': 1e6,
  'km²': 1e12,
  'sq ft': 92_903.04, // (304.8 mm)² — exact by definition
  'sq mi': 2_589_988.110_336e6, // (1,609.344 m)²
};

/** Sensible input bounds per family (in base units). */
export const MIN_MM = 0.1;
export const MAX_MM = 1e15; // 1e9 km — comfortably beyond the Sun
export const MIN_G = 0.001;
export const MAX_G = 1e30; // ~10 solar masses — everything on Earth is far below
export const MIN_ML = 0.1;
export const MAX_ML = 1e36; // ~1.4e18 km³ × 10⁴ — Sun is 1.41e33 ml
export const MIN_AREA_MM2 = 1e6; // 1 m² — nothing smaller is meaningfully compared
export const MAX_AREA_MM2 = 1e22; // 1e10 km² — beyond Earth's whole surface (5.1e8 km²)

/* ── linear ── */

export function toMm(value: number, unit: Unit): number {
  return value * FACTORS_MM[unit];
}
export function fromMm(mm: number, unit: Unit): number {
  return mm / FACTORS_MM[unit];
}
export function convert(value: number, from: Unit, to: Unit): number {
  return fromMm(toMm(value, from), to);
}

/* ── mass ── */

export function toG(value: number, unit: MassUnit): number {
  return value * FACTORS_G[unit];
}
export function fromG(g: number, unit: MassUnit): number {
  return g / FACTORS_G[unit];
}

/* ── volume ── */

export function toMl(value: number, unit: VolumeUnit): number {
  return value * FACTORS_ML[unit];
}
export function fromMl(ml: number, unit: VolumeUnit): number {
  return ml / FACTORS_ML[unit];
}

/* ── area ── */

export function toMm2(value: number, unit: AreaUnit): number {
  return value * FACTORS_MM2[unit];
}
export function fromMm2(mm2: number, unit: AreaUnit): number {
  return mm2 / FACTORS_MM2[unit];
}

/* ── formatting helpers ── */

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}

function fmt(value: number, digits: number): string {
  return trimZeros(value.toFixed(digits));
}

const LINEAR_DIGITS: Partial<Record<Unit, number>> = { mm: 0, cm: 1, m: 2, km: 2 };

/** Format an internal mm value in a display unit, e.g. 1828.8 → "6 ft". */
export function formatMm(mm: number, unit: Unit, maxFractionDigits?: number): string {
  const digits = maxFractionDigits ?? LINEAR_DIGITS[unit] ?? 1;
  return `${fmt(fromMm(mm, unit), digits)} ${UNIT_LABELS[unit]}`;
}

/**
 * Imperial convention for heights/lengths: 1737.36 mm → "5 ft 8 in".
 * Under 1 ft renders as inches; exact-foot values drop the inches part.
 */
export function formatImperialHeight(mm: number): string {
  if (mm < FACTORS_MM.ft) return `${fmt(fromMm(mm, 'in'), 1)} in`;
  const totalInches = fromMm(mm, 'in');
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  if (inches === 12) return `${feet + 1} ft`;
  if (inches === 0) return `${feet} ft`;
  return `${feet} ft ${inches} in`;
}

/** Parse "5'8"" / "5 ft 8 in" / "6ft" into mm. Null when not matching. */
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

function boundsCheck(value: number, min: number, max: number, maxLabel: string): ParseResult | null {
  if (value < min) return { ok: false, error: 'That value is too small to draw.' };
  if (value > max) return { ok: false, error: `That value is too large (maximum ${maxLabel}).` };
  return null;
}

/**
 * Validate and normalise a linear measurement. Accepts plain numbers,
 * comma groupings, and feet-inches strings ("5'4""). Rejects zero,
 * negative, non-finite and out-of-bound values with UI-safe messages.
 */
export function parseMeasurement(raw: string, unit: Unit): ParseResult {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Enter a measurement.' };

  const numeric = Number(text.replace(/,/g, ''));
  if (Number.isFinite(numeric) && text !== '') {
    if (numeric <= 0) return { ok: false, error: 'Measurement must be greater than zero.' };
    const mm = toMm(numeric, unit);
    return (
      boundsCheck(mm, MIN_MM, MAX_MM, '1,000,000 km') ?? { ok: true, mm }
    );
  }

  const ftIn = parseFeetInches(text);
  if (ftIn !== null && ftIn > 0) {
    return boundsCheck(ftIn, MIN_MM, MAX_MM, '1,000,000 km') ?? { ok: true, mm: ftIn };
  }
  return { ok: false, error: 'Enter a number, e.g. 30 or 7.5.' };
}

export interface MassParseResult {
  ok: boolean;
  g?: number;
  error?: string;
}

/** Validate a weight input in the given mass unit. */
export function parseMass(raw: string, unit: MassUnit): MassParseResult {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Enter a weight.' };
  const numeric = Number(text.replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return { ok: false, error: 'Enter a number, e.g. 75 or 0.5.' };
  if (numeric <= 0) return { ok: false, error: 'Weight must be greater than zero.' };
  const g = toG(numeric, unit);
  return boundsCheck(g, MIN_G, MAX_G, '10²¹ t') ?? { ok: true, g };
}

export interface VolumeParseResult {
  ok: boolean;
  ml?: number;
  error?: string;
}

/** Validate a volume input in the given volume unit. */
export function parseVolume(raw: string, unit: VolumeUnit): VolumeParseResult {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Enter a volume.' };
  const numeric = Number(text.replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return { ok: false, error: 'Enter a number, e.g. 500 or 2.5.' };
  if (numeric <= 0) return { ok: false, error: 'Volume must be greater than zero.' };
  const ml = toMl(numeric, unit);
  return boundsCheck(ml, MIN_ML, MAX_ML, '10³⁰ m³') ?? { ok: true, ml };
}

export interface AreaParseResult {
  ok: boolean;
  mm2?: number;
  error?: string;
}

/** Validate an area input in the given area unit. */
export function parseArea(raw: string, unit: AreaUnit): AreaParseResult {
  const text = raw.trim();
  if (text === '') return { ok: false, error: 'Enter an area.' };
  const numeric = Number(text.replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return { ok: false, error: 'Enter a number, e.g. 357600 or 9.6.' };
  if (numeric <= 0) return { ok: false, error: 'Area must be greater than zero.' };
  const mm2 = toMm2(numeric, unit);
  return (
    boundsCheck(mm2, MIN_AREA_MM2, MAX_AREA_MM2, '10 billion km²') ?? { ok: true, mm2 }
  );
}

/* ── auto display units ── */

/** Comfortable metric linear unit for a magnitude (mm → cm → m → km). */
export function autoMetricUnit(mm: number): Unit {
  if (mm < 10) return 'mm';
  if (mm < 1000) return 'cm';
  if (mm < 1_000_000) return 'm';
  return 'km';
}

/** Comfortable metric mass unit (g → kg → t). */
export function autoMassUnit(g: number): MassUnit {
  if (g < 1000) return 'g';
  if (g < 1_000_000) return 'kg';
  return 't';
}

/** Comfortable metric volume unit (ml → l → m³). */
export function autoVolumeUnit(ml: number): VolumeUnit {
  if (ml < 1000) return 'ml';
  if (ml < 1_000_000) return 'l';
  return 'm³';
}

/** Comfortable metric area unit (mm² → cm² → m² → km², km² from 0.1 km² up). */
export function autoAreaUnit(mm2: number): AreaUnit {
  if (mm2 < 100) return 'mm²';
  if (mm2 < 1e6) return 'cm²';
  if (mm2 < 1e11) return 'm²';
  return 'km²';
}

const MASS_DIGITS: Partial<Record<MassUnit, number>> = { g: 1, kg: 1, t: 1, oz: 1, lb: 1, ton: 1 };
const VOLUME_DIGITS: Partial<Record<VolumeUnit, number>> = {
  ml: 0,
  l: 1,
  'm³': 2,
  floz: 1,
  gal: 2,
};

/** Astronomic values (planets, stars) switch to scientific notation. */
function bigOr(value: number, digits: number): string {
  return value >= 1e7 ? value.toExponential(2) : fmt(value, digits);
}

export function formatMassG(g: number, unit: MassUnit, maxFractionDigits?: number): string {
  const digits = maxFractionDigits ?? MASS_DIGITS[unit] ?? 1;
  return `${bigOr(fromG(g, unit), digits)} ${MASS_LABELS[unit]}`;
}

export function formatVolMl(ml: number, unit: VolumeUnit, maxFractionDigits?: number): string {
  const digits = maxFractionDigits ?? VOLUME_DIGITS[unit] ?? 1;
  return `${bigOr(fromMl(ml, unit), digits)} ${VOLUME_LABELS[unit]}`;
}

/**
 * Imperial weight: under 1 lb → oz; under 10 lb → "lb + oz"; under 2000 lb
 * → plain lb; above → US short tons. (1609.6 g → "3 lb 8 oz".)
 */
export function formatImperialWeight(g: number): string {
  const totalLb = fromG(g, 'lb');
  if (totalLb < 1) return `${fmt(fromG(g, 'oz'), 1)} oz`;
  if (totalLb < 10) {
    const lb = Math.floor(totalLb);
    const oz = Math.round(fromG(g - toG(lb, 'lb'), 'oz'));
    if (oz === 16) return `${lb + 1} lb`;
    if (oz === 0) return `${lb} lb`;
    return `${lb} lb ${oz} oz`;
  }
  if (totalLb < 2000) return `${fmt(totalLb, totalLb < 100 ? 1 : 0)} lb`;
  return `${fmt(fromG(g, 'ton'), 1)} ton`;
}

/** Imperial volume: under 1 quart → fl oz (1 decimal); above → US gallons. */
export function formatImperialVolume(ml: number): string {
  const floz = fromMl(ml, 'floz');
  if (floz < 32) return `${fmt(floz, 1)} fl oz`;
  return `${fmt(fromMl(ml, 'gal'), fromMl(ml, 'gal') < 10 ? 2 : 1)} gal`;
}

/* ── area formatting ── */

/** Area magnitudes are place-scale (9,596,960 km²) — keep them readable with separators. */
function fmtGroup(value: number, digits: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/**
 * Format an internal mm² value in a display area unit. Country-scale values
 * carry thousands separators; sub-10 values keep two decimals (0.49 km²).
 */
export function formatAreaMm2(mm2: number, unit: AreaUnit, maxFractionDigits?: number): string {
  const display = fromMm2(mm2, unit);
  let digits = maxFractionDigits;
  if (digits === undefined) {
    if (unit === 'km²' || unit === 'sq mi') digits = display < 10 ? 2 : display < 100 ? 1 : 0;
    else if (unit === 'm²' || unit === 'sq ft') digits = display < 1000 ? 1 : 0;
    else digits = unit === 'cm²' ? 1 : 0;
  }
  return `${fmtGroup(display, digits)} ${AREA_LABELS[unit]}`;
}

/** Imperial area: under 1 sq mi → sq ft; above → square miles. */
export function formatImperialArea(mm2: number): string {
  if (mm2 < FACTORS_MM2['sq mi']) {
    const sqft = fromMm2(mm2, 'sq ft');
    return `${fmtGroup(sqft, sqft < 1000 ? 1 : 0)} sq ft`;
  }
  const sqmi = fromMm2(mm2, 'sq mi');
  return `${fmtGroup(sqmi, sqmi < 10 ? 2 : sqmi < 100 ? 1 : 0)} sq mi`;
}
