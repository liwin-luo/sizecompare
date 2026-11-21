#!/usr/bin/env node
/**
 * build-place-shapes.mjs — country outline shapes for the area-overlay
 * comparison (wave "overlay").
 *
 * Single source: Natural Earth 110m via the `world-atlas` npm package
 * (public domain). Area calibration single source: the CIA WFB totals
 * already stored in src/data/library.ts (this script reads them back,
 * it never hardcodes a second copy).
 *
 * Method per country:
 *   - azimuthal equal-area projection centred on the country centroid
 *     (area-exact on the sphere, shape least distorted at its centre);
 *   - fit into a 512×512 frame, coordinates rounded to integers;
 *   - viewBox is the TIGHT projected bbox (silhouette contract: viewBox
 *     aspect is the true shape aspect);
 *   - `scaleToMm` = sqrt(CIA_mm² / enclosed viewBox-unit² area), so a
 *     shape drawn at width vbW×scaleToMm encloses exactly its official
 *     area — every country then shares one honest px-per-mm scale.
 *
 * Absent from 110m (Liechtenstein, Monaco, Vatican City): left out of
 * PLACE_SHAPES on purpose — the tool falls back to √A squares for them.
 *
 * Regenerate: node scripts/emoji-tools/build-place-shapes.mjs
 * (writes src/data/placeShapes.ts directly; do not hand-edit the output)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoArea, geoCentroid, geoPath, geoAzimuthalEqualArea } from 'd3-geo';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const LIBRARY_TS = join(ROOT, 'src', 'data', 'library.ts');
const OUT_TS = join(ROOT, 'src', 'data', 'placeShapes.ts');

const FRAME = 512; // projection fit frame, viewBox units
const PAD = 2;
const EARTH_R_KM = 6371.0088; // IUGG mean radius
const KM2_TO_MM2 = 1e12;
const CHECKED_AT = '2026-11-21';
/** calib sanity band: NE 110m simplification vs CIA totals (holes, coasts) */
const CALIB_MIN = 0.9;
const CALIB_MAX = 1.1;

/** our library id → world-atlas 110m name (default: display name matches) */
const NAME_OVERRIDES = {
  'united-states': 'United States of America',
  'dr-congo': 'Dem. Rep. Congo',
  'south-sudan': 'S. Sudan',
  'central-african-republic': 'Central African Rep.',
};

/**
 * Merge extra 110m features into one shape. CIA WFB lists Somalia as one
 * unit (incl. Somaliland); Natural Earth draws Somaliland separately —
 * merge restores the single-source definition.
 */
const MERGE_FEATURES = { somalia: ['Somalia', 'Somaliland'] };

/**
 * No overlay shape — falls back to √A squares. Morocco: CIA WFB total
 * (446,550 km²) excludes Western Sahara, but Natural Earth's Morocco
 * boundary cannot be clipped to that definition (NE Morocco measures
 * 592k km² vs CIA proper 446k even after differencing W. Sahara); showing
 * the NE outline calibrated to the CIA number would draw a boundary
 * neither source endorses.
 */
const EXCLUDE = new Set(['morocco']);

/* ── read the CIA areas back out of library.ts (single source) ── */

function readPlaceAreas() {
  const src = readFileSync(LIBRARY_TS, 'utf8');
  const marker = 'places: country areas';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('place section marker not found in library.ts');
  const section = src.slice(start);
  const out = new Map();
  for (const chunk of section.split(/\n  \{/)) {
    const id = chunk.match(/^\s*id: '([a-z0-9-]+)',/);
    const value = chunk.match(/^\s*value: ([0-9.eE+-]+),/m);
    const name = chunk.match(/^\s*name: '([^']+)',/m);
    if (id && value && name) out.set(id[1], { ciaMm2: Number(value[1]), name: name[1] });
  }
  return out;
}

/* ── planar polygon area (shoelace, holes subtracted) in viewBox units ── */

function ringArea(points) {
  let a = 0;
  for (let i = 0; i < points.length - 1; i++) {
    a += points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1];
  }
  return a / 2;
}

function projectRing(projection, ring) {
  return ring.map((c) => projection(c));
}

/** rebuild projected coordinates per ring (for the area integral above) */
function eachProjectedRing(projection, geometry, fn) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) for (const ring of polygon) fn(projectRing(projection, ring));
}

/* ── main ── */

const places = readPlaceAreas();
if (places.size < 60) throw new Error(`expected ~67 place records, found ${places.size}`);

const topo = require('world-atlas/countries-110m.json');
const byName = new Map(
  feature(topo, topo.objects.countries).features.map((f) => [f.properties.name, f]),
);

const roundPath = (d) => d.replace(/\d+\.\d+/g, (n) => String(Math.round(Number(n))));

const rows = [];
const unmatched = [];
const calibWarn = [];

for (const [id, { ciaMm2, name }] of [...places.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  if (EXCLUDE.has(id)) {
    unmatched.push(`${id} (excluded — see EXCLUDE note)`);
    continue;
  }
  const parts = MERGE_FEATURES[id] ?? [NAME_OVERRIDES[id] ?? name];
  const feats = parts.map((n) => byName.get(n));
  if (feats.some((f) => !f || !f.geometry)) {
    unmatched.push(`${id} (${parts.join(' + ')})`);
    continue;
  }
  // combine all parts into a single MultiPolygon feature
  const polygons = feats.flatMap((f) =>
    f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates,
  );
  const feat = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polygons } };

  const [lon, lat] = geoCentroid(feat);
  const projection = geoAzimuthalEqualArea()
    .rotate([-lon, -lat])
    .fitExtent(
      [
        [PAD, PAD],
        [FRAME - PAD, FRAME - PAD],
      ],
      feat,
    );

  const path = geoPath(projection);
  const d = roundPath(path(feat));
  const [[x0, y0], [x1, y1]] = path.bounds(feat);
  const vbX = Math.floor(x0);
  const vbY = Math.floor(y0);
  const vbW = Math.ceil(x1) - vbX;
  const vbH = Math.ceil(y1) - vbY;

  // enclosed area in viewBox units² (shoelace over every ring, holes out)
  let areaVb = 0;
  eachProjectedRing(projection, feat.geometry, (ring) => {
    const a = ringArea(ring);
    // d3 ring winding: exterior rings and holes have opposite signs, so a
    // plain signed sum over all rings is already outer-minus-holes.
    areaVb += a;
  });
  areaVb = Math.abs(areaVb);
  if (areaVb <= 0) throw new Error(`${id}: degenerate projected area`);

  // sanity via the sphere: Ω·R² vs CIA (before viewBox rounding)
  const neKm2 = geoArea(feat) * EARTH_R_KM * EARTH_R_KM;
  const calib = Math.sqrt(ciaMm2 / KM2_TO_MM2 / neKm2);
  if (calib < CALIB_MIN || calib > CALIB_MAX) calibWarn.push(`${id}: calib ${calib.toFixed(3)}`);

  const scaleToMm = Math.sqrt(ciaMm2 / areaVb);
  rows.push({ id, name, d, viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`, scaleToMm, calib });
}

if (unmatched.length) console.log(`absent from 110m (fall back to squares): ${unmatched.join(', ')}`);
if (calibWarn.length) {
  console.error(`CALIB OUT OF BAND — investigate before shipping:`);
  for (const w of calibWarn) console.error(`  ${w}`);
  process.exit(1);
}

/* ── emit src/data/placeShapes.ts ── */

const lines = rows.map(
  (r) =>
    `  ${/^[a-z][a-z0-9]*$/.test(r.id) ? r.id : `'${r.id}'`}: { viewBox: '${r.viewBox}', path: '${r.d}', scaleToMm: ${r.scaleToMm.toPrecision(6)} },`,
);
const out = `/**
 * Country outline shapes for the area-overlay comparison.
 * GENERATED by scripts/emoji-tools/build-place-shapes.mjs — do not edit.
 *
 * Source: Natural Earth 110m via world-atlas (public domain); azimuthal
 * equal-area projection centred per country; coordinates rounded to a
 * 512-unit frame. scaleToMm = √(CIA mm² ÷ viewBox-unit²): a shape drawn
 * at width vbW·scaleToMm mm encloses exactly its official CIA WFB total,
 * so every country can share one honest px-per-mm scale.
 *
 * Absent from Natural Earth 110m (fall back to √A squares):${unmatched.map((u) => ` ${u.split(' ')[0]}`).join(',')}
 * Regenerate: node scripts/emoji-tools/build-place-shapes.mjs
 * Checked: ${CHECKED_AT}
 */
export interface PlaceShape {
  /** Tight projected bounding box of the path. */
  viewBox: string;
  /** Outline path inside the viewBox. */
  path: string;
  /** mm per viewBox unit, calibrated so the enclosed area = CIA total. */
  scaleToMm: number;
}

export const PLACE_SHAPES: Record<string, PlaceShape> = {
${lines.join('\n')}
};
`;
writeFileSync(OUT_TS, out);

/* ── summary ── */

const bytes = Buffer.byteLength(out);
const calibs = rows.map((r) => r.calib);
const fmtKm = (v) => (v / 1e6).toFixed(0); // mm→km ×1e-3 not needed; areas in mm²
console.log(`placeShapes.ts: ${rows.length}/${places.size} countries, ${(bytes / 1024).toFixed(0)} KB`);
console.log(
  `calib vs CIA (sphere): min ${Math.min(...calibs).toFixed(3)} max ${Math.max(...calibs).toFixed(3)} mean ${(calibs.reduce((a, b) => a + b, 0) / calibs.length).toFixed(3)}`,
);
for (const r of rows.slice(0, 3)) console.log(`  e.g. ${r.name}: viewBox ${r.viewBox}, calib ${r.calib.toFixed(3)}`);
