import { describe, expect, it } from 'vitest';
import {
  hasAttr,
  objectAttrs,
  objectName,
  objectSourceLine,
  objectValue,
  validateAttrValue,
  validateName,
  type ComparisonObject,
  type ObjectV2,
} from './objects';

const record: ObjectV2 = {
  id: 'cat',
  name: 'Cat',
  category: 'animal',
  silhouette: 'cat',
  primaryAttr: 'height',
  aspect: 1.2,
  axis: 'vertical',
  image_license: 'original-CC0',
  attribution: 'SizeCompare original',
  measurements: {
    height: {
      value: 250,
      min: 230,
      max: 300,
      context: 'shoulder height, typical adult domestic cat',
      source_url: 'https://en.wikipedia.org/wiki/Cat',
      source_name: 'Domestic cat typical shoulder height (range)',
      checked_at: '2026-11-19',
    },
  },
};

const lib: ComparisonObject = { kind: 'library', record };

describe('object v2 accessors', () => {
  it('returns base-unit values only for attributes the object has', () => {
    expect(objectValue(lib, 'height')).toBe(250);
    expect(objectValue(lib, 'weight')).toBeNull();
    expect(hasAttr(lib, 'height')).toBe(true);
    expect(hasAttr(lib, 'volume')).toBe(false);
  });

  it('lists attributes in canonical order', () => {
    const multi: ObjectV2 = {
      ...record,
      measurements: {
        weight: { value: 4500, context: 'x', source_url: 's', source_name: 's', checked_at: 'd' },
        height: record.measurements.height!,
      },
    };
    expect(objectAttrs({ kind: 'library', record: multi })).toEqual(['height', 'weight']);
  });

  it('custom objects expose exactly their own attribute', () => {
    const custom: ComparisonObject = {
      kind: 'custom',
      record: { id: 'c1', name: 'My bottle', attr: 'volume', value: 500, color: '#000' },
    };
    expect(objectValue(custom, 'volume')).toBe(500);
    expect(objectValue(custom, 'height')).toBeNull();
    expect(objectAttrs(custom)).toEqual(['volume']);
    expect(objectName(custom)).toBe('My bottle');
  });

  it('builds provenance lines with range and context', () => {
    expect(objectSourceLine(lib, 'height')).toContain('Domestic cat typical shoulder height (range)');
    expect(objectSourceLine(lib, 'height')).toContain('range 230–300');
    expect(objectSourceLine(lib, 'height')).toContain('shoulder height, typical adult');
  });

  it('labels custom objects honestly', () => {
    const custom: ComparisonObject = {
      kind: 'custom',
      record: { id: 'c1', name: 'My bottle', attr: 'volume', value: 500, color: '#000' },
    };
    expect(objectSourceLine(custom, 'volume')).toBe('Custom measurement');
  });
});

describe('input validation', () => {
  it('validates names', () => {
    expect(validateName('Pencil').ok).toBe(true);
    expect(validateName('   ').ok).toBe(false);
    expect(validateName('').ok).toBe(false);
    expect(validateName('x'.repeat(61)).ok).toBe(false);
    expect(validateName('x'.repeat(60)).ok).toBe(true);
  });

  it('validates base-unit values per family', () => {
    expect(validateAttrValue('height', 300).ok).toBe(true);
    expect(validateAttrValue('weight', 75000).ok).toBe(true);
    expect(validateAttrValue('volume', 355).ok).toBe(true);
    expect(validateAttrValue('height', 0).ok).toBe(false);
    expect(validateAttrValue('height', -1).ok).toBe(false);
    expect(validateAttrValue('weight', NaN).ok).toBe(false);
    expect(validateAttrValue('volume', Infinity).ok).toBe(false);
    expect(validateAttrValue('height', 0.05).ok).toBe(false); // below 0.1 mm
    expect(validateAttrValue('weight', 0.0001).ok).toBe(false); // below 0.001 g
    expect(validateAttrValue('volume', 0.05).ok).toBe(false); // below 0.1 ml
  });
});
