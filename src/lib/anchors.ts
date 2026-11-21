/**
 * Reference anchors — a familiar object pinned into every comparison so
 * raw numbers get a human-scale meaning ("≈ 29 adults tall").
 *
 * One default anchor per attribute where a human-scale reference exists.
 * `area` deliberately has NO default: real-world areas span ten orders of
 * magnitude (A4 paper 0.06 m² → countries 9.6e12 m²), so no single anchor
 * is useful across the range — the Studio offers Football pitch and A4
 * paper as pickable options instead.
 */

import type { AttributeKey } from './attributes';
import { OBJECT_LIBRARY, LIBRARY_BY_ID } from '../data/library';
import { objectAttrs } from './objects';
import type { ComparisonObject } from './objects';

export const DEFAULT_ANCHORS: Partial<Record<AttributeKey, string>> = {
  height: 'adult',
  length: 'bus',
  width: 'creditcard',
  diameter: 'basketball',
  weight: 'bottle',
  volume: 'sodacan',
  lifespan: 'adult',
  speed: 'adult',
};

/** Neutral grey used to render the anchor in every canvas. */
export const ANCHOR_COLOR = '#94a3b8';

/** Darker slate for the anchor's dashed marker border (image-backed items). */
export const ANCHOR_BORDER = '#64748b';

export interface AnchorChoice {
  enabled: boolean;
  /** null = follow the per-attribute default. */
  id: string | null;
}

/**
 * Resolve the effective anchor object for the active attribute, or null
 * (anchor off, unknown object, or the object lacks the attribute).
 * `choice` undefined ≡ { enabled: true, id: null } — the studio default
 * is anchor-on; only an explicit { enabled: false } (or a preloaded
 * curated pair) turns it off.
 */
export function resolveAnchor(
  attr: AttributeKey | null,
  choice: AnchorChoice | undefined,
): ComparisonObject | null {
  if (!attr) return null;
  const enabled = choice?.enabled ?? true;
  if (!enabled) return null;
  const id = choice?.id ?? DEFAULT_ANCHORS[attr] ?? null;
  const record = id ? LIBRARY_BY_ID[id] : undefined;
  if (!record) return null;
  const obj: ComparisonObject = { kind: 'library', record };
  return objectAttrs(obj).includes(attr) ? obj : null;
}

/** Library objects that carry the attribute, default anchor first. */
export function anchorOptions(attr: AttributeKey | null): { id: string; name: string; isDefault: boolean }[] {
  if (!attr) return [];
  const def = DEFAULT_ANCHORS[attr] ?? null;
  const options = OBJECT_LIBRARY.filter((r) =>
    objectAttrs({ kind: 'library', record: r }).includes(attr),
  ).map((r) => ({ id: r.id, name: r.name, isDefault: r.id === def }));
  options.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
  return options;
}
