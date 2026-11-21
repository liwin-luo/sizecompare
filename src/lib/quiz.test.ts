import { describe, expect, it } from 'vitest';
import { LIBRARY_BY_ID } from '../data/library';
import { PAIRS } from '../data/pairs';
import {
  askPhrase,
  biggerSide,
  buildQuestionPool,
  buildShareText,
  mulberry32,
  parseQuizUrl,
  pickRound,
  quizUrl,
  RATIO_MAX,
  RATIO_MIN,
  ROUND_SIZE,
  tierFromRatio,
} from './quiz';

const pool = buildQuestionPool();

function valueOf(id: string, attr: Parameters<typeof biggerSide>[0]['attr']): number {
  return LIBRARY_BY_ID[id].measurements[attr]!.value;
}

describe('buildQuestionPool', () => {
  it('keeps every question inside the ratio bounds', () => {
    expect(pool.length).toBeGreaterThan(500);
    for (const q of pool) {
      expect(q.ratio).toBeGreaterThanOrEqual(RATIO_MIN);
      expect(q.ratio).toBeLessThanOrEqual(RATIO_MAX);
      expect(valueOf(q.aId, q.attr)).toBeGreaterThan(0);
      expect(valueOf(q.bId, q.attr)).toBeGreaterThan(0);
    }
  });

  it('never duplicates a pair (regardless of side order)', () => {
    const keys = pool.map((q) => [q.aId, q.bId].sort().join('|') + '#' + q.attr);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('includes the curated pairs that clear the ratio floor', () => {
    const poolKeys = new Set(pool.map((q) => `${q.aId}|${q.bId}#${q.attr}`));
    let expected = 0;
    for (const p of PAIRS) {
      const va = valueOf(p.a, p.attr);
      const vb = valueOf(p.b, p.attr);
      const ratio = Math.max(va, vb) / Math.min(va, vb);
      if (ratio < RATIO_MIN || ratio > RATIO_MAX) continue;
      expected++;
      expect(poolKeys.has(`${p.a}|${p.b}#${p.attr}`)).toBe(true);
    }
    expect(expected).toBeGreaterThan(10);
    expect(pool.filter((q) => q.curated).length).toBe(expected);
  });

  it('is deterministic across calls', () => {
    expect(buildQuestionPool()).toEqual(pool);
  });

  it('includes country area questions', () => {
    const areaQs = pool.filter((q) => q.attr === 'area');
    expect(areaQs.length).toBeGreaterThan(200);
    expect(pool.some((q) => q.curated && q.attr === 'area')).toBe(true);
  });
});

describe('tierFromRatio', () => {
  it('splits at 1.6× and 3×', () => {
    expect(tierFromRatio(1.2)).toBe('hard');
    expect(tierFromRatio(1.59)).toBe('hard');
    expect(tierFromRatio(1.6)).toBe('medium');
    expect(tierFromRatio(2.99)).toBe('medium');
    expect(tierFromRatio(3)).toBe('easy');
    expect(tierFromRatio(40)).toBe('easy');
  });
});

describe('biggerSide', () => {
  it('points at the larger value', () => {
    for (const q of pool.slice(0, 200)) {
      const side = biggerSide(q);
      const winner = side === 'a' ? q.aId : q.bId;
      const loser = side === 'a' ? q.bId : q.aId;
      expect(valueOf(winner, q.attr)).toBeGreaterThanOrEqual(valueOf(loser, q.attr));
    }
  });
});

describe('pickRound', () => {
  it('is fully determined by its seed', () => {
    expect(pickRound(pool, 42)).toEqual(pickRound(pool, 42));
    expect(pickRound(pool, 42)).not.toEqual(pickRound(pool, 43));
  });

  it('deals a 3/4/3 tier ramp with no reused objects', () => {
    for (const seed of [1, 7, 1234]) {
      const round = pickRound(pool, seed);
      expect(round).toHaveLength(ROUND_SIZE);
      expect(round.map((q) => q.tier)).toEqual([
        'easy',
        'easy',
        'easy',
        'medium',
        'medium',
        'medium',
        'medium',
        'hard',
        'hard',
        'hard',
      ]);
      const ids = round.flatMap((q) => [q.aId, q.bId]);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('randomises which side is presented left', () => {
    let seenFlip = false;
    let seenKeep = false;
    for (const seed of Array.from({ length: 30 }, (_, i) => i)) {
      for (const q of pickRound(pool, seed)) {
        if (q.leftId === q.bId) seenFlip = true;
        if (q.leftId === q.aId) seenKeep = true;
      }
    }
    expect(seenFlip).toBe(true);
    expect(seenKeep).toBe(true);
  });
});

describe('mulberry32', () => {
  it('yields deterministic values in [0, 1)', () => {
    const a = mulberry32(99);
    const b = mulberry32(99);
    for (let i = 0; i < 50; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('askPhrase', () => {
  it('uses the right verb per attribute', () => {
    expect(askPhrase('height')).toBe('Which is taller?');
    expect(askPhrase('length')).toBe('Which is longer?');
    expect(askPhrase('weight')).toBe('Which is heavier?');
    expect(askPhrase('volume')).toBe('Which has more volume?');
    expect(askPhrase('area')).toBe('Which has more area?');
  });
});

describe('parseQuizUrl', () => {
  it('parses a full challenge link', () => {
    expect(parseQuizUrl('?s=123456&b=7&v=1')).toEqual({ seed: 123456, beat: 7 });
  });

  it('accepts a seed without a score to beat', () => {
    expect(parseQuizUrl('?s=42&v=1')).toEqual({ seed: 42, beat: null });
  });

  it('treats a missing version as v1', () => {
    expect(parseQuizUrl('?s=42')).toEqual({ seed: 42, beat: null });
  });

  it('rejects a stale version (old shared links degrade to a random round)', () => {
    expect(parseQuizUrl('?s=42&v=999')).toBeNull();
    expect(parseQuizUrl('?s=42&v=abc')).toBeNull();
  });

  it('rejects out-of-range seeds and beats', () => {
    expect(parseQuizUrl('?s=0&v=1')).toBeNull();
    expect(parseQuizUrl('?s=-5&v=1')).toBeNull();
    expect(parseQuizUrl('?s=2147483648&v=1')).toBeNull();
    expect(parseQuizUrl('?s=12.5&v=1')).toBeNull();
    expect(parseQuizUrl('?s=42&b=11&v=1')).toBeNull();
    expect(parseQuizUrl('?s=42&b=-1&v=1')).toBeNull();
  });

  it('is safe on empty or malformed input', () => {
    expect(parseQuizUrl('')).toBeNull();
    expect(parseQuizUrl('?v=1')).toBeNull();
    expect(parseQuizUrl('?s=&v=1')).toBeNull();
    expect(parseQuizUrl('?s=abc&v=1')).toBeNull();
  });

  it('round-trips with quizUrl', () => {
    for (const [seed, beat] of [
      [1, 0],
      [987654321, ROUND_SIZE],
      [42, undefined],
    ] as const) {
      const url = quizUrl(seed, beat);
      expect(url.startsWith('https://')).toBe(true);
      expect(parseQuizUrl(new URL(url).search)).toEqual(
        beat === undefined ? { seed, beat: null } : { seed, beat },
      );
    }
  });
});

describe('buildShareText', () => {
  const flags = [true, false, true, true, false, true, true, false, true, true];
  const url = 'https://sizecompare.org/quiz/?s=1&b=7&v=1';

  it('renders a header, two 5-square rows and the challenge URL', () => {
    const lines = buildShareText(flags, 7, url).split('\n');
    expect(lines[0]).toBe(`SizeCompare Quiz 📏 7/${ROUND_SIZE}`);
    expect(lines[1]).toBe('🟩🟥🟩🟩🟥');
    expect(lines[2]).toBe('🟩🟩🟥🟩🟩');
    expect(lines[3]).toBe(`Same ${ROUND_SIZE} questions — can you beat me?`);
    expect(lines[4]).toBe(url);
  });

  it('maps every answer to exactly one square', () => {
    const text = buildShareText([true, false, true], 2, url);
    const lines = text.split('\n');
    expect(lines[1]).toBe('🟩🟥🟩');
    expect(lines[2]).toBe(`Same ${ROUND_SIZE} questions — can you beat me?`);
    expect((text.match(/🟩|🟥/gu) ?? []).length).toBe(3);
  });
});
