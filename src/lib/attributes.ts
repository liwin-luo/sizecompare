/**
 * Attribute system — what can be compared about an object.
 *
 * Four families with different honest visualizations:
 *   linear → true-scale side-by-side (ScaleCanvas)
 *   weight → proportional horizontal bars  (WeightBars)
 *   volume → spheres with radius ∝ ∛V      (VolumeSpheres)
 *   area   → squares with side ∝ √A        (AreaSquares)
 */

import {
  autoAreaUnit,
  autoMassUnit,
  autoMetricUnit,
  autoVolumeUnit,
  formatAreaMm2,
  formatImperialArea,
  formatImperialHeight,
  formatImperialVolume,
  formatImperialWeight,
  formatMassG,
  formatMm,
  formatVolMl,
  type UnitSystem,
} from './units';

export type LinearAttr = 'height' | 'length' | 'width' | 'diameter';
export type AttributeKey = LinearAttr | 'weight' | 'volume' | 'area';

export type AttributeFamily = 'linear' | 'weight' | 'volume' | 'area';

export const LINEAR_ATTRS: LinearAttr[] = ['height', 'length', 'width', 'diameter'];

/** Canonical display order for attribute tabs. */
export const ALL_ATTRS: AttributeKey[] = [
  'height',
  'length',
  'width',
  'diameter',
  'weight',
  'volume',
  'area',
];

export const ATTRIBUTE_FAMILY: Record<AttributeKey, AttributeFamily> = {
  height: 'linear',
  length: 'linear',
  width: 'linear',
  diameter: 'linear',
  weight: 'weight',
  volume: 'volume',
  area: 'area',
};

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  height: 'Height',
  length: 'Length',
  width: 'Width',
  diameter: 'Diameter',
  weight: 'Weight',
  volume: 'Volume',
  area: 'Area',
};

/** Comparison word for answer sentences ("is about 2× … than"). */
const COMPARATIVE_WORD: Record<AttributeKey, string> = {
  height: 'taller',
  length: 'longer',
  width: 'wider',
  diameter: 'wider',
  weight: 'heavier',
  volume: 'larger',
  area: 'larger',
};

export function attrFamily(attr: AttributeKey): AttributeFamily {
  return ATTRIBUTE_FAMILY[attr];
}

/** Internal base unit for an attribute family. */
export function attrBaseUnit(attr: AttributeKey): 'mm' | 'g' | 'ml' | 'mm²' {
  switch (attrFamily(attr)) {
    case 'weight':
      return 'g';
    case 'volume':
      return 'ml';
    case 'area':
      return 'mm²';
    default:
      return 'mm';
  }
}

/**
 * Attributes that EVERY given object set shares (intersection),
 * in canonical display order. Objects that measure different things
 * may share nothing — callers must show an explicit empty state.
 */
export function sharedAttributes(perObject: AttributeKey[][]): AttributeKey[] {
  if (perObject.length === 0) return [];
  const counts = new Map<AttributeKey, number>();
  for (const list of perObject) {
    for (const attr of new Set(list)) counts.set(attr, (counts.get(attr) ?? 0) + 1);
  }
  return ALL_ATTRS.filter((attr) => counts.get(attr) === perObject.length);
}

/** Format a base-unit value for display in the given unit system. */
export function formatAttrValue(attr: AttributeKey, baseValue: number, system: UnitSystem): string {
  switch (attrFamily(attr)) {
    case 'weight':
      return system === 'metric'
        ? formatMassG(baseValue, autoMassUnit(baseValue))
        : formatImperialWeight(baseValue);
    case 'volume':
      return system === 'metric'
        ? formatVolMl(baseValue, autoVolumeUnit(baseValue))
        : formatImperialVolume(baseValue);
    case 'area':
      return system === 'metric'
        ? formatAreaMm2(baseValue, autoAreaUnit(baseValue))
        : formatImperialArea(baseValue);
    default:
      return system === 'metric'
        ? formatMm(baseValue, autoMetricUnit(baseValue))
        : formatImperialHeight(baseValue);
  }
}

/** Sentence fragment describing how much bigger `ratio` makes A than B. */
export function ratioPhrase(attr: AttributeKey, ratio: number): string {
  if (ratio < 1.05) return 'about the same size as';
  if (attr === 'volume') return `about ${niceRatio(ratio)}× the volume of`;
  if (attr === 'area') return `about ${niceRatio(ratio)}× the area of`;
  return `about ${niceRatio(ratio)}× ${COMPARATIVE_WORD[attr]} than`;
}

function niceRatio(ratio: number): string {
  return ratio.toFixed(ratio < 10 ? 1 : 0);
}
