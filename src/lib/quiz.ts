/**
 * Quiz engine — pure question generation and round picking, no React.
 *
 * The question pool is deterministic (sorted), built from the curated
 * PAIRS list plus every auto-generated pair from the library whose size
 * ratio makes an interesting-but-fairable question. Rounds are drawn
 * with a seeded RNG (mulberry32) so a seed fully determines a round.
 */

import { LIBRARY_BY_ID, OBJECT_LIBRARY } from '../data/library';
import { PAIRS } from '../data/pairs';
import { ALL_ATTRS, type AttributeKey } from './attributes';

export type Tier = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  aId: string;
  bId: string;
  attr: AttributeKey;
  /** bigger value / smaller value, always ≥ RATIO_MIN. */
  ratio: number;
  tier: Tier;
  /** From the hand-curated PAIRS list (has its own compare page). */
  curated: boolean;
}

/** Below this ratio the question is a coin flip; above it, a giveaway. */
export const RATIO_MIN = 1.2;
export const RATIO_MAX = 80;

export const ROUND_SIZE = 10;
export const TIER_SIZES: Record<Tier, number> = { easy: 3, medium: 4, hard: 3 };

export function tierFromRatio(ratio: number): Tier {
  if (ratio >= 3) return 'easy';
  if (ratio >= 1.6) return 'medium';
  return 'hard';
}

function valueOf(id: string, attr: AttributeKey): number {
  return LIBRARY_BY_ID[id]?.measurements[attr]?.value ?? 0;
}

/** The side that is actually bigger ('a' or 'b'); ties count for 'a'. */
export function biggerSide(q: Pick<QuizQuestion, 'aId' | 'bId' | 'attr'>): 'a' | 'b' {
  return valueOf(q.aId, q.attr) >= valueOf(q.bId, q.attr) ? 'a' : 'b';
}

/** The question the player is asked, e.g. "Which is taller?" */
export function askPhrase(attr: AttributeKey): string {
  switch (attr) {
    case 'weight':
      return 'Which is heavier?';
    case 'volume':
      return 'Which has more volume?';
    case 'area':
      return 'Which has more area?';
    case 'height':
      return 'Which is taller?';
    case 'width':
      return 'Which is wider?';
    case 'diameter':
      return 'Which is wider?';
    default:
      return 'Which is longer?';
  }
}

function questionKey(aId: string, bId: string, attr: AttributeKey): string {
  return [aId, bId].sort().join('|') + '#' + attr;
}

/**
 * Deterministic question pool: curated pairs first-class, then every
 * library pair sharing an attribute with a ratio in [RATIO_MIN,
 * RATIO_MAX]. Both sides must actually carry the measurement.
 */
export function buildQuestionPool(): QuizQuestion[] {
  const pool = new Map<string, QuizQuestion>();

  const add = (aId: string, bId: string, attr: AttributeKey, curated: boolean) => {
    const va = valueOf(aId, attr);
    const vb = valueOf(bId, attr);
    if (va <= 0 || vb <= 0) return;
    const ratio = Math.max(va, vb) / Math.min(va, vb);
    if (ratio < RATIO_MIN || ratio > RATIO_MAX) return;
    const key = questionKey(aId, bId, attr);
    if (pool.has(key)) return; // curated wins (added first)
    pool.set(key, { aId, bId, attr, ratio, tier: tierFromRatio(ratio), curated });
  };

  for (const p of PAIRS) add(p.a, p.b, p.attr, true);

  for (const attr of ALL_ATTRS) {
    const carriers = OBJECT_LIBRARY.filter((r) => (r.measurements[attr]?.value ?? 0) > 0);
    for (let i = 0; i < carriers.length; i++) {
      for (let j = i + 1; j < carriers.length; j++) {
        add(carriers[i].id, carriers[j].id, attr, false);
      }
    }
  }

  return [...pool.values()].sort((x, y) =>
    x.aId === y.aId ? (x.bId < y.bId ? -1 : 1) : x.aId < y.aId ? -1 : 1,
  );
}

/** Small fast seeded RNG (mulberry32) — one seed fully pins a round. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rng: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface RoundQuestion extends QuizQuestion {
  /** Presentation order is randomised so the bigger side isn't always A. */
  leftId: string;
  rightId: string;
}

/**
 * Pick one round: 3 easy + 4 medium + 3 hard, no object reused within the
 * round, presented easiest-first. Falls back across tiers if one runs
 * short (only possible in tiny libraries).
 */
export function pickRound(pool: QuizQuestion[], seed: number): RoundQuestion[] {
  const rng = mulberry32(seed);
  const byTier: Record<Tier, QuizQuestion[]> = {
    easy: shuffle(pool.filter((q) => q.tier === 'easy'), rng),
    medium: shuffle(pool.filter((q) => q.tier === 'medium'), rng),
    hard: shuffle(pool.filter((q) => q.tier === 'hard'), rng),
  };

  const used = new Set<string>();
  const picked: QuizQuestion[] = [];
  const order: Tier[] = ['easy', 'medium', 'hard'];

  const take = (tier: Tier, count: number) => {
    let got = 0;
    for (const q of byTier[tier]) {
      if (got >= count) break;
      if (used.has(q.aId) || used.has(q.bId)) continue;
      used.add(q.aId);
      used.add(q.bId);
      picked.push(q);
      got++;
    }
    return got;
  };

  let remaining = ROUND_SIZE;
  for (const tier of order) {
    const want = Math.min(TIER_SIZES[tier], remaining);
    remaining -= take(tier, want);
  }
  // last-resort fill ignores the no-reuse rule rather than shorting the round
  if (remaining > 0) {
    const rest = shuffle(pool.filter((q) => !picked.includes(q)), rng);
    picked.push(...rest.slice(0, remaining));
  }

  return picked.map((q) => {
    const flip = rng() < 0.5;
    return {
      ...q,
      leftId: flip ? q.bId : q.aId,
      rightId: flip ? q.aId : q.bId,
    };
  });
}
