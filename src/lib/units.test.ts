import { describe, expect, it } from 'vitest';
import {
  autoMassUnit,
  autoVolumeUnit,
  convert,
  FACTORS_G,
  FACTORS_ML,
  formatImperialHeight,
  formatImperialVolume,
  formatImperialWeight,
  formatMassG,
  formatMm,
  formatVolMl,
  fromG,
  fromMl,
  fromMm,
  parseFeetInches,
  parseMass,
  parseMeasurement,
  parseVolume,
  toG,
  toMl,
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
    expect(parseMeasurement('9999999999', 'km').ok).toBe(false); // above MAX_MM
    expect(parseMeasurement('999999', 'm').ok).toBe(true); // well within new bound
    const tiny = parseMeasurement('0.01', 'mm');
    expect(tiny.ok).toBe(false);
  });

  it('falls back to feet-inches parsing for mixed input', () => {
    const res = parseMeasurement(`5'4"`, 'ft');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.mm).toBeCloseTo(toMm(64, 'in'), 6);
  });
});

describe('mass conversion', () => {
  it('uses exact avoirdupois definitions', () => {
    expect(FACTORS_G.lb).toBe(453.59237);
    expect(FACTORS_G.oz).toBeCloseTo(28.349523125, 10);
    expect(toG(1, 'kg')).toBe(1000);
    expect(fromG(toG(150, 't'), 'kg')).toBeCloseTo(150000, 6);
    expect(toG(2000, 'lb')).toBeCloseTo(toG(1, 'ton'), 6); // short ton
  });

  it('formats metric masses with auto units', () => {
    expect(formatMassG(400, autoMassUnit(400))).toBe('400 g');
    expect(formatMassG(75000, autoMassUnit(75000))).toBe('75 kg');
    expect(formatMassG(6000000, autoMassUnit(6000000))).toBe('6 t');
  });

  it('formats imperial weights across ranges', () => {
    expect(formatImperialWeight(400)).toBe('14.1 oz');
    expect(formatImperialWeight(1587.57)).toBe('3 lb 8 oz');
    expect(formatImperialWeight(165346)).toBe('365 lb'); // 364.57 lb rounds
    expect(formatImperialWeight(150000000)).toBe('165.3 ton');
  });

  it('validates weight input bounds', () => {
    expect(parseMass('', 'kg').ok).toBe(false);
    expect(parseMass('0', 'kg').ok).toBe(false);
    expect(parseMass('abc', 'kg').ok).toBe(false);
    expect(parseMass('-2', 'lb').ok).toBe(false);
    expect(parseMass('75', 'kg')).toEqual({ ok: true, g: 75000 });
    expect(parseMass('0.0000001', 'g').ok).toBe(false);
    expect(parseMass('1e35', 't').ok).toBe(false);
  });
});

describe('volume conversion', () => {
  it('uses exact US definitions', () => {
    expect(FACTORS_ML.gal).toBeCloseTo(3785.411784, 6);
    expect(FACTORS_ML.floz).toBeCloseTo(29.5735295625, 10);
    expect(toMl(1, 'm³')).toBe(1_000_000); // a cubic metre is 1000 litres
    expect(fromMl(toMl(355, 'ml'), 'l')).toBeCloseTo(0.355, 10);
  });

  it('formats metric volumes with auto units', () => {
    expect(formatVolMl(355, autoVolumeUnit(355))).toBe('355 ml');
    expect(formatVolMl(5000, autoVolumeUnit(5000))).toBe('5 l');
    expect(formatVolMl(2583000, autoVolumeUnit(2583000))).toBe('2.58 m³');
  });

  it('formats imperial volumes across ranges', () => {
    expect(formatImperialVolume(355)).toBe('12 fl oz');
    expect(formatImperialVolume(500)).toBe('16.9 fl oz');
    expect(formatImperialVolume(3785.411784)).toBe('1 gal');
    expect(formatImperialVolume(1000000)).toBe('264.2 gal');
  });

  it('validates volume input bounds', () => {
    expect(parseVolume('', 'ml').ok).toBe(false);
    expect(parseVolume('-1', 'l').ok).toBe(false);
    expect(parseVolume('x', 'ml').ok).toBe(false);
    expect(parseVolume('500', 'ml')).toEqual({ ok: true, ml: 500 });
    expect(parseVolume('0.05', 'ml').ok).toBe(false);
  });
});
