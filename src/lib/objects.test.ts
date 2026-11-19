import { describe, expect, it } from 'vitest';
import {
  checkDimensionMix,
  objectSourceLine,
  validateName,
  validateValueMm,
  type ComparisonObject,
  type ObjectRecord,
} from './objects';

const libraryRecord: ObjectRecord = {
  id: 'animal-cat',
  name: 'Cat',
  category: 'animal',
  dimension_type: 'height',
  value_mm: 250,
  source_unit: 'cm',
  measurement_context: 'shoulder height, adult',
  source_url: 'https://example.edu/cat',
  source_name: 'Example University',
  checked_at: '2026-11-19',
  silhouette: 'cat',
  image_license: 'original-CC0',
  attribution: 'SizeCompare original',
  aspect: 1.6,
  axis: 'vertical',
};

describe('dimension mixing rules', () => {
  it('allows uniform dimensions', () => {
    expect(checkDimensionMix(['height', 'height'])).toEqual({ status: 'ok' });
    expect(checkDimensionMix(['length', 'length', 'length'])).toEqual({ status: 'ok' });
    expect(checkDimensionMix(['diameter'])).toEqual({ status: 'ok' });
  });

  it('warns when height meets length or width', () => {
    expect(checkDimensionMix(['height', 'length']).status).toBe('warn');
    expect(checkDimensionMix(['height', 'width']).status).toBe('warn');
    expect(checkDimensionMix(['height', 'diameter']).status).toBe('warn');
  });

  it('treats diameter as a span alongside length/width', () => {
    expect(checkDimensionMix(['length', 'diameter'])).toEqual({ status: 'ok' });
    expect(checkDimensionMix(['width', 'diameter'])).toEqual({ status: 'ok' });
  });

  it('warns when three different dimensions mix', () => {
    const res = checkDimensionMix(['height', 'length', 'diameter']);
    expect(res.status).toBe('warn');
    if (res.status === 'warn') expect(res.message).toContain('height vs. length');
  });

  it('warning text tells the teacher each object keeps its own label', () => {
    const res = checkDimensionMix(['height', 'length']);
    if (res.status === 'warn') {
      expect(res.message).toMatch(/own measured dimension/i);
    } else {
      throw new Error('expected warn');
    }
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

  it('validates mm values including extremes', () => {
    expect(validateValueMm(300).ok).toBe(true);
    expect(validateValueMm(0).ok).toBe(false);
    expect(validateValueMm(-1).ok).toBe(false);
    expect(validateValueMm(NaN).ok).toBe(false);
    expect(validateValueMm(Infinity).ok).toBe(false);
    expect(validateValueMm(0.05).ok).toBe(false); // below 0.1 mm
    expect(validateValueMm(20_000_000).ok).toBe(false); // above 10 km
  });
});

describe('provenance lines', () => {
  const lib: ComparisonObject = { kind: 'library', record: libraryRecord };

  it('shows source, range and measurement context for library objects', () => {
    const withRange: ComparisonObject = {
      kind: 'library',
      record: { ...libraryRecord, min_mm: 230, max_mm: 260 },
    };
    expect(objectSourceLine(withRange)).toContain('Example University');
    expect(objectSourceLine(withRange)).toContain('range 230–260 mm');
    expect(objectSourceLine(withRange)).toContain('shoulder height');
  });

  it('labels custom objects honestly', () => {
    const custom: ComparisonObject = {
      kind: 'custom',
      record: {
        id: 'custom-1',
        name: 'My pencil',
        dimension_type: 'length',
        value_mm: 190,
        color: '#0e7490',
      },
    };
    expect(objectSourceLine(custom)).toBe('Custom measurement');
  });

  it('omits range when the record has none', () => {
    expect(objectSourceLine(lib)).not.toContain('range');
  });
});
