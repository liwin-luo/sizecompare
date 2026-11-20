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
});

describe('formatAttrValue passthrough', () => {
  it('switches unit systems without changing the underlying value', () => {
    expect(formatAttrValue('height', 3200, 'metric')).toBe('3.2 m');
    expect(formatAttrValue('height', 3200, 'imperial')).toBe('10 ft 6 in');
    expect(formatAttrValue('length', 80, 'metric')).toBe('8 cm');
    expect(formatAttrValue('length', 80, 'imperial')).toBe('3.1 in');
  });
});
