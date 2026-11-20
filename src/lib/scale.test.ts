import { describe, expect, it } from 'vitest';
import {
  ScaleError,
  assessScale,
  computeLayout,
  computeRevealLayout,
  EXTREME_RATIO,
} from './scale';

const BOX = { width: 1000, height: 600 };

describe('common scale factor', () => {
  it('gives every object the same px-per-mm', () => {
    const layout = computeLayout(
      [
        { valueMm: 3200, aspect: 0.5, axis: 'vertical' }, // giraffe-ish
        { valueMm: 90, aspect: 1.8, axis: 'vertical' }, // mouse-ish
      ],
      BOX,
    );
    const pxPerMm = layout.items.map((i) => i.h / [3200, 90][i.index]);
    pxPerMm.forEach((p) => expect(p).toBeCloseTo(layout.scale, 9));
  });

  it('keeps double the measurement at double the drawn size', () => {
    const layout = computeLayout(
      [
        { valueMm: 100, aspect: 1, axis: 'vertical' },
        { valueMm: 200, aspect: 1, axis: 'vertical' },
      ],
      BOX,
    );
    const [a, b] = layout.items;
    expect(b.h / a.h).toBeCloseTo(2, 9);
  });

  it('locks aspect ratio — never stretches X and Y independently', () => {
    const layout = computeLayout(
      [
        { valueMm: 1700, aspect: 0.42, axis: 'vertical' },
        { valueMm: 3200, aspect: 2.2, axis: 'horizontal' },
      ],
      BOX,
    );
    for (const [i, item] of layout.items.entries()) {
      const aspect = [0.42, 2.2][i];
      expect(item.w / item.h).toBeCloseTo(aspect, 6);
    }
  });

  it('maps horizontal-axis objects along X at the shared scale', () => {
    const layout = computeLayout(
      [{ valueMm: 25000, aspect: 4, axis: 'horizontal' }], // blue whale length
      BOX,
    );
    expect(layout.items[0].w).toBeCloseTo(25000 * layout.scale, 6);
  });

  it('fits inside the box with padding and gaps', () => {
    const layout = computeLayout(
      [
        { valueMm: 100, aspect: 1, axis: 'both' },
        { valueMm: 400, aspect: 1, axis: 'both' },
        { valueMm: 200, aspect: 1, axis: 'both' },
      ],
      BOX,
      24,
      40,
    );
    for (const item of layout.items) {
      expect(item.x).toBeGreaterThanOrEqual(0);
      expect(item.x + item.w).toBeLessThanOrEqual(BOX.width);
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.y + item.h).toBeLessThanOrEqual(BOX.height);
    }
  });

  it('aligns all objects on one shared ground line', () => {
    const layout = computeLayout(
      [
        { valueMm: 100, aspect: 1, axis: 'vertical' },
        { valueMm: 900, aspect: 1, axis: 'vertical' },
      ],
      BOX,
    );
    for (const item of layout.items) {
      expect(item.y + item.h).toBeCloseTo(layout.baselineY, 9);
    }
  });

  it('shrinks the scale rather than overflowing when crowded', () => {
    const many = Array.from({ length: 8 }, () => ({
      valueMm: 1000,
      aspect: 1,
      axis: 'vertical' as const,
    }));
    const layout = computeLayout(many, { width: 400, height: 300 }, 10, 10);
    const rightmost = layout.items.at(-1)!;
    expect(rightmost.x + rightmost.w).toBeLessThanOrEqual(400);
  });

  it('rejects empty, zero, negative and malformed inputs', () => {
    expect(() => computeLayout([], BOX)).toThrow(ScaleError);
    expect(() =>
      computeLayout([{ valueMm: 0, aspect: 1, axis: 'vertical' }], BOX),
    ).toThrow(ScaleError);
    expect(() =>
      computeLayout([{ valueMm: -5, aspect: 1, axis: 'vertical' }], BOX),
    ).toThrow(ScaleError);
    expect(() =>
      computeLayout([{ valueMm: 100, aspect: 0, axis: 'vertical' }], BOX),
    ).toThrow(ScaleError);
    expect(() => computeLayout([{ valueMm: NaN, aspect: 1, axis: 'both' }], BOX)).toThrow(
      ScaleError,
    );
  });
});

describe('extreme-scale honesty (warn, never inflate)', () => {
  it('flags mouse vs. blue whale as extreme', () => {
    const layout = computeLayout(
      [
        { valueMm: 90, aspect: 1.8, axis: 'vertical' },
        { valueMm: 25000, aspect: 4, axis: 'horizontal' },
      ],
      BOX,
    );
    const health = assessScale([90, 25000], layout.scale);
    expect(health.ratio).toBeGreaterThan(EXTREME_RATIO);
    expect(health.extreme).toBe(true);
  });

  it('passes normal classroom comparisons', () => {
    const health = assessScale([190, 1905], 0.3); // eraser vs door
    expect(health.extreme).toBe(false);
  });

  it('does not silently resize the small object', () => {
    const layout = computeLayout(
      [
        { valueMm: 90, aspect: 1.8, axis: 'vertical' },
        { valueMm: 25000, aspect: 4, axis: 'horizontal' },
      ],
      BOX,
    );
    const mouse = layout.items[0];
    // The mouse stays exactly value × scale, however tiny that is.
    expect(mouse.h).toBeCloseTo(90 * layout.scale, 9);
  });
});

describe('computeRevealLayout (quiz reveal blend)', () => {
  const ITEMS = [
    { valueMm: 3200, aspect: 0.5, axis: 'vertical' as const },
    { valueMm: 90, aspect: 1.8, axis: 'vertical' as const },
  ];

  it('returns exactly computeLayout at (and beyond) progress 1', () => {
    expect(computeRevealLayout(ITEMS, BOX, 1)).toEqual(computeLayout(ITEMS, BOX));
    expect(computeRevealLayout(ITEMS, BOX, 2)).toEqual(computeLayout(ITEMS, BOX));
  });

  it('draws equal measured axes at progress 0', () => {
    const layout = computeRevealLayout(ITEMS, BOX, 0);
    const [a, b] = layout.items;
    expect(a.h).toBeCloseTo(b.h, 6); // both vertical axis → equal heights
    expect(a.h).toBeGreaterThan(0);
  });

  it('keeps the shared baseline and stays inside the box at every step', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const layout = computeRevealLayout(ITEMS, BOX, p);
      expect(layout.baselineY).toBe(BOX.height - 24);
      for (const item of layout.items) {
        expect(item.y).toBeGreaterThanOrEqual(0);
        expect(item.y + item.h).toBeCloseTo(layout.baselineY, 6);
        expect(item.w).toBeGreaterThan(0);
      }
    }
  });

  it('preserves each silhouette aspect ratio mid-blend', () => {
    const layout = computeRevealLayout(ITEMS, BOX, 0.37);
    for (const [i, item] of layout.items.entries()) {
      expect(item.w / item.h).toBeCloseTo(ITEMS[i].aspect, 6);
    }
  });

  it('moves monotonically from equal sizes toward the true sizes', () => {
    const zero = computeRevealLayout(ITEMS, BOX, 0);
    const mid = computeRevealLayout(ITEMS, BOX, 0.5);
    const one = computeRevealLayout(ITEMS, BOX, 1);
    // the big object only grows, the small one only shrinks
    expect(zero.items[0].h).toBeLessThan(mid.items[0].h);
    expect(mid.items[0].h).toBeLessThan(one.items[0].h);
    expect(zero.items[1].h).toBeGreaterThan(mid.items[1].h);
    expect(mid.items[1].h).toBeGreaterThan(one.items[1].h);
  });
});
