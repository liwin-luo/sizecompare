/**
 * Site-wide configuration. GA4_ID stays empty until a real
 * measurement ID exists — the tracking script is skipped entirely
 * when empty, so nothing is loaded or shipped by accident.
 */
export const SITE = {
  name: 'SizeCompare',
  origin: 'https://sizecompare.org',
  tagline: 'Compare anything — height, weight, volume, area',
  description:
    'Compare sizes, weights, volumes, areas, populations and speeds at true scale — animals, planets, countries, everyday things. 290+ sourced objects. Free.',
  ga4Id: '',
} as const;
