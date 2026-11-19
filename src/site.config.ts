/**
 * Site-wide configuration. GA4_ID stays empty until a real
 * measurement ID exists — the tracking script is skipped entirely
 * when empty, so nothing is loaded or shipped by accident.
 */
export const SITE = {
  name: 'SizeCompare',
  origin: 'https://sizecompare.org',
  tagline: 'Turn measurements into visuals kids can understand',
  description:
    'Create accurate, classroom-ready size comparisons from real objects, animals, and custom measurements. Present full-screen or print A4/Letter worksheets — free, no sign-up.',
  ga4Id: '',
} as const;
