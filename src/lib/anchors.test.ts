import { describe, expect, it } from 'vitest';
import { DEFAULT_ANCHORS, anchorOptions, resolveAnchor } from './anchors';
import { LIBRARY_BY_ID } from '../data/library';

describe('DEFAULT_ANCHORS', () => {
  it('maps every linear attribute plus weight, volume, lifespan and speed to a real object', () => {
    const expected: Record<string, string> = {
      height: 'adult',
      length: 'bus',
      width: 'creditcard',
      diameter: 'basketball',
      weight: 'bottle',
      volume: 'sodacan',
      lifespan: 'adult',
      speed: 'adult',
    };
    expect(DEFAULT_ANCHORS).toEqual(expected);
    for (const [attr, id] of Object.entries(DEFAULT_ANCHORS)) {
      const record = LIBRARY_BY_ID[id];
      expect(record, `${attr} anchor ${id}`).toBeDefined();
      expect(
        record?.measurements[attr as keyof typeof record.measurements],
        `${id} must carry ${attr}`,
      ).toBeDefined();
    }
  });

  it('deliberately has no area default (areas span ten orders of magnitude)', () => {
    expect(DEFAULT_ANCHORS.area).toBeUndefined();
  });
});

describe('resolveAnchor', () => {
  it('undefined choice means anchor-on with the per-attribute default', () => {
    const anchor = resolveAnchor('height', undefined);
    expect(anchor?.kind).toBe('library');
    expect(anchor?.kind === 'library' && anchor.record.id).toBe('adult');
  });

  it('explicit choice wins over the default', () => {
    const anchor = resolveAnchor('height', { enabled: true, id: 'door' });
    expect(anchor?.kind === 'library' && anchor.record.id).toBe('door');
  });

  it('disabled choice and null attr resolve to null', () => {
    expect(resolveAnchor('height', { enabled: false, id: null })).toBeNull();
    expect(resolveAnchor(null, undefined)).toBeNull();
  });

  it('falls back to null when the object lacks the attribute (no silent mismatch)', () => {
    // adult has height+weight but no length
    expect(resolveAnchor('length', { enabled: true, id: 'adult' })).toBeNull();
    expect(resolveAnchor('length', { enabled: true, id: 'no-such-id' })).toBeNull();
  });

  it('area has no default: undefined choice resolves to null, explicit pick works', () => {
    expect(resolveAnchor('area', undefined)).toBeNull();
    const pitch = resolveAnchor('area', { enabled: true, id: 'football-pitch' });
    expect(pitch?.kind === 'library' && pitch.record.id).toBe('football-pitch');
  });
});

describe('anchorOptions', () => {
  it('lists only objects carrying the attribute, default first', () => {
    const options = anchorOptions('height');
    expect(options[0]).toMatchObject({ id: 'adult', isDefault: true });
    for (const o of options) {
      expect(LIBRARY_BY_ID[o.id]?.measurements.height).toBeDefined();
    }
  });

  it('includes the football pitch as a pickable area anchor', () => {
    const options = anchorOptions('area');
    expect(options.some((o) => o.id === 'football-pitch')).toBe(true);
    expect(options.every((o) => o.isDefault === false)).toBe(true); // no default
  });

  it('returns empty for null attr', () => {
    expect(anchorOptions(null)).toEqual([]);
  });
});
