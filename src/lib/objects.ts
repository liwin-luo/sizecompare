/**
 * Object data model v2 — accuracy is the product.
 *
 * Each object carries a `measurements` map: every attribute it has is an
 * independent Measurement with its own provenance (context, source,
 * checked date, uncertainty). Base units per family: linear → mm,
 * weight → g, volume → ml. Custom objects carry a single user-entered
 * attribute and make no provenance claims.
 */

import { MIN_G, MIN_ML, MIN_MM } from './units';
import { ALL_ATTRS, ATTRIBUTE_FAMILY, type AttributeKey } from './attributes';

export type MeasureAxis = 'vertical' | 'horizontal' | 'both';

export type Category =
  | 'animal'
  | 'everyday'
  | 'food'
  | 'space'
  | 'building'
  | 'vehicle'
  | 'reference';

export interface Measurement {
  /** Representative value in the family's base unit (mm / g / ml). */
  value: number;
  /** Natural variation or estimate range, same base unit. */
  min?: number;
  max?: number;
  /** What exactly was measured, e.g. 'shoulder height, adult female'. */
  context: string;
  source_url: string;
  source_name: string;
  /** ISO date the source was last checked. */
  checked_at: string;
  uncertainty_note?: string;
}

export interface ObjectV2 {
  id: string;
  name: string;
  category: Category;
  /** Key into the silhouette registry (src/components/tool/silhouettes.tsx). */
  silhouette: string;
  /** Attributes this object actually has, each fully sourced. */
  measurements: Partial<Record<AttributeKey, Measurement>>;
  /** Silhouette width / height — drives perpendicular axis when rendering linear attrs. */
  aspect: number;
  /** Which silhouette axis a linear measurement drives. */
  axis: MeasureAxis;
  /** Attribute shown as the picker's default label. */
  primaryAttr: AttributeKey;
  image_license: 'original-CC0';
  attribution: string;
}

/** User-entered object — one attribute, no provenance claims. */
export interface CustomObject {
  id: string;
  name: string;
  attr: AttributeKey;
  /** Base-unit value (mm for linear, g for weight, ml for volume). */
  value: number;
  color: string;
}

export type ComparisonObject =
  | { kind: 'library'; record: ObjectV2 }
  | { kind: 'custom'; record: CustomObject };

export function hasAttr(obj: ComparisonObject, attr: AttributeKey): boolean {
  return objectValue(obj, attr) !== null;
}

/** Base-unit value for an attribute, or null when the object lacks it. */
export function objectValue(obj: ComparisonObject, attr: AttributeKey): number | null {
  if (obj.kind === 'custom') return obj.record.attr === attr ? obj.record.value : null;
  return obj.record.measurements[attr]?.value ?? null;
}

export function objectMeasurement(
  obj: ComparisonObject,
  attr: AttributeKey,
): Measurement | null {
  if (obj.kind === 'custom') return null;
  return obj.record.measurements[attr] ?? null;
}

export function objectName(obj: ComparisonObject): string {
  return obj.record.name;
}

/** Attributes the object has, in canonical order (see attributes.ALL_ATTRS). */
export function objectAttrs(obj: ComparisonObject): AttributeKey[] {
  if (obj.kind === 'custom') return [obj.record.attr];
  return ALL_ATTRS.filter((k) => obj.record.measurements[k] !== undefined);
}

/** Short provenance line for the given attribute (used on printouts). */
export function objectSourceLine(obj: ComparisonObject, attr: AttributeKey): string | null {
  if (obj.kind === 'custom') return 'Custom measurement';
  const m = obj.record.measurements[attr];
  if (!m) return null;
  const range =
    m.min != null && m.max != null ? ` (range ${m.min}–${m.max})` : '';
  return `${m.source_name}${range} · ${m.context}`;
}

/* ── validation ── */

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

export type AttrValidation = { ok: true } | { ok: false; error: string };

/** Bounds-check a base-unit value against its family's limits. */
export function validateAttrValue(attr: AttributeKey, base: number): AttrValidation {
  const family = ATTRIBUTE_FAMILY[attr];
  if (!Number.isFinite(base)) return { ok: false, error: 'Enter a number.' };
  if (base <= 0) return { ok: false, error: 'Value must be greater than zero.' };
  const min = family === 'weight' ? MIN_G : family === 'volume' ? MIN_ML : MIN_MM;
  if (base < min) return { ok: false, error: 'That value is too small to draw.' };
  return { ok: true };
}
