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

  /* ── commercial products (neutral, true-proportion drawings) ── */
  tvpanel: {
    viewBox: '0 0 160 90',
    render: (c) => (
      <>
        <rect x="0" y="0" width="160" height="90" rx="3" fill="#0f172a" />
        <rect x="4" y="4" width="152" height="82" rx="1.5" fill="#1e293b" />
        <rect x="4" y="4" width="152" height="82" rx="1.5" fill={c} opacity="0.1" />
        <circle cx="153" cy="86" r="1" fill={c} />
      </>
    ),
  },
  mattress: {
    viewBox: '0 0 150 200',
    render: (c) => (
      <>
        <rect x="3" y="3" width="144" height="194" rx="10" fill="#e2e8f0" stroke={shade(c)} strokeWidth="4" />
        <rect x="16" y="16" width="118" height="42" rx="7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="16" y1="82" x2="134" y2="82" stroke="#cbd5e1" strokeWidth="2" />
      </>
    ),
  },
  suitcase: {
    viewBox: '0 0 80 100',
    render: (c) => (
      <>
        <rect x="30" y="1" width="20" height="5" rx="2.5" fill="#334155" />
        <rect x="38" y="4" width="4" height="12" fill="#334155" />
        <rect x="6" y="16" width="68" height="74" rx="8" fill={c} />
        <rect x="6" y="16" width="68" height="12" rx="6" fill={shade(c)} />
        <rect x="6" y="47" width="68" height="4" fill={shade(c)} />
        <rect x="10" y="90" width="9" height="7" rx="2" fill="#334155" />
        <rect x="61" y="90" width="9" height="7" rx="2" fill="#334155" />
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

  /* ── animals (wave 2) ── */
  trex: {
    viewBox: '0 0 60 100',
    render: (c) => (
      <>
        <ellipse cx="26" cy="40" rx="22" ry="16" fill={c} />
        <rect x="12" y="52" width="10" height="44" rx="4" fill={c} />
        <rect x="30" y="52" width="9" height="30" rx="4" fill={c} />
        <path d="M44 30 Q52 26 56 34 Q60 42 52 46 Q46 48 42 42" fill={c} />
        <path d="M10 34 Q0 36 2 44 Q6 48 14 44" fill={c} />
        <circle cx="52" cy="36" r="2.4" fill="#fff" />
      </>
    ),
  },
  polarbear: {
    viewBox: '0 0 190 100',
    render: (c) => (
      <>
        <ellipse cx="80" cy="52" rx="60" ry="28" fill={c} />
        <rect x="36" y="70" width="14" height="28" rx="6" fill={c} />
        <rect x="60" y="72" width="13" height="26" rx="6" fill={c} />
        <rect x="92" y="70" width="14" height="28" rx="6" fill={c} />
        <rect x="116" y="72" width="13" height="26" rx="6" fill={c} />
        <circle cx="150" cy="40" r="20" fill={c} />
        <circle cx="164" cy="34" r="7" fill={c} />
        <circle cx="169" cy="33" r="2.2" fill="#fff" />
        <path d="M128 22 Q118 8 112 22 Q118 30 128 28" fill={c} />
        <path d="M146 20 Q138 6 132 20 Q138 28 146 26" fill={c} />
      </>
    ),
  },
  ostrich: {
    viewBox: '0 0 40 100',
    render: (c) => (
      <>
        <ellipse cx="20" cy="42" rx="14" ry="20" fill={c} />
        <rect x="16" y="58" width="4.6" height="38" rx="2" fill={c} />
        <rect x="22" y="58" width="4.6" height="38" rx="2" fill={c} />
        <path d="M18 24 Q16 10 24 8 Q30 10 26 22" fill={c} />
        <ellipse cx="25" cy="7" rx="6" ry="4.5" fill={c} />
        <circle cx="28" cy="6" r="1.4" fill="#fff" />
        <path d="M6 40 Q0 44 4 50 Q10 50 10 44" fill={c} />
      </>
    ),
  },
  lion: {
    viewBox: '0 0 170 100',
    render: (c) => (
      <>
        <ellipse cx="70" cy="52" rx="48" ry="26" fill={c} />
        <rect x="44" y="66" width="11" height="32" rx="5" fill={c} />
        <rect x="84" y="66" width="11" height="32" rx="5" fill={c} />
        <path d="M24 44 Q8 36 12 54 Q18 62 30 56" fill={c} />
        <circle cx="136" cy="36" r="24" fill={shade(c)} />
        <circle cx="136" cy="36" r="16" fill={c} />
        <path d="M148 44 Q158 50 154 58" fill={shade(c)} />
        <circle cx="130" cy="34" r="2.4" fill="#fff" />
        <circle cx="142" cy="34" r="2.4" fill="#fff" />
      </>
    ),
  },
  pig: {
    viewBox: '0 0 170 100',
    render: (c) => (
      <>
        <ellipse cx="76" cy="54" rx="54" ry="30" fill={c} />
        <rect x="44" y="72" width="12" height="26" rx="5" fill={c} />
        <rect x="62" y="74" width="11" height="24" rx="5" fill={c} />
        <rect x="92" y="72" width="12" height="26" rx="5" fill={c} />
        <rect x="108" y="74" width="11" height="24" rx="5" fill={c} />
        <circle cx="140" cy="50" r="22" fill={c} />
        <ellipse cx="154" cy="52" rx="10" ry="7" fill={shade(c)} />
        <circle cx="151" cy="52" r="2" fill="#fff" />
        <circle cx="157" cy="52" r="2" fill="#fff" />
        <path d="M36 42 Q22 30 24 44 Q26 54 40 52" fill={shade(c)} />
        <circle cx="136" cy="42" r="2.2" fill="#fff" />
      </>
    ),
  },
  cow: {
    viewBox: '0 0 170 100',
    render: (c) => (
      <>
        <ellipse cx="74" cy="50" rx="52" ry="28" fill={c} />
        <rect x="42" y="66" width="12" height="32" rx="5" fill={c} />
        <rect x="60" y="68" width="11" height="30" rx="5" fill={c} />
        <rect x="90" y="66" width="12" height="32" rx="5" fill={c} />
        <rect x="106" y="68" width="11" height="30" rx="5" fill={c} />
        <circle cx="138" cy="42" r="20" fill={c} />
        <ellipse cx="154" cy="46" rx="9" ry="6" fill={shade(c)} />
        <path d="M120 18 Q112 4 124 6 Q132 10 128 20" fill={shade(c)} />
        <ellipse cx="18" cy="42" rx="10" ry="6" fill={shade(c)} />
        <circle cx="134" cy="38" r="2.2" fill="#fff" />
      </>
    ),
  },
  horse: {
    viewBox: '0 0 160 100',
    render: (c) => (
      <>
        <ellipse cx="70" cy="48" rx="46" ry="26" fill={c} />
        <rect x="44" y="62" width="10" height="36" rx="4" fill={c} />
        <rect x="60" y="64" width="9" height="34" rx="4" fill={c} />
        <rect x="84" y="62" width="10" height="36" rx="4" fill={c} />
        <rect x="98" y="64" width="9" height="34" rx="4" fill={c} />
        <path d="M112 40 Q128 34 132 20 Q134 12 128 10 Q122 14 120 26 Q116 34 108 36" fill={c} />
        <ellipse cx="128" cy="16" rx="12" ry="9" fill={c} />
        <path d="M28 36 Q14 24 16 40 Q18 50 32 48" fill={c} />
        <circle cx="132" cy="14" r="1.8" fill="#fff" />
      </>
    ),
  },
  rabbit: {
    viewBox: '0 0 140 100',
    render: (c) => (
      <>
        <ellipse cx="70" cy="62" rx="46" ry="26" fill={c} />
        <circle cx="118" cy="56" r="18" fill={c} />
        <ellipse cx="112" cy="30" rx="6" ry="18" fill={c} transform="rotate(-14 112 30)" />
        <ellipse cx="126" cy="30" rx="6" ry="18" fill={c} transform="rotate(10 126 30)" />
        <path d="M24 58 Q6 50 10 68 Q16 76 28 70" fill={shade(c)} />
        <circle cx="112" cy="54" r="2.2" fill="#fff" />
        <circle cx="124" cy="54" r="2.2" fill="#fff" />
        <circle cx="118" cy="62" r="2.6" fill={shade(c)} />
      </>
    ),
  },
  shark: {
    viewBox: '0 0 190 100',
    render: (c) => (
      <>
        <path
          d="M18 56 Q60 30 120 36 Q160 40 176 34 Q188 30 186 46 Q184 60 168 64 Q110 82 60 72 Q26 66 18 56"
          fill={c}
        />
        <path d="M96 36 L108 10 L118 36" fill={c} />
        <path d="M150 38 Q166 24 178 28 Q172 42 160 46" fill={shade(c)} />
        <path d="M30 62 Q18 76 8 74 Q14 60 24 54" fill={shade(c)} />
        <circle cx="42" cy="50" r="3" fill="#fff" />
        <path d="M26 58 L34 62 L26 64" fill="#fff" opacity="0.6" />
      </>
    ),
  },
  penguin: {
    viewBox: '0 0 42 100',
    render: (c) => (
      <>
        <ellipse cx="21" cy="52" rx="17" ry="42" fill={c} />
        <ellipse cx="21" cy="58" rx="10" ry="28" fill={shade(c)} />
        <circle cx="21" cy="18" r="12" fill={c} />
        <path d="M12 16 Q21 12 30 16 Q28 24 21 24 Q14 24 12 16" fill={shade(c)} />
        <path d="M24 18 Q34 18 33 21 Q30 23 24 21" fill={shade(c)} />
        <circle cx="17" cy="15" r="1.8" fill="#fff" />
        <circle cx="25" cy="15" r="1.8" fill="#fff" />
        <path d="M8 48 Q0 54 4 60 Q10 60 10 52" fill={c} />
        <path d="M34 48 Q42 54 38 60 Q32 60 32 52" fill={c} />
      </>
    ),
  },

  /* ── everyday (wave 2) ── */
  smartphone: {
    viewBox: '0 0 48 100',
    render: (c) => (
      <>
        <rect x="2" y="1" width="44" height="98" rx="7" fill={c} />
        <rect x="5" y="8" width="38" height="84" rx="3" fill={shade(c)} />
        <circle cx="24" cy="95" r="2.4" fill="#fff" opacity="0.7" />
        <rect x="18" y="4" width="12" height="2" rx="1" fill="#fff" opacity="0.5" />
      </>
    ),
  },
  laptop: {
    viewBox: '0 0 145 100',
    render: (c) => (
      <>
        <rect x="10" y="2" width="125" height="78" rx="5" fill={c} />
        <rect x="16" y="8" width="113" height="66" rx="2" fill={shade(c)} />
        <path d="M2 84 L143 84 L136 96 L9 96 Z" fill={c} />
        <rect x="52" y="86" width="40" height="4" rx="2" fill={shade(c)} />
      </>
    ),
  },
  guitar: {
    viewBox: '0 0 42 100',
    render: (c) => (
      <>
        <rect x="19" y="2" width="4" height="42" rx="2" fill={shade(c)} />
        <rect x="15" y="0" width="12" height="10" rx="2" fill={c} />
        <path
          d="M21 38 Q34 38 36 56 Q38 72 30 82 Q26 88 21 88 Q16 88 12 82 Q4 72 6 56 Q8 38 21 38"
          fill={c}
        />
        <circle cx="21" cy="60" r="7" fill={shade(c)} />
        <circle cx="21" cy="60" r="4.5" fill="#fff" opacity="0.25" />
      </>
    ),
  },

  /* ── food ── */
  banana: {
    viewBox: '0 0 180 100',
    render: (c) => (
      <>
        <path
          d="M14 30 Q20 78 78 88 Q136 94 168 62 Q172 56 164 56 Q130 78 84 72 Q40 64 30 26 Q28 18 20 22 Q16 24 14 30"
          fill={c}
        />
        <rect x="10" y="18" width="12" height="8" rx="3" fill={shade(c)} />
      </>
    ),
  },
  egg: {
    viewBox: '0 0 78 100',
    render: (c) => (
      <>
        <path d="M39 4 Q66 26 68 58 Q68 94 39 96 Q10 94 10 58 Q12 26 39 4" fill={c} />
        <ellipse cx="28" cy="40" rx="9" ry="14" fill="#fff" opacity="0.16" />
      </>
    ),
  },
  watermelon: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="52" r="46" fill={c} />
        <path d="M12 36 Q30 18 50 14 Q74 18 88 36" stroke={shade(c)} strokeWidth="5" fill="none" opacity="0.7" />
        <path d="M8 56 Q40 40 92 52" stroke={shade(c)} strokeWidth="5" fill="none" opacity="0.7" />
        <path d="M20 78 Q50 62 82 74" stroke={shade(c)} strokeWidth="5" fill="none" opacity="0.7" />
        <path d="M46 6 Q50 0 56 4" stroke={shade(c)} strokeWidth="3" fill="none" />
      </>
    ),
  },
  pineapple: {
    viewBox: '0 0 55 100',
    render: (c) => (
      <>
        <ellipse cx="27.5" cy="66" rx="20" ry="30" fill={c} />
        <path d="M27.5 38 Q18 20 6 16 Q16 12 26 26 Q22 8 12 2 Q24 4 29 22 Q30 6 40 0 Q36 10 32 24 Q42 12 50 12 Q40 18 32 34" fill={shade(c)} />
        <path d="M12 52 Q28 46 44 52 M10 66 Q28 60 46 66 M14 80 Q28 74 42 80" stroke={shade(c)} strokeWidth="2.4" fill="none" opacity="0.8" />
      </>
    ),
  },
  orange: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="54" r="44" fill={c} />
        <path d="M46 10 Q50 4 54 10" stroke={shade(c)} strokeWidth="4" fill="none" />
        <ellipse cx="32" cy="36" rx="10" ry="14" fill="#fff" opacity="0.14" />
      </>
    ),
  },
  bottle: {
    viewBox: '0 0 28 100',
    render: (c) => (
      <>
        <rect x="9" y="2" width="10" height="6" rx="2" fill={shade(c)} />
        <path d="M9 8 L19 8 L19 26 Q25 34 25 44 L25 92 Q25 98 19 98 L9 98 Q3 98 3 92 L3 44 Q3 34 9 26 Z" fill={c} />
        <rect x="7" y="50" width="14" height="20" rx="2" fill="#fff" opacity="0.28" />
      </>
    ),
  },

  /* ── space ── */
  sun: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="40" fill={c} />
        <circle cx="50" cy="50" r="46" fill="none" stroke={c} strokeWidth="3" opacity="0.4" strokeDasharray="4 6" />
        <circle cx="38" cy="40" r="10" fill={shade(c)} />
        <circle cx="62" cy="60" r="13" fill={shade(c)} />
      </>
    ),
  },
  earth: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="45" fill={c} />
        <path d="M22 34 Q34 22 48 28 Q58 34 48 42 Q34 48 24 42 Z" fill={shade(c)} />
        <path d="M56 56 Q72 50 82 60 Q78 74 62 72 Q52 66 56 56" fill={shade(c)} />
        <path d="M60 18 Q68 14 74 22 Q66 28 60 24 Z" fill={shade(c)} />
      </>
    ),
  },
  moon: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="44" fill={c} />
        <circle cx="36" cy="38" r="9" fill={shade(c)} />
        <circle cx="62" cy="56" r="13" fill={shade(c)} />
        <circle cx="42" cy="66" r="6" fill={shade(c)} />
        <circle cx="66" cy="30" r="5" fill={shade(c)} />
      </>
    ),
  },
  jupiter: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="45" fill={c} />
        <path d="M8 38 Q50 30 92 38" stroke={shade(c)} strokeWidth="6" fill="none" opacity="0.8" />
        <path d="M6 54 Q50 46 94 54" stroke={shade(c)} strokeWidth="8" fill="none" opacity="0.8" />
        <path d="M10 68 Q50 62 90 68" stroke={shade(c)} strokeWidth="5" fill="none" opacity="0.8" />
        <ellipse cx="66" cy="62" rx="9" ry="6" fill={shade(c)} />
      </>
    ),
  },
  mars: {
    viewBox: '0 0 100 100',
    render: (c) => (
      <>
        <circle cx="50" cy="50" r="44" fill={c} />
        <path d="M20 36 Q34 28 50 34 Q60 40 50 46 Q34 50 22 44 Z" fill={shade(c)} />
        <ellipse cx="64" cy="66" rx="12" ry="8" fill={shade(c)} />
        <circle cx="30" cy="70" r="5" fill={shade(c)} />
      </>
    ),
  },

  /* ── buildings ── */
  eiffel: {
    viewBox: '0 0 38 100',
    render: (c) => (
      <>
        <path d="M19 2 L23 30 L26 44 L14 44 L17 30 Z" fill={c} />
        <path d="M26 44 L34 88 L26 88 L21 52 Z M12 44 L4 88 L12 88 L17 52 Z" fill={c} />
        <rect x="12" y="42" width="14" height="5" rx="1.5" fill={c} />
        <rect x="7" y="86" width="24" height="5" rx="1.5" fill={c} />
        <rect x="2" y="95" width="34" height="5" rx="1.5" fill={c} />
        <rect x="16" y="20" width="6" height="3" rx="1" fill={c} />
      </>
    ),
  },
  burj: {
    viewBox: '0 0 17 100',
    render: (c) => (
      <>
        <rect x="7" y="1" width="3" height="12" fill={c} />
        <path d="M5 13 L12 13 L12 30 L5 30 Z" fill={c} />
        <path d="M3 30 L14 30 L14 52 L3 52 Z" fill={c} />
        <path d="M1 52 L16 52 L16 100 L1 100 Z" fill={c} />
        <path d="M4 60 L4 96 M8 58 L8 96 M12 60 L12 96" stroke={shade(c)} strokeWidth="1" />
      </>
    ),
  },
  liberty: {
    viewBox: '0 0 30 100',
    render: (c) => (
      <>
        <rect x="4" y="70" width="22" height="30" fill={c} />
        <rect x="8" y="56" width="14" height="14" fill={shade(c)} />
        <circle cx="15" cy="22" r="6" fill={c} />
        <path d="M10 28 Q15 26 20 28 L21 54 L9 54 Z" fill={c} />
        <rect x="6" y="34" width="3" height="16" rx="1.5" fill={c} />
        <rect x="21" y="32" width="3" height="16" rx="1.5" fill={c} />
        <rect x="22" y="20" width="6" height="2.4" rx="1" fill={c} />
        <path d="M9 14 L15 6 L21 14" fill={c} opacity="0.7" />
      </>
    ),
  },
  everest: {
    viewBox: '0 0 260 100',
    render: (c) => (
      <>
        <path d="M0 100 L96 18 L128 44 L168 10 L260 100 Z" fill={c} />
        <path d="M96 18 L112 32 L104 38 L96 30 L88 36 L82 28 Z" fill="#fff" opacity="0.85" />
        <path d="M168 10 L186 28 L176 32 L168 24 L158 30 L152 24 Z" fill="#fff" opacity="0.85" />
      </>
    ),
  },

  /* ── vehicles ── */
  bicycle: {
    viewBox: '0 0 185 100',
    render: (c) => (
      <>
        <circle cx="44" cy="66" r="28" fill="none" stroke={c} strokeWidth="5" />
        <circle cx="140" cy="66" r="28" fill="none" stroke={c} strokeWidth="5" />
        <path d="M44 66 L78 30 L120 30 L140 66 L78 66 L44 66" fill="none" stroke={c} strokeWidth="5" strokeLinejoin="round" />
        <path d="M74 26 Q80 18 92 20 L98 24" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
        <path d="M116 28 Q126 22 134 28" fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
        <circle cx="78" cy="66" r="6" fill={c} />
      </>
    ),
  },
  car: {
    viewBox: '0 0 190 100',
    render: (c) => (
      <>
        <path d="M8 74 Q8 58 30 56 L48 34 Q54 26 70 26 L124 26 Q138 26 146 36 L158 56 Q182 58 182 72 L182 80 L8 80 Z" fill={c} />
        <path d="M56 32 L120 32 Q130 32 136 40 L146 54 L52 54 Z" fill={shade(c)} />
        <circle cx="46" cy="80" r="14" fill={shade(c)} />
        <circle cx="146" cy="80" r="14" fill={shade(c)} />
        <circle cx="46" cy="80" r="6" fill="#fff" opacity="0.5" />
        <circle cx="146" cy="80" r="6" fill="#fff" opacity="0.5" />
      </>
    ),
  },
  bus: {
    viewBox: '0 0 340 100',
    render: (c) => (
      <>
        <rect x="4" y="14" width="330" height="66" rx="10" fill={c} />
        <rect x="16" y="24" width="52" height="22" rx="3" fill={shade(c)} />
        <rect x="80" y="24" width="52" height="22" rx="3" fill={shade(c)} />
        <rect x="144" y="24" width="52" height="22" rx="3" fill={shade(c)} />
        <rect x="208" y="24" width="52" height="22" rx="3" fill={shade(c)} />
        <rect x="272" y="24" width="50" height="22" rx="3" fill={shade(c)} />
        <circle cx="70" cy="82" r="15" fill={shade(c)} />
        <circle cx="270" cy="82" r="15" fill={shade(c)} />
      </>
    ),
  },
  pickup: {
    viewBox: '0 0 220 100',
    render: (c) => (
      <>
        <path d="M6 70 Q6 56 24 54 L40 34 Q44 26 58 26 L104 26 L104 54 L112 54 L112 74 L6 74 Z" fill={c} />
        <path d="M104 40 L104 56 L214 56 Q216 62 214 70 L214 74 L112 74 L112 54 L104 54 Z" fill={c} />
        <path d="M46 32 L98 32 L98 50 L50 50 Q46 44 46 32" fill={shade(c)} />
        <path d="M58 32 L84 32 Q92 32 96 40 L100 50 L58 50 Z" fill={shade(c)} />
        <circle cx="48" cy="76" r="15" fill={shade(c)} />
        <circle cx="180" cy="76" r="15" fill={shade(c)} />
      </>
    ),
  },
};
