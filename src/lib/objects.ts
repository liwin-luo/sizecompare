/**
 * Object data model — accuracy is the product.
 *
 * Library objects carry full provenance (measurement context, source,
 * checked date, uncertainty). Custom objects are user-entered and carry no
 * source claims. Every drawn value flows from one of these records, so a
 * teacher can always answer "where does that number come from?".
 */

import { MAX_MM, MIN_MM, type Unit } from './units';

export type DimensionType = 'height' | 'length' | 'width' | 'diameter';

/** Which silhouette axis the measured value drives. */
export type MeasureAxis = 'vertical' | 'horizontal' | 'both';

export type Category = 'classroom' | 'everyday' | 'animal' | 'reference';

/** Human-readable label per dimension, used on canvas + warnings. */
export const DIMENSION_LABELS: Record<DimensionType, string> = {
  height: 'Height',
  length: 'Length',
  width: 'Width',
  diameter: 'Diameter',
};

export interface ObjectRecord {
  /** Stable library id, e.g. 'animal-elephant-african'. */
  id: string;
  name: string;
  category: Category;
  dimension_type: DimensionType;
  /** Representative value in mm (internal truth). */
  value_mm: number;
  /** Natural variation or estimate range, mm — optional. */
  min_mm?: number;
  max_mm?: number;
  /** Unit of the cited source figure (display in library details). */
  source_unit: Unit;
  /** What exactly was measured, e.g. 'shoulder height, adult female'. */
  measurement_context: string;
  source_url: string;
  source_name: string;
  /** ISO date the source was last checked. */
  checked_at: string;
  uncertainty_note?: string;
  /** Key into the silhouette registry (src/components/tool/silhouettes.tsx). */
  silhouette: string;
  image_license: 'original-CC0';
  attribution: string;
  /* Visual placement */
  aspect: number;
  axis: MeasureAxis;
}

/** User-entered object — no provenance claims, always allowed. */
export interface CustomObject {
  id: string;
  name: string;
  dimension_type: DimensionType;
  value_mm: number;
  color: string;
}

export type ComparisonObject =
  | { kind: 'library'; record: ObjectRecord }
  | { kind: 'custom'; record: CustomObject };

export interface NameValidation {
  ok: boolean;
  error?: string;
}

export function validateName(raw: string): NameValidation {
  const name = raw.trim();
  if (name === '') return { ok: false, error: 'Give the object a name.' };
  if (name.length > 60) return { ok: false, error: 'Keep the name under 60 characters.' };
  return { ok: true };
}

export interface ValueValidation {
  ok: boolean;
  error?: string;
}

/** Bounds-check an mm value coming from any input path. */
export function validateValueMm(mm: number): ValueValidation {
  if (!Number.isFinite(mm)) return { ok: false, error: 'Enter a number.' };
  if (mm <= 0) return { ok: false, error: 'Measurement must be greater than zero.' };
  if (mm < MIN_MM) return { ok: false, error: 'Too small to draw (minimum 0.1 mm).' };
  if (mm > MAX_MM) return { ok: false, error: 'Too large (maximum 10,000 m).' };
  return { ok: true };
}

export type DimensionCheck =
  | { status: 'ok' }
  | { status: 'warn'; message: string };

/**
 * Can these dimensions share one honest scale?
 *
 * Identical dimensions always pass. Mixing height with length (or width)
 * draws a mixed-dimension warning — it is allowed, because lessons like
 * "elephant body length vs. a child's height" are legitimate, but the
 * canvas must label each object's own dimension. Diameter mixes with
 * width/length as a span comparison; mixing it with height warns.
 */
const MIX_WARN_BASE =
  'This comparison mixes measurement types. Each object shows its own measured dimension — make sure the comparison makes sense for your lesson.';

export function checkDimensionMix(types: DimensionType[]): DimensionCheck {
  const unique = [...new Set(types)];
  if (unique.length <= 1) return { status: 'ok' };

  const has = (t: DimensionType) => unique.includes(t);
  const spansOk =
    !has('height') && unique.every((t) => t === 'diameter' || t === 'length' || t === 'width');

  if (unique.length === 2 && has('diameter') && has('width')) return { status: 'ok' };
  if (spansOk) return { status: 'ok' };

  const names = unique.map((t) => DIMENSION_LABELS[t].toLowerCase()).join(' vs. ');
  return { status: 'warn', message: `${MIX_WARN_BASE} (Mixing ${names}.)` };
}

/** Uniform accessor used by the renderer and export paths. */
export function objectValueMm(obj: ComparisonObject): number {
  return obj.record.value_mm;
}

export function objectDimension(obj: ComparisonObject): DimensionType {
  return obj.record.dimension_type;
}

export function objectName(obj: ComparisonObject): string {
  return obj.record.name;
}

/** Short provenance line shown under canvas labels and on printouts. */
export function objectSourceLine(obj: ComparisonObject): string | null {
  if (obj.kind === 'custom') return 'Custom measurement';
  const r = obj.record;
  const range =
    r.min_mm != null && r.max_mm != null ? ` (range ${r.min_mm}–${r.max_mm} mm)` : '';
  return `${r.source_name}${range} · ${r.measurement_context}`;
}
