/**
 * Site-wide configuration. GA4_ID stays empty until a real
 * measurement ID exists — the tracking script is skipped entirely
 * when empty, so nothing is loaded or shipped by accident.
 */
export const SITE = {
  name: 'SizeCompare',
  origin: 'https://sizecompare.org',
  tagline: 'Compare anything — height, weight, volume',
  description:
    'Compare the real sizes, weights, and volumes of animals, objects, planets, and more — at true scale. Search 50+ measured objects, explore curated comparisons, or add your own. Free, no sign-up.',
  ga4Id: '',
} as const;
