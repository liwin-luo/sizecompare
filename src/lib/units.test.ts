import { describe, expect, it } from 'vitest';
import {
  convert,
  formatImperialHeight,
  formatMm,
  fromMm,
  parseFeetInches,
  parseMeasurement,
  toMm,
} from './units';

describe('exact conversion factors', () => {
  it('converts within metric exactly', () => {
    expect(toMm(1, 'cm')).toBe(10);
    expect(toMm(1, 'm')).toBe(1000);
    expect(fromMm(1000, 'm')).toBe(1);
    expect(convert(30, 'cm', 'mm')).toBe(300);
  });

  it('uses the exact inch definition (25.4 mm)', () => {
    expect(toMm(1, 'in')).toBe(25.4);
    expect(toMm(1, 'ft')).toBe(304.8);
    expect(convert(12, 'in', 'ft')).toBeCloseTo(1, 10);
  });

  it('round-trips every unit without drift', () => {
    const mm = 1828.8;
    for (const unit of ['mm', 'cm', 'm', 'in', 'ft'] as const) {
      expect(toMm(fromMm(mm, unit), unit)).toBeCloseTo(mm, 9);
    }
  });
});

describe('formatting', () => {
  it('formats metric values with sensible precision', () => {
    expect(formatMm(300, 'cm')).toBe('30 cm');
    expect(formatMm(1905, 'mm')).toBe('1905 mm');
    expect(formatMm(1234, 'm')).toBe('1.23 m');
  });

  it('formats imperial heights as feet and inches', () => {
    expect(formatImperialHeight(1737.36)).toBe('5 ft 8 in');
    expect(formatImperialHeight(1828.8)).toBe('6 ft');
    expect(formatImperialHeight(609.6)).toBe('2 ft'); // exact feet, no inches part
    expect(formatImperialHeight(67)).toBe('2.6 in'); // under 1 ft stays inches
  });

  it('rolls 11.9 inches up correctly', () => {
    // 5 ft 11.6 in rounds to whole inches → 12 in → becomes 6 ft
    const mm = toMm(5, 'ft') + toMm(11.6, 'in');
    expect(formatImperialHeight(mm)).toBe('6 ft');
  });
});

describe('feet-inches parsing', () => {
  it("accepts 5'8\" and plain forms", () => {
    expect(parseFeetInches(`5'8"`)).toBeCloseTo(toMm(68, 'in'), 9);
    expect(parseFeetInches('5 ft 8 in')).toBeCloseTo(toMm(68, 'in'), 9);
    expect(parseFeetInches('6ft')).toBeCloseTo(toMm(6, 'ft'), 9);
  });

  it('returns null for non-matching strings', () => {
    expect(parseFeetInches('hello')).toBeNull();
    expect(parseFeetInches('30 cm')).toBeNull();
    expect(parseFeetInches('')).toBeNull();
  });
});

describe('measurement input validation', () => {
  it('accepts normal classroom values', () => {
    expect(parseMeasurement('30', 'cm')).toEqual({ ok: true, mm: 300 });
    expect(parseMeasurement('7.5', 'in')).toEqual({ ok: true, mm: 190.5 });
    expect(parseMeasurement('1,900', 'mm')).toEqual({ ok: true, mm: 1900 });
  });

  it('rejects empty, non-numeric, zero, negative', () => {
    expect(parseMeasurement('', 'cm').ok).toBe(false);
    expect(parseMeasurement('   ', 'cm').ok).toBe(false);
    expect(parseMeasurement('abc', 'cm').ok).toBe(false);
    expect(parseMeasurement('0', 'cm').ok).toBe(false);
    expect(parseMeasurement('-5', 'cm').ok).toBe(false);
  });

  it('rejects extremes in either direction with friendly errors', () => {
    expect(parseMeasurement('0.001', 'mm').ok).toBe(false); // below MIN_MM
    expect(parseMeasurement('999999', 'm').ok).toBe(false); // above MAX_MM
    const tiny = parseMeasurement('0.01', 'mm');
    expect(tiny.ok).toBe(false);
  });

  it('falls back to feet-inches parsing for mixed input', () => {
    const res = parseMeasurement(`5'4"`, 'ft');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.mm).toBeCloseTo(toMm(64, 'in'), 6);
  });
});
