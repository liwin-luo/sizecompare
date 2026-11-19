/**
 * Original silhouette library — every shape is drawn here from scratch
 * (simple geometry, no traced or copied artwork). License: CC0.
 *
 * Each silhouette declares a viewBox whose aspect ratio equals the
 * `aspect` field on its ObjectRecord, so the renderer can place it in a
 * true-scale box without distortion: the measured axis is driven by the
 * real millimetre value; the perpendicular axis follows the drawing's
 * own proportions (representative, as noted in the product plan §4.3).
 *
 * All fills are literal colours passed as props — never CSS variables —
 * so exported SVG stays self-contained.
 */

import type { ReactElement } from 'react';

export interface Silhouette {
  viewBox: string;
  render: (color: string) => ReactElement;
}

/** Slightly darker shade for two-tone details. */
function shade(color: string): string {
  return `${color}cc`; // 80% alpha over the same hue reads as a darker tone
}

export const SILHOUETTES: Record<string, Silhouette> = {
  /* ── classroom ── */
  pencil: {
    viewBox: '0 0 14 100',
    render: (c) => (
      <>
        <rect x="3" y="0" width="8" height="76" rx="1.5" fill={c} />
        <rect x="3" y="0" width="8" height="6" rx="1.5" fill={shade(c)} />
        <polygon points="3,76 11,76 7,96" fill={shade(c)} />
      </>
    ),
  },
  eraser: {
    viewBox: '0 0 240 100',
    render: (c) => (
      <>
        <rect x="4" y="18" width="232" height="76" rx="10" fill={c} />
        <rect x="150" y="18" width="86" height="76" rx="10" fill={shade(c)} />
      </>
    ),
  },
  ruler: {
    viewBox: '0 0 6 100',
    render: (c) => (
      <>
        <rect x="0" y="0" width="6" height="100" rx="1" fill={c} />
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((y) => (
          <rect key={y} x="0" y={y} width="3" height="1" fill="#ffffff" opacity="0.9" />
        ))}
      </>
    ),
  },
  book: {
    viewBox: '0 0 68 100',
    render: (c) => (
      <>
        <rect x="4" y="2" width="60" height="96" rx="3" fill={c} />
        <rect x="10" y="0" width="6" height="96" fill={shade(c)} />
        <line x1="16" y1="8" x2="58" y2="8" stroke="#fff" strokeWidth="3" opacity="0.7" />
        <line x1="16" y1="16" x2="46" y2="16" stroke="#fff" strokeWidth="3" opacity="0.7" />
      </>
    ),
  },
  desk: {
    viewBox: '0 0 220 100',
    render: (c) => (
      <>
        <rect x="0" y="14" width="220" height="10" rx="3" fill={c} />
        <rect x="12" y="24" width="10" height="76" fill={shade(c)} />
        <rect x="198" y="24" width="10" height="76" fill={shade(c)} />
        <rect x="120" y="24" width="86" height="8" fill={shade(c)} />
      </>
    ),
  },
  door: {
    viewBox: '0 0 44 100',
    render: (c) => (
      <>
        <rect x="1" y="0" width="42" height="100" rx="2" fill={c} />
        <circle cx="34" cy="52" r="2.6" fill="#fff" opacity="0.85" />
        <rect x="8" y="12" width="28" height="34" rx="1.5" fill={shade(c)} />
        <rect x="8" y="54" width="28" height="34" rx="1.5" fill={shade(c)} />
      </>
    ),
  },

  /* ── everyday ── */
  apple: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="56" r="42" fill={c} />
        <rect x="47.5" y="6" width="5" height="14" rx="2" fill={shade(c)} />
        <path d="M50 14 Q 66 4 70 16 Q 58 24 50 14" fill={shade(c)} />
      </>
    ),
  },
  basketball: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="47" fill={c} />
        <path
          d="M3 50 H97 M50 3 V97 M18 14 Q50 50 18 86 M82 14 Q50 50 82 86"
          stroke="#fff"
          strokeWidth="2.4"
          fill="none"
          opacity="0.8"
        />
      </>
    ),
  },
  tennisball: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="47" fill={c} />
        <path
          d="M8 22 Q38 50 8 78 M92 22 Q62 50 92 78"
          stroke="#fff"
          strokeWidth="3.4"
          fill="none"
          opacity="0.9"
        />
      </>
    ),
  },
  a4paper: {
    viewBox: '0 0 71 100',
    render: (c) => (
      <>
        <rect x="1" y="1" width="69" height="98" rx="1" fill={c} />
        <line x1="12" y1="16" x2="59" y2="16" stroke="#fff" strokeWidth="3" opacity="0.8" />
        <line x1="12" y1="26" x2="48" y2="26" stroke="#fff" strokeWidth="3" opacity="0.6" />
        <line x1="12" y1="36" x2="54" y2="36" stroke="#fff" strokeWidth="3" opacity="0.6" />
      </>
    ),
  },
  creditcard: {
    viewBox: '0 0 159 100',
    render: (c) => (
      <>
        <rect x="1" y="4" width="157" height="92" rx="8" fill={c} />
        <rect x="10" y="18" width="34" height="22" rx="3" fill={shade(c)} />
        <rect x="12" y="60" width="80" height="7" rx="2" fill="#fff" opacity="0.7" />
        <rect x="12" y="72" width="56" height="6" rx="2" fill="#fff" opacity="0.5" />
      </>
    ),
  },
  sodacan: {
    viewBox: '0 0 47 100',
    render: (c) => (
      <>
        <rect x="2" y="4" width="43" height="92" rx="8" fill={c} />
        <ellipse cx="23.5" cy="8" rx="21" ry="5" fill={shade(c)} />
        <ellipse cx="23.5" cy="8" rx="14" ry="3.4" fill="#fff" opacity="0.55" />
      </>
    ),
  },

  /* ── animals ── */
  mouse: {
    viewBox: '0 0 160 100',
    render: (c) => (
      <>
        <ellipse cx="72" cy="66" rx="52" ry="28" fill={c} />
        <circle cx="126" cy="52" r="20" fill={c} />
        <circle cx="147" cy="44" r="7" fill={shade(c)} />
        <circle cx="141" cy="42" r="2" fill="#fff" />
        <circle cx="152" cy="42" r="2" fill="#fff" />
        <path d="M124 30 Q112 16 104 30 Q112 38 124 34" fill={shade(c)} />
        <path d="M22 62 Q4 52 8 72 Q14 80 26 74" fill={shade(c)} />
      </>
    ),
  },
  cat: {
    viewBox: '0 0 120 100',
    render: (c) => (
      <>
        <ellipse cx="58" cy="52" rx="34" ry="24" fill={c} />
        <rect x="44" y="66" width="9" height="30" rx="4" fill={c} />
        <rect x="66" y="66" width="9" height="30" rx="4" fill={c} />
        <circle cx="92" cy="34" r="16" fill={c} />
        <polygon points="80,26 82,8 92,20" fill={c} />
        <polygon points="104,26 102,8 94,20" fill={c} />
        <path d="M24 46 Q6 38 12 54 Q18 60 28 56" fill={c} />
        <circle cx="86" cy="32" r="2.2" fill="#fff" />
        <circle cx="98" cy="32" r="2.2" fill="#fff" />
      </>
    ),
  },
  dog: {
    viewBox: '0 0 180 100',
    render: (c) => (
      <>
        <ellipse cx="80" cy="48" rx="52" ry="26" fill={c} />
        <rect x="52" y="62" width="11" height="34" rx="5" fill={c} />
        <rect x="92" y="62" width="11" height="34" rx="5" fill={c} />
        <rect x="120" y="42" width="10" height="24" rx="4" fill={shade(c)} />
        <circle cx="146" cy="32" r="18" fill={c} />
        <ellipse cx="162" cy="38" rx="10" ry="7" fill={shade(c)} />
        <path d="M144 14 Q138 2 132 12" fill={shade(c)} />
        <circle cx="140" cy="30" r="2.4" fill="#fff" />
        <circle cx="152" cy="30" r="2.4" fill="#fff" />
      </>
    ),
  },
  elephant: {
    viewBox: '0 0 150 100',
    render: (c) => (
      <>
        <ellipse cx="66" cy="52" rx="48" ry="34" fill={c} />
        <rect x="30" y="76" width="16" height="22" rx="6" fill={c} />
        <rect x="82" y="76" width="16" height="22" rx="6" fill={c} />
        <circle cx="122" cy="44" r="24" fill={c} />
        <path
          d="M140 52 Q152 62 148 78 Q144 90 134 88 Q142 74 134 62"
          fill={c}
        />
        <ellipse cx="126" cy="24" rx="10" ry="7" fill={shade(c)} />
        <path d="M30 30 Q14 18 18 40 Q22 50 34 44" fill={c} />
      </>
    ),
  },
  giraffe: {
    viewBox: '0 0 45 100',
    render: (c) => (
      <>
        <ellipse cx="20" cy="44" rx="14" ry="26" fill={c} />
        <rect x="12" y="64" width="5" height="30" rx="2" fill={c} />
        <rect x="24" y="64" width="5" height="30" rx="2" fill={c} />
        <rect x="30" y="46" width="4" height="22" rx="2" fill={c} />
        <rect x="22" y="8" width="6" height="16" rx="3" fill={c} />
        <ellipse cx="25" cy="8" rx="7" ry="6" fill={c} />
        <circle cx="28" cy="7" r="1.4" fill="#fff" />
        <path d="M20 2 Q22 -2 24 2" stroke={shade(c)} strokeWidth="2" fill="none" />
        <path d="M28 2 Q30 -2 32 2" stroke={shade(c)} strokeWidth="2" fill="none" />
      </>
    ),
  },
  bluewhale: {
    viewBox: '0 0 380 100',
    render: (c) => (
      <>
        <path
          d="M20 58 Q60 22 150 26 Q260 30 330 16 Q356 10 366 30 Q372 44 358 54 Q300 84 180 82 Q80 80 34 74 Q14 70 20 58"
          fill={c}
        />
        <path d="M340 22 Q356 4 372 8 Q366 24 352 32" fill={shade(c)} />
        <path d="M120 30 L150 12 L160 30" fill={c} opacity="0.85" />
        <circle cx="52" cy="52" r="2.6" fill="#fff" />
      </>
    ),
  },

  /* ── references ── */
  child: {
    viewBox: '0 0 30 100',
    render: (c) => (
      <>
        <circle cx="15" cy="12" r="9" fill={c} />
        <rect x="9" y="22" width="12" height="34" rx="5" fill={c} />
        <rect x="8" y="30" width="4" height="26" rx="2" fill={c} />
        <rect x="18" y="30" width="4" height="26" rx="2" fill={c} />
        <rect x="9" y="56" width="4.6" height="42" rx="2" fill={c} />
        <rect x="16.4" y="56" width="4.6" height="42" rx="2" fill={c} />
      </>
    ),
  },
  adult: {
    viewBox: '0 0 28 100',
    render: (c) => (
      <>
        <circle cx="14" cy="10" r="8" fill={c} />
        <path d="M5 20 Q14 16 23 20 L24 52 L4 52 Z" fill={c} />
        <rect x="2" y="30" width="4" height="26" rx="2" fill={c} />
        <rect x="22" y="30" width="4" height="26" rx="2" fill={c} />
        <rect x="8" y="52" width="4.6" height="46" rx="2" fill={c} />
        <rect x="15.4" y="52" width="4.6" height="46" rx="2" fill={c} />
      </>
    ),
  },
};
