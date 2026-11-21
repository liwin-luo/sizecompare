import { describe, expect, it } from 'vitest';
import { PAIRS, pairBySlug, pairSlug, validatePairs } from './pairs';

describe('curated pairs integrity', () => {
  it('every pair references existing objects with the shared attribute', () => {
    const result = validatePairs();
    expect(result).toEqual({ ok: true });
  });

  it('produces unique slugs in id-attr space', () => {
    const slugs = PAIRS.map(pairSlug);
    expect(new Set(slugs).size).toBe(PAIRS.length);
  });

  it('resolves slugs back to pairs', () => {
    const first = PAIRS[0];
    expect(pairBySlug(pairSlug(first))).toBe(first);
    expect(pairBySlug('no-such-pair')).toBeNull();
  });

  it('covers all three attribute families', () => {
    const families = new Set(PAIRS.map((p) => p.attr));
    expect(families).toContain('height');
    expect(families).toContain('weight');
    expect(families).toContain('volume');
  });

  it('ships a meaningful curated batch (~170 pairs, not N²)', () => {
    expect(PAIRS.length).toBeGreaterThanOrEqual(80);
    expect(PAIRS.length).toBeLessThanOrEqual(180);
  });
});
