import { describe, expect, it } from 'vitest';
import type { ComparisonObject } from '../../lib/objects';
import { buildAnswerSentence, formatValue } from './ScaleCanvas';

const obj = (
  id: string,
  name: string,
  dimension_type: 'height' | 'length' | 'diameter',
  value_mm: number,
): ComparisonObject => ({
  kind: 'custom',
  record: { id, name, dimension_type, value_mm, color: '#000' },
});

describe('buildAnswerSentence', () => {
  it('reads naturally with possessive names and correct comparison word', () => {
    const s = buildAnswerSentence(
      [obj('a', 'My pencil', 'length', 190), obj('b', 'My eraser', 'length', 50)],
      'metric',
    );
    // grammar regression: must contain "than", must not produce "The My …"
    expect(s).toContain('longer than');
    expect(s).not.toContain('The My');
    expect(s).toMatch(/^My pencil \(19 cm\)/);
  });

  it('uses feet-and-inches for imperial display', () => {
    const s = buildAnswerSentence(
      [obj('a', 'Door', 'height', 2032), obj('b', 'Eraser', 'height', 60)],
      'imperial',
    );
    expect(s).toContain('6 ft 8 in');
    expect(s).toContain('taller than');
  });

  it('handles mixed dimensions honestly', () => {
    const s = buildAnswerSentence(
      [obj('w', 'Blue whale', 'length', 26000), obj('c', 'Child', 'height', 1280)],
      'metric',
    );
    expect(s).toContain('measured size of');
  });

  it('returns null for fewer than two objects', () => {
    expect(buildAnswerSentence([obj('a', 'Pencil', 'length', 190)], 'metric')).toBeNull();
  });
});

describe('formatValue', () => {
  it('switches unit systems without changing the underlying value', () => {
    expect(formatValue(3200, 'metric')).toBe('3.2 m');
    expect(formatValue(3200, 'imperial')).toBe('10 ft 6 in');
    expect(formatValue(80, 'metric')).toBe('8 cm');
    expect(formatValue(80, 'imperial')).toBe('3.1 in');
  });
});
