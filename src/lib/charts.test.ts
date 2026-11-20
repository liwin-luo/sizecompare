import { describe, expect, it } from 'vitest';
import { ChartError, sphereLayout, weightBarLayout } from './charts';

describe('weightBarLayout', () => {
  const BOX = { width: 800, height: 400 };

  it('keeps bar lengths strictly proportional to values', () => {
    const layout = weightBarLayout([150000000, 6000000, 200], BOX); // whale, elephant, cat-ish
    const byIndex = new Map(layout.rows.map((r) => [r.index, r]));
    const whale = byIndex.get(0)!;
    const elephant = byIndex.get(1)!;
    expect(elephant.barW / whale.barW).toBeCloseTo(6000000 / 150000000, 9);
    expect(whale.barW).toBeCloseTo(layout.maxBarW, 6);
  });

  it('stacks rows top to bottom with consistent pitch', () => {
    const layout = weightBarLayout([3, 1, 2], BOX);
    const ys = layout.rows.map((r) => r.y);
    expect(ys[1] - ys[0]).toBe(layout.rowH);
    expect(ys[2] - ys[1]).toBe(layout.rowH);
  });

  it('flags extreme ratios instead of truncating', () => {
    const layout = weightBarLayout([150000000, 200], BOX);
    expect(layout.ratio).toBeGreaterThan(1000);
    expect(layout.extreme).toBe(true);
    const normal = weightBarLayout([80, 60], BOX);
    expect(normal.extreme).toBe(false);
  });

  it('rejects empty, zero and negative values', () => {
    expect(() => weightBarLayout([], BOX)).toThrow(ChartError);
    expect(() => weightBarLayout([0, 5], BOX)).toThrow(ChartError);
    expect(() => weightBarLayout([-1], BOX)).toThrow(ChartError);
  });
});

describe('sphereLayout', () => {
  const BOX = { width: 800, height: 500 };

  it('scales radius by the cube root of volume at one shared factor', () => {
    const layout = sphereLayout([355, 24000, 596.5], BOX); // can, watermelon-ish, bottle-ish
    const byIndex = new Map(layout.items.map((i) => [i.index, i]));
    const can = byIndex.get(0)!;
    const melon = byIndex.get(1)!;
    // radius ratio must equal cbrt ratio, NOT volume ratio
    expect(melon.r / can.r).toBeCloseTo(Math.cbrt(24000 / 355), 9);
    expect(melon.r / can.r).toBeLessThan(24000 / 355);
  });

  it('sits every sphere on the shared ground line', () => {
    const layout = sphereLayout([100, 5000, 250000], BOX);
    for (const item of layout.items) {
      expect(item.cy + item.r).toBeCloseTo(layout.baselineY, 9);
    }
  });

  it('fits within the box even for many large spheres', () => {
    const layout = sphereLayout([1000, 900, 950, 990], BOX);
    for (const item of layout.items) {
      expect(item.cx - item.r).toBeGreaterThanOrEqual(0);
      expect(item.cx + item.r).toBeLessThanOrEqual(BOX.width);
      expect(item.cy - item.r).toBeGreaterThanOrEqual(0);
    }
  });

  it('flags extreme volume ratios honestly', () => {
    const layout = sphereLayout([1.41e33, 355], BOX); // Sun vs soda can
    expect(layout.extreme).toBe(true);
    // radius ratio equals cbrt(ratio) — about 1.55e9, so the can is subpixel…
    // but honest: we warn, we never inflate.
    expect(layout.items[1].r).toBeLessThan(1);
  });

  it('rejects empty, zero and negative values', () => {
    expect(() => sphereLayout([], BOX)).toThrow(ChartError);
    expect(() => sphereLayout([0], BOX)).toThrow(ChartError);
    expect(() => sphereLayout([-5, 5], BOX)).toThrow(ChartError);
  });
});
