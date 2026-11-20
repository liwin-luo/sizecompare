import { describe, expect, it } from 'vitest';
import {
  ALL_ATTRS,
  attrBaseUnit,
  ATTRIBUTE_FAMILY,
  formatAttrValue,
  ratioPhrase,
  sharedAttributes,
} from './attributes';

describe('attribute families', () => {
  it('maps every attribute to exactly one family', () => {
    for (const attr of ALL_ATTRS) {
      expect(ATTRIBUTE_FAMILY[attr]).toBeDefined();
      expect(['linear', 'weight', 'volume']).toContain(ATTRIBUTE_FAMILY[attr]);
    }
    expect(ATTRIBUTE_FAMILY.weight).toBe('weight');
    expect(ATTRIBUTE_FAMILY.volume).toBe('volume');
    expect(ATTRIBUTE_FAMILY.height).toBe('linear');
  });

  it('gives the correct base unit per family', () => {
    expect(attrBaseUnit('height')).toBe('mm');
    expect(attrBaseUnit('width')).toBe('mm');
    expect(attrBaseUnit('weight')).toBe('g');
    expect(attrBaseUnit('volume')).toBe('ml');
  });
});

describe('sharedAttributes', () => {
  it('intersects across all objects in canonical order', () => {
    const shared = sharedAttributes([
      ['weight', 'height'],
      ['height', 'weight', 'length'],
      ['weight', 'height'],
    ]);
    expect(shared).toEqual(['height', 'weight']);
  });

  it('returns empty when no attribute is common to all', () => {
    expect(sharedAttributes([['weight'], ['length']])).toEqual([]);
  });

  it('requires presence in every object (3 objects)', () => {
    expect(sharedAttributes([['volume', 'height'], ['volume'], ['volume', 'weight']])).toEqual([
      'volume',
    ]);
  });

  it('handles an empty object list', () => {
    expect(sharedAttributes([])).toEqual([]);
  });

  it('ignores duplicates within one object list', () => {
    expect(sharedAttributes([['weight', 'weight'], ['weight']])).toEqual(['weight']);
  });
});

describe('formatAttrValue', () => {
  it('formats linear values per unit system', () => {
    expect(formatAttrValue('height', 3200, 'metric')).toBe('3.2 m');
    expect(formatAttrValue('height', 3200, 'imperial')).toBe('10 ft 6 in');
    expect(formatAttrValue('length', 300, 'metric')).toBe('30 cm');
  });

  it('formats weight values per unit system', () => {
    expect(formatAttrValue('weight', 6000000, 'metric')).toBe('6 t');
    expect(formatAttrValue('weight', 6000000, 'imperial')).toBe('6.6 ton');
    expect(formatAttrValue('weight', 400, 'imperial')).toBe('14.1 oz');
  });

  it('formats volume values per unit system', () => {
    expect(formatAttrValue('volume', 355, 'metric')).toBe('355 ml');
    expect(formatAttrValue('volume', 355, 'imperial')).toBe('12 fl oz');
    // astronomic values switch to scientific notation
    expect(formatAttrValue('volume', 1.958e30, 'metric')).toBe('1.96e+24 m³');
  });
});

describe('ratioPhrase', () => {
  it('treats near-equal as same size', () => {
    expect(ratioPhrase('height', 1.02)).toBe('about the same size as');
    expect(ratioPhrase('weight', 1.04)).toBe('about the same size as');
  });

  it('uses the comparative word for linear attributes', () => {
    expect(ratioPhrase('height', 2)).toBe('about 2.0× taller than');
    expect(ratioPhrase('length', 37.5)).toBe('about 38× longer than');
    expect(ratioPhrase('diameter', 3.5)).toBe('about 3.5× wider than');
  });

  it('uses heavier for weight and volume-of for volume', () => {
    expect(ratioPhrase('weight', 66)).toBe('about 66× heavier than');
    expect(ratioPhrase('volume', 3)).toBe('about 3.0× the volume of');
  });
});
