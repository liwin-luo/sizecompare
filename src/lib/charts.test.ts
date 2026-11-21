import { describe, expect, it } from 'vitest';
import { ChartError, overlayLayout, sphereLayout, weightBarLayout } from './charts';

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

describe('overlayLayout', () => {
  const BOX = { width: 800, height: 500 };

  it('draws every shape at one shared px-per-mm scale', () => {
    const layout = overlayLayout(
      [
        { wMm: 4_000_000, hMm: 3_000_000, value: 9e18 },
        { wMm: 2_000_000, hMm: 1_500_000, value: 2e18 },
      ],
      BOX,
    );
    for (const item of layout.items) {
      const f = item.index === 0 ? 4_000_000 : 2_000_000;
      expect(item.w / f).toBeCloseTo(layout.scale, 9);
      expect(item.h / (item.index === 0 ? 3_000_000 : 1_500_000)).toBeCloseTo(layout.scale, 9);
    }
  });

  it('anchors every shape bottom-centre on the shared ground line', () => {
    const layout = overlayLayout(
      [
        { wMm: 4_000_000, hMm: 3_000_000, value: 9e18 },
        { wMm: 1_200_000, hMm: 2_200_000, value: 1.5e18 },
      ],
      BOX,
    );
    expect(layout.items.length).toBe(2);
    for (const item of layout.items) {
      expect(item.x + item.w / 2).toBeCloseTo(BOX.width / 2, 6);
      expect(item.y + item.h).toBeCloseTo(layout.baselineY, 6);
    }
  });

  it('draws the larger area first so smaller shapes stay visible', () => {
    const layout = overlayLayout(
      [
        { wMm: 1_000_000, hMm: 1_000_000, value: 1e18 },
        { wMm: 3_000_000, hMm: 3_000_000, value: 8e18 },
      ],
      BOX,
    );
    expect(layout.items[0].index).toBe(1);
    expect(layout.items[1].index).toBe(0);
  });

  it('fits the largest footprint inside the box', () => {
    const layout = overlayLayout([{ wMm: 5_000_000, hMm: 4_000_000, value: 1.2e19 }], BOX);
    const item = layout.items[0];
    expect(item.w).toBeLessThanOrEqual(BOX.width - 80 + 1e-6);
    expect(item.h).toBeLessThanOrEqual(BOX.height - 80 + 1e-6);
  });

  it('flags extreme ratios and rejects bad input', () => {
    const extreme = overlayLayout(
      [
        { wMm: 5_000_000, hMm: 4_000_000, value: 1e20 },
        { wMm: 40_000, hMm: 30_000, value: 6e15 },
      ],
      BOX,
    );
    expect(extreme.ratio).toBeGreaterThan(14_400);
    expect(extreme.extreme).toBe(true);
    const normal = overlayLayout(
      [
        { wMm: 4_000_000, hMm: 3_000_000, value: 9e18 },
        { wMm: 2_500_000, hMm: 2_000_000, value: 4e18 },
      ],
      BOX,
    );
    expect(normal.extreme).toBe(false);
    expect(() => overlayLayout([], BOX)).toThrow(ChartError);
    expect(() => overlayLayout([{ wMm: 0, hMm: 1, value: 1 }], BOX)).toThrow(ChartError);
    expect(() => overlayLayout([{ wMm: 1, hMm: -1, value: 1 }], BOX)).toThrow(ChartError);
  });
});
