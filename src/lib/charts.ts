/**
 * Chart layout engines for weight and volume — pure math, no React.
 *
 * Weight bars: bar length is strictly proportional to real mass; no
 * truncated axes, no log scales. Volume spheres: radius ∝ ∛V so the
 * drawn RADIUS is honest for a 3-D quantity; the canvas must caption
 * this because 2-D area on screen is still not proportional.
 *
 * Like the linear engine, extreme ratios are reported — never hidden —
 * and nothing is ever inflated to look nicer.
 */

export interface Box {
  width: number;
  height: number;
}

export class ChartError extends Error {}

/* ── weight bars ── */

export interface BarRow {
  index: number;
  /** Top of the row (name line). */
  y: number;
  /** Bar geometry. */
  barX: number;
  barY: number;
  barW: number;
  barH: number;
  /** Where the value label goes; inside the bar when it would overflow. */
  valueX: number;
  valueInside: boolean;
}

export interface BarLayout {
  rows: BarRow[];
  maxValue: number;
  /** Length in px of the longest bar. */
  maxBarW: number;
  rowH: number;
  /** min/max ratio and honest readability assessment. */
  ratio: number;
  extreme: boolean;
}

const NAME_H = 22;
const BAR_H = 26;
const ROW_GAP = 14;
const VALUE_PAD = 10;
const MIN_BAR_PX = 4;

/**
 * Horizontal proportional bars, stacked top to bottom. The longest bar
 * spans `box.width - 2*padding`; every other bar keeps its true share.
 */
export function weightBarLayout(
  values: number[],
  box: Box,
  padding = 28,
): BarLayout {
  if (values.length === 0) throw new ChartError('At least one positive value is required.');
  // Validate the RAW input — silently dropping bad values would mislead.
  if (values.some((v) => !Number.isFinite(v) || v <= 0)) {
    throw new ChartError('All weights must be positive numbers.');
  }

  const maxValue = Math.max(...values);
  const rowH = NAME_H + BAR_H + ROW_GAP;
  const needed = values.length * rowH - ROW_GAP + padding * 2;
  if (needed > box.height) {
    throw new ChartError('Canvas is too short for this many rows.');
  }

  const barMaxW = box.width - padding * 2;
  const scale = barMaxW / maxValue;
  const ratio = maxValue / Math.min(...values);

  const rows: BarRow[] = values.map((value, index) => {
    const y = padding + index * rowH;
    const barY = y + NAME_H;
    const barW = Math.max(value * scale, Math.min(MIN_BAR_PX, barMaxW));
    const valueX = barW + padding + VALUE_PAD;
    return {
      index,
      y,
      barX: padding,
      barY,
      barW,
      barH: BAR_H,
      valueX,
      valueInside: valueX + 90 > box.width - padding,
    };
  });

  return {
    rows,
    maxValue,
    maxBarW: barMaxW,
    rowH,
    ratio,
    extreme: ratio > 1000 || (Math.min(...values) * scale < MIN_BAR_PX),
  };
}

/* ── volume spheres ── */

export interface SphereItem {
  index: number;
  /** Centre x; the sphere sits on the shared ground line. */
  cx: number;
  /** Radius in px — proportional to the real volume's cube root. */
  r: number;
  cy: number;
}

export interface SphereLayout {
  items: SphereItem[];
  baselineY: number;
  /** px per (base-unit volume)^⅓ — identical for every sphere. */
  scale: number;
  ratio: number;
  extreme: boolean;
}

export const MIN_SPHERE_PX = 3;

/**
 * Spheres side by side on one ground line, radius ∝ ∛volume at a single
 * shared scale factor. The scale is chosen so the largest sphere fits
 * the box height, then shrunk if the row would overflow the width.
 */
export function sphereLayout(
  values: number[],
  box: Box,
  padding = 40,
  gap = 28,
): SphereLayout {
  if (values.length === 0) throw new ChartError('At least one positive value is required.');
  // Validate the RAW input — silently dropping bad values would mislead.
  if (values.some((v) => !Number.isFinite(v) || v <= 0)) {
    throw new ChartError('All volumes must be positive numbers.');
  }

  const roots = values.map((v) => Math.cbrt(v));
  const maxRoot = Math.max(...roots);

  const availH = box.height - padding * 2;
  const kH = availH / 2 / maxRoot; // radius scale from height
  const totalRootW = roots.reduce((sum, r) => sum + 2 * r, 0);
  const availW = Math.max(box.width - padding * 2 - gap * (values.length - 1), 1);
  const k = Math.min(kH, availW / totalRootW);

  const baselineY = box.height - padding;
  const widths = roots.map((r) => 2 * r * k);
  const usedW = widths.reduce((sum, w) => sum + w, 0) + gap * (values.length - 1);
  let x = padding + Math.max((box.width - padding * 2 - usedW) / 2, 0);

  const items: SphereItem[] = values.map((_, index) => {
    const r = roots[index] * k;
    const cx = x + widths[index] / 2;
    x += widths[index] + gap;
    return { index, cx, r, cy: baselineY - r };
  });

  const ratio = Math.max(...values) / Math.min(...values);
  const smallestR = Math.min(...items.map((i) => i.r));
  return {
    items,
    baselineY,
    scale: k,
    ratio,
    extreme: ratio > 1000 || smallestR < MIN_SPHERE_PX,
  };
}
