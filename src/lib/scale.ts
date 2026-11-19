/**
 * True-scale layout engine.
 *
 * One comparison = one scale factor (px per mm) shared by every object.
 * Silhouette aspect ratios are locked: the measured axis is driven by the
 * real value, the perpendicular axis follows the aspect ratio. Nothing is
 * ever stretched independently along X and Y.
 *
 * When the size ratio is extreme (e.g. mouse vs. blue whale) the small
 * object legitimately becomes tiny — we surface a warning instead of
 * secretly inflating it, because breaking scale would mislead students.
 */

import type { MeasureAxis } from './objects';

export interface LayoutItem {
  /** Real measured value in mm (the axis being compared). */
  valueMm: number;
  /** Silhouette width / height, unitless, always > 0. */
  aspect: number;
  /** Which silhouette axis the value drives. */
  axis: MeasureAxis;
}

export interface PlacedItem {
  index: number;
  /** Top-left of the bounding box, px. */
  x: number;
  y: number;
  /** Drawn size, px — proportional to real mm via `scale`. */
  w: number;
  h: number;
}

export interface Layout {
  /** px per mm — identical for every object in the comparison. */
  scale: number;
  items: PlacedItem[];
  /** Y coordinate of the shared ground line objects stand on. */
  baselineY: number;
}

export interface Box {
  width: number;
  height: number;
}

/** Beyond this max/min ratio the smallest object stops being readable. */
export const EXTREME_RATIO = 120;

/** Below this drawn size (px) an object is effectively invisible. */
export const MIN_READABLE_PX = 6;

export class ScaleError extends Error {}

/** Per-unit-S footprint of an item on each axis (px at S = 1). */
function footprint(item: LayoutItem): { wPer: number; hPer: number } {
  if (item.valueMm <= 0 || !Number.isFinite(item.valueMm)) {
    throw new ScaleError('Object measurement must be a positive number.');
  }
  if (!Number.isFinite(item.aspect) || item.aspect <= 0) {
    throw new ScaleError('Object aspect ratio must be a positive number.');
  }
  switch (item.axis) {
    case 'vertical':
      return { wPer: item.valueMm * item.aspect, hPer: item.valueMm };
    case 'horizontal':
      return { wPer: item.valueMm, hPer: item.valueMm / item.aspect };
    case 'both':
      return { wPer: item.valueMm, hPer: item.valueMm };
  }
}

/**
 * Lay objects out side by side on a shared ground line, all at one scale.
 * `padding` clears the canvas edges; `gap` separates neighbouring objects.
 */
export function computeLayout(
  items: LayoutItem[],
  box: Box,
  padding = 24,
  gap = 24,
): Layout {
  if (items.length === 0) throw new ScaleError('At least one object is required.');

  const feet = items.map(footprint);
  const totalWPer = feet.reduce((sum, f) => sum + f.wPer, 0);
  const maxHPer = Math.max(...feet.map((f) => f.hPer));

  const availW = Math.max(box.width - padding * 2 - gap * (items.length - 1), 1);
  const availH = Math.max(box.height - padding * 2, 1);

  const scale = Math.min(availW / totalWPer, availH / maxHPer);

  const baselineY = box.height - padding;
  const usedW = feet.reduce((sum, f) => sum + f.wPer * scale, 0) + gap * (items.length - 1);
  let x = padding + Math.max((box.width - padding * 2 - usedW) / 2, 0);

  const placed: PlacedItem[] = feet.map((f, index) => {
    const w = f.wPer * scale;
    const h = f.hPer * scale;
    const item: PlacedItem = { index, x, y: baselineY - h, w, h };
    x += w + gap;
    return item;
  });

  return { scale, items: placed, baselineY };
}

export interface ScaleHealth {
  /** max value / min value. */
  ratio: number;
  /** Drawn size of the smallest object along its measured axis, px. */
  smallestPx: number;
  /** True when the comparison is honest but hard to read — warn the teacher. */
  extreme: boolean;
}

/** Assess readability of a comparison at a given scale (never alters it). */
export function assessScale(valuesMm: number[], scale: number): ScaleHealth {
  const clean = valuesMm.filter((v) => Number.isFinite(v) && v > 0);
  if (clean.length === 0) throw new ScaleError('No valid measurements to assess.');
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const smallestPx = min * scale;
  return {
    ratio: max / min,
    smallestPx,
    extreme: max / min > EXTREME_RATIO || smallestPx < MIN_READABLE_PX,
  };
}
