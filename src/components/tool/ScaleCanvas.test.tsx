import { describe, expect, it } from 'vitest';
import type { ComparisonObject } from '../../lib/objects';
import { buildAnswerSentence, objectVisual } from './ScaleCanvas';
import { formatAttrValue } from '../../lib/attributes';

const obj = (
  id: string,
  name: string,
  attr: 'height' | 'length' | 'weight',
  value: number,
): ComparisonObject => ({
  kind: 'custom',
  record: { id, name, attr, value, color: '#000' },
});

describe('buildAnswerSentence', () => {
  it('reads naturally for linear comparisons', () => {
    const s = buildAnswerSentence(
      [obj('a', 'My pencil', 'length', 190), obj('b', 'My eraser', 'length', 50)],
      'length',
      'metric',
    );
    expect(s).toContain('longer than');
    expect(s).not.toContain('The My');
    expect(s).toMatch(/^My pencil \(19 cm\)/);
  });

  it('reads naturally for weight comparisons', () => {
    const s = buildAnswerSentence(
      [obj('w', 'Elephant', 'weight', 6000000), obj('c', 'Child', 'weight', 25000)],
      'weight',
      'metric',
    );
    expect(s).toContain('heavier than');
    expect(s).toContain('240×');
  });

  it('uses feet-and-inches for imperial display', () => {
    const s = buildAnswerSentence(
      [obj('a', 'Door', 'height', 2032), obj('b', 'Cat', 'height', 250)],
      'height',
      'imperial',
    );
    expect(s).toContain('6 ft 8 in');
    expect(s).toContain('taller than');
  });

  it('treats near-equal values as same size', () => {
    const s = buildAnswerSentence(
      [obj('a', 'Tennis ball', 'height', 67), obj('b', 'Apple', 'height', 66)],
      'height',
      'metric',
    );
    expect(s).toContain('about the same size as');
  });

  it('returns null when an object lacks the attribute', () => {
    // 'weight' objects compared on 'height' → one is missing it
    expect(buildAnswerSentence([obj('a', 'A', 'weight', 10), obj('b', 'B', 'height', 20)], 'height', 'metric')).toBeNull();
    expect(buildAnswerSentence([obj('a', 'A', 'length', 10)], 'length', 'metric')).toBeNull();
  });
});

describe('objectVisual', () => {
  it('returns null when the object lacks the attribute', () => {
    expect(objectVisual(obj('a', 'A', 'weight', 10), 'height')).toBeNull();
  });

  it('gives custom objects a generic shape for the attribute', () => {
    const v = objectVisual(obj('a', 'Board', 'length', 1500), 'length')!;
    expect(v.silhouette).toBeNull();
    expect(v.axis).toBe('horizontal');
  });

  it('derives a true rectangle from paired dimensions on rect objects', () => {
    const meas = (value: number) => ({
      value,
      context: 'x',
      source_url: 'x',
      source_name: 'x',
      checked_at: '2026-11-21',
    });
    const rectObj = (axis: 'vertical' | 'horizontal'): ComparisonObject => ({
      kind: 'library',
      record: {
        id: 'rect-test',
        name: 'Test product',
        category: 'everyday',
        silhouette: 'tvpanel',
        aspect: 99, // wrong on purpose: rect must win
        axis,
        primaryAttr: 'width',
        rect: ['width', 'height'],
        measurements: { width: meas(1218), height: meas(685) },
        image_license: 'original-CC0',
        attribution: 'SizeCompare original',
      },
    });
    // Horizontal: width drives the box → h = w / (w/h) = real height.
    const horiz = objectVisual(rectObj('horizontal'), 'width')!;
    expect(horiz.aspect).toBeCloseTo(1218 / 685);
    // Same rectangle compared the other way round (e.g. Twin vs Twin XL).
    const flipped = objectVisual(rectObj('horizontal'), 'height')!;
    expect(flipped.aspect).toBeCloseTo(685 / 1218);
    // Vertical: height drives, width comes from the pair.
    const vert = objectVisual(rectObj('vertical'), 'height')!;
    expect(vert.aspect).toBeCloseTo(1218 / 685);
  });
});

describe('formatAttrValue passthrough', () => {
  it('switches unit systems without changing the underlying value', () => {
    expect(formatAttrValue('height', 3200, 'metric')).toBe('3.2 m');
    expect(formatAttrValue('height', 3200, 'imperial')).toBe('10 ft 6 in');
    expect(formatAttrValue('length', 80, 'metric')).toBe('8 cm');
    expect(formatAttrValue('length', 80, 'imperial')).toBe('3.1 in');
  });
});
