/**
 * Curated comparison pairs — the discovery layer's SEO pages.
 *
 * Every pair must pass the integrity test in pairs.test.ts: both ids
 * exist in the library, and both objects carry the shared attribute.
 * Blurbs are hand-written; no template-generated N² combinations.
 */

import { LIBRARY_BY_ID } from './library';
import type { AttributeKey } from '../lib/attributes';

export interface Pair {
  /** Library id of object A (the "bigger" side is computed at render). */
  a: string;
  b: string;
  /** The attribute every visitor compares. */
  attr: AttributeKey;
  /** Hand-written page title without the names (names are prepended). */
  title: string;
  /** One-sentence editorial hook shown as the page lede. */
  blurb: string;
  /** Suggested question for the Studio preload. */
  question: string;
}

export const PAIRS: Pair[] = [
  /* animals — height */
  {
    a: 'elephant',
    b: 'adult',
    attr: 'height',
    title: '— How tall is an elephant next to a person?',
    blurb:
      'The tallest land animal alive today against a typical adult human — the difference is larger than most people expect.',
    question: 'How many adults, standing on each other, would reach the elephant?',
  },
  {
    a: 'giraffe',
    b: 'elephant',
    attr: 'height',
    title: '— The two tallest giants compared',
    blurb:
      'Giraffe vs elephant: the tallest animal against the heaviest land animal. Which one actually stands taller?',
    question: 'Which is taller — and by how many metres?',
  },
  {
    a: 'trex',
    b: 'elephant',
    attr: 'height',
    title: '— Dinosaur vs elephant',
    blurb:
      'If T. rex walked past an African elephant, who would look down at whom? (All dinosaur sizes here are fossil estimates.)',
    question: 'Could T. rex have looked over the elephant?',
  },
  {
    a: 'giraffe',
    b: 'child',
    attr: 'height',
    title: '— A giraffe next to an 8-year-old',
    blurb:
      'A giraffe stands roughly four times taller than an average 8-year-old — a favourite first scale comparison.',
    question: 'How many children stacked up would match one giraffe?',
  },
  {
    a: 'ostrich',
    b: 'adult',
    attr: 'height',
    title: '— The tallest bird vs a person',
    blurb:
      'An ostrich stands about 2.7 m tall — noticeably taller than most adults, and the fastest two-legged runner on Earth.',
    question: 'Is the ostrich taller than you?',
  },
  {
    a: 'polarbear',
    b: 'lion',
    attr: 'height',
    title: '— Two big predators, shoulder to shoulder',
    blurb:
      'Polar bear and lion, compared at the shoulder. One is built for Arctic ambush, the other for savanna teamwork.',
    question: 'Which predator stands taller at the shoulder?',
  },
  {
    a: 'horse',
    b: 'cow',
    attr: 'height',
    title: '— Farm giants compared',
    blurb:
      'A riding horse and a dairy cow measured at the withers — closer in size than many people guess.',
    question: 'Which is taller, and how close is the other?',
  },
  {
    a: 'penguin',
    b: 'cat',
    attr: 'height',
    title: '— An emperor penguin next to a cat',
    blurb:
      'The largest living penguin stands well over twice the shoulder height of a typical house cat.',
    question: 'How many cats stacked up match one emperor penguin?',
  },
  /* animals — length */
  {
    a: 'bluewhale',
    b: 'bus',
    attr: 'length',
    title: '— The largest animal ever vs a school bus',
    blurb:
      'An adult blue whale is roughly twice as long as a full-size school bus — the largest animal ever measured against an everyday giant.',
    question: 'About how many school buses laid end to end equal one blue whale?',
  },
  {
    a: 'shark',
    b: 'car',
    attr: 'length',
    title: '— Great white shark vs a car',
    blurb:
      'A large great white shark is about as long as the sedan in your driveway — with roughly a tonne more mass.',
    question: 'Would a great white fit in one parking space?',
  },
  {
    a: 'rabbit',
    b: 'mouse',
    attr: 'length',
    title: '— Rabbit vs mouse',
    blurb:
      'A rabbit is about five times longer than a house mouse (head-and-body) — small animals, big visible difference.',
    question: 'About how many mice long is the rabbit?',
  },
  /* animals — weight */
  {
    a: 'bluewhale',
    b: 'elephant',
    attr: 'weight',
    title: '— The two heaviest animals compared',
    blurb:
      'The largest animal ever recorded against the heaviest land animal alive: a blue whale weighs roughly 25 elephants.',
    question: 'How many elephants weigh as much as one blue whale?',
  },
  {
    a: 'elephant',
    b: 'dog-labrador',
    attr: 'weight',
    title: '— Elephant vs Labrador',
    blurb:
      'A family dog against an African elephant: the scale factor is the kind of number students remember.',
    question: 'About how many Labradors weigh as much as one elephant?',
  },
  {
    a: 'car',
    b: 'elephant',
    attr: 'weight',
    title: '— Car vs elephant',
    blurb:
      'A mid-size sedan weighs about a quarter of an African elephant — metal and glass against muscle and bone.',
    question: 'Which is heavier — and by roughly how much?',
  },
  {
    a: 'bus',
    b: 'elephant',
    attr: 'weight',
    title: '— School bus vs elephant',
    blurb:
      'A full-size school bus outweighs an adult elephant by roughly two to one — empty, without any passengers.',
    question: 'How many elephants balance one empty school bus?',
  },
  {
    a: 'bicycle',
    b: 'car',
    attr: 'weight',
    title: '— Bicycle vs car',
    blurb:
      'A city bike weighs about 125 times less than a mid-size sedan — the clearest everyday weight contrast there is.',
    question: 'About how many bicycles weigh as much as one car?',
  },
  {
    a: 'elephant',
    b: 'trex',
    attr: 'weight',
    title: '— Elephant vs T. rex',
    blurb:
      'Mass estimates put an adult T. rex a bit heavier than an African elephant — with far more of that weight on two legs. (Fossil estimate.)',
    question: 'Which weighed more, and how uncertain are the numbers?',
  },
  {
    a: 'giraffe',
    b: 'horse',
    attr: 'weight',
    title: '— Giraffe vs horse',
    blurb:
      'A giraffe weighs roughly two to three riding horses — most of it high up on that long neck.',
    question: 'How many horses balance one giraffe?',
  },
  /* space — diameter & volume */
  {
    a: 'sun',
    b: 'earth',
    attr: 'diameter',
    title: '— Sun vs Earth',
    blurb:
      'About 109 Earths would fit across the Sun’s face — and over a million Earths inside it.',
    question: 'How many Earths wide is the Sun?',
  },
  {
    a: 'jupiter',
    b: 'earth',
    attr: 'diameter',
    title: '— Jupiter vs Earth',
    blurb:
      'Jupiter is the largest planet in the solar system — about 11 Earth diameters across, and it could swallow 1,300 Earths by volume.',
    question: 'How many Earths would fit across Jupiter?',
  },
  {
    a: 'earth',
    b: 'moon',
    attr: 'diameter',
    title: '— Earth vs Moon',
    blurb:
      'The Moon is about a quarter of Earth’s diameter — the largest moon relative to its planet in the solar system.',
    question: 'About how many Moons would span Earth?',
  },
  {
    a: 'earth',
    b: 'mars',
    attr: 'diameter',
    title: '— Earth vs Mars',
    blurb:
      'Mars is about half the diameter of Earth — the reason a day there is similar but everything else is smaller.',
    question: 'Roughly how many Mars diameters equal Earth’s?',
  },
  {
    a: 'sun',
    b: 'jupiter',
    attr: 'volume',
    title: '— Sun vs Jupiter (volume)',
    blurb:
      'Even Jupiter is tiny next to the Sun: about 1,000 Jupiters would fit inside it.',
    question: 'About how many Jupiters would fill the Sun?',
  },
  {
    a: 'moon',
    b: 'earth',
    attr: 'volume',
    title: '— Moon vs Earth (volume)',
    blurb:
      'Diameters are only 4× apart, but volumes are 49× apart — a striking lesson in how cubes grow faster than lines.',
    question: 'About how many Moons would fill Earth?',
  },
  /* buildings — height */
  {
    a: 'burj',
    b: 'eiffel',
    attr: 'height',
    title: '— Burj Khalifa vs Eiffel Tower',
    blurb:
      'The tallest building in the world against the tower that held the record for 41 years — more than 2.5× taller.',
    question: 'How many Eiffel Towers tall is the Burj Khalifa?',
  },
  {
    a: 'eiffel',
    b: 'liberty',
    attr: 'height',
    title: '— Eiffel Tower vs Statue of Liberty',
    blurb:
      'Paris’s iron lady against New York’s copper one — the Eiffel Tower is more than three times taller, pedestal included.',
    question: 'About how many Statues of Liberty stack up to the Eiffel Tower?',
  },
  {
    a: 'everest',
    b: 'burj',
    attr: 'height',
    title: '— Mount Everest vs Burj Khalifa',
    blurb:
      'The tallest mountain against the tallest building: you could stack more than ten Burj Khalifas up Everest’s flank. (Everest height is measured from sea level.)',
    question: 'About how many Burj Khalifas would reach up Everest?',
  },
  {
    a: 'giraffe',
    b: 'burj',
    attr: 'height',
    title: '— Giraffe vs Burj Khalifa',
    blurb:
      'The tallest animal against the tallest building: about 150 giraffes, trunk to toe, would match the Burj Khalifa.',
    question: 'About how many giraffes tall is the Burj Khalifa?',
  },
  /* vehicles — length */
  {
    a: 'bus',
    b: 'car',
    attr: 'length',
    title: '— School bus vs sedan',
    blurb:
      'A full-size school bus is about two and a half sedans long — easy to see in any school pickup line.',
    question: 'About how many cars long is the bus?',
  },
  {
    a: 'car',
    b: 'bicycle',
    attr: 'length',
    title: '— Sedan vs bicycle',
    blurb:
      'A mid-size sedan is nearly three bicycles long — the everyday comparison that makes metres tangible.',
    question: 'About how many bikes long is the car?',
  },
  /* everyday — diameter & volume */
  {
    a: 'basketball',
    b: 'tennisball',
    attr: 'diameter',
    title: '— Basketball vs tennis ball',
    blurb:
      'The two most-compared balls in sport: a basketball’s diameter is about 3.5 tennis balls.',
    question: 'About how many tennis balls wide is the basketball?',
  },
  {
    a: 'apple',
    b: 'orange',
    attr: 'diameter',
    title: '— Apple vs orange',
    blurb:
      'The classic fruit comparison — and closer in size than most people guess before they measure.',
    question: 'Which fruit is wider, and by how much?',
  },
  {
    a: 'bottle',
    b: 'sodacan',
    attr: 'volume',
    title: '— 500 ml bottle vs soda can (volume)',
    blurb:
      'A 500 ml bottle holds 145 ml more than a 12 oz can — a small-looking difference that is 40% extra.',
    question: 'How much more does the bottle hold than the can?',
  },
  {
    a: 'basketball',
    b: 'sodacan',
    attr: 'volume',
    title: '— Basketball vs soda can (volume)',
    blurb:
      'A basketball’s volume is about 20 soda cans — a great way to feel what litres mean.',
    question: 'About how many cans of soda would fill a basketball?',
  },
];

export function pairSlug(pair: Pair): string {
  return `${pair.a}-vs-${pair.b}`;
}

export function pairBySlug(slug: string): Pair | null {
  return PAIRS.find((p) => pairSlug(p) === slug) ?? null;
}

/** Integrity check used by tests and by build-time validation. */
export function validatePairs(): { ok: true } | { ok: false; error: string } {
  for (const pair of PAIRS) {
    for (const id of [pair.a, pair.b]) {
      if (!(id in LIBRARY_BY_ID)) return { ok: false, error: `Unknown id: ${id}` };
    }
    const has = [pair.a, pair.b].every((id) => pair.attr in LIBRARY_BY_ID[id].measurements);
    if (!has) {
      return { ok: false, error: `${pair.a} vs ${pair.b}: attribute ${pair.attr} missing` };
    }
  }
  const slugs = new Set(PAIRS.map(pairSlug));
  if (slugs.size !== PAIRS.length) return { ok: false, error: 'Duplicate pair slugs' };
  return { ok: true };
}
