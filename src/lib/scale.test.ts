import { describe, expect, it } from 'vitest';
import { ScaleError, assessScale, computeLayout, EXTREME_RATIO } from './scale';

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
