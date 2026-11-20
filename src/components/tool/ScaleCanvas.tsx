/**
 * ScaleCanvas — the true-scale SVG renderer for LINEAR attributes
 * (height / length / width / diameter).
 *
 * Everything uses inline presentation attributes (no CSS classes, no
 * CSS variables) so the markup serializes cleanly to PNG and prints
 * identically. One comparison, one scale factor, one shared ground
 * line. Weight and volume comparisons render in WeightBars /
 * VolumeSpheres instead.
 */

import { useMemo } from 'react';
import { computeLayout, assessScale, type Layout, type PlacedItem } from '../../lib/scale';
import {
  objectName,
  objectValue,
  type ComparisonObject,
  type ObjectV2,
} from '../../lib/objects';
import {
  ATTRIBUTE_LABELS,
  formatAttrValue,
  ratioPhrase,
  type AttributeKey,
  type LinearAttr,
} from '../../lib/attributes';
import type { UnitSystem } from '../../lib/units';
import { SILHOUETTES } from './silhouettes';

export const OBJ_PALETTE = ['#0e7490', '#b4551f', '#6d4bb6', '#a8234b', '#2f7d32'];

export const MAX_OBJECTS = 3;

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

/** Perpendicular footprint for custom objects (generic shapes). */
function customAspect(attr: LinearAttr): number {
  switch (attr) {
    case 'height':
      return 0.42;
    case 'diameter':
      return 1;
    default:
      return 2.2;
  }
}

function customAxis(attr: LinearAttr): 'vertical' | 'horizontal' | 'both' {
  if (attr === 'height') return 'vertical';
  if (attr === 'diameter') return 'both';
  return 'horizontal';
}

export function objectVisual(
  obj: ComparisonObject,
  attr: LinearAttr,
): {
  valueMm: number;
  aspect: number;
  axis: 'vertical' | 'horizontal' | 'both';
  silhouette: string | null;
} | null {
  const value = objectValue(obj, attr);
  if (value === null) return null;
  if (obj.kind === 'library') {
    return {
      valueMm: value,
      aspect: obj.record.aspect,
      axis: obj.record.axis,
      silhouette: obj.record.silhouette,
    };
  }
  return {
    valueMm: value,
    aspect: customAspect(attr),
    axis: customAxis(attr),
    silhouette: null,
  };
}

/** Format a library record's value for the given attribute (picker labels). */
export function formatValue(
  record: ObjectV2,
  attr: AttributeKey,
  system: UnitSystem,
): string {
  const m = record.measurements[attr];
  return m ? formatAttrValue(attr, m.value, system) : '—';
}

/** Auto answer sentence for answer reveal + worksheet answer keys. */
export function buildAnswerSentence(
  objects: ComparisonObject[],
  attr: AttributeKey,
  system: UnitSystem,
): string | null {
  if (objects.length < 2) return null;
  const values = objects.map((o) => objectValue(o, attr));
  if (values.some((v) => v === null)) return null;

  const sorted = objects
    .map((o, i) => ({ o, v: values[i] as number }))
    .sort((a, b) => b.v - a.v);
  const big = sorted[0];
  const small = sorted[sorted.length - 1];
  const bigLabel = `${objectName(big.o)} (${formatAttrValue(attr, big.v, system)})`;
  const smallLabel = `${objectName(small.o)} (${formatAttrValue(attr, small.v, system)})`;
  return `${bigLabel} is ${ratioPhrase(attr, big.v / small.v)} ${smallLabel}.`;
}

interface CanvasProps {
  objects: ComparisonObject[];
  attr: LinearAttr;
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  /** Big type for projection mode. */
  large?: boolean;
  /** Show measurement source names under objects. */
  showSources?: boolean;
  svgId?: string;
}

export function ScaleCanvas({
  objects,
  attr,
  box,
  unitSystem,
  large = false,
  showSources = true,
  svgId,
}: CanvasProps) {
  const nameSize = large ? 30 : 16;
  const valueSize = large ? 26 : 14;
  const sourceSize = large ? 17 : 11;
  const labelZone = large ? 130 : 66;

  const { layout, health } = useMemo<{
    layout: Layout | null;
    health: ReturnType<typeof assessScale> | null;
    missing: boolean;
  }>(() => {
    const visuals = objects.map((o) => objectVisual(o, attr));
    if (objects.length === 0 || visuals.some((v) => v === null)) {
      return { layout: null, health: null, missing: visuals.some((v) => v === null) };
    }
    const items = visuals.map((v) => ({
      valueMm: (v as NonNullable<typeof v>).valueMm,
      aspect: (v as NonNullable<typeof v>).aspect,
      axis: (v as NonNullable<typeof v>).axis,
    }));
    const l = computeLayout(items, box, large ? 60 : 34, large ? 80 : 34);
    return {
      layout: l,
      health: assessScale(items.map((i) => i.valueMm), l.scale),
      missing: false,
    };
  }, [objects, attr, box, large]);

  if (!layout) {
    return (
      <svg
        id={svgId}
        viewBox={`0 0 ${box.width} ${box.height}`}
        width="100%"
        role="img"
        aria-label="Empty comparison canvas"
      >
        <rect x="0" y="0" width={box.width} height={box.height} fill="#ffffff" rx="8" />
        <text
          x={box.width / 2}
          y={box.height / 2}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize="18"
          fill="#6b7280"
        >
          {health === null && objects.length > 0
            ? 'Pick another attribute — an object is missing this one'
            : 'Add objects to compare'}
        </text>
      </svg>
    );
  }

  const totalH = box.height + labelZone;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={`${ATTRIBUTE_LABELS[attr]} comparison chart: ${objects.map((o) => objectName(o)).join(', ')} at one true scale`}
    >
      <rect x="0" y="0" width={box.width} height={totalH} fill="#ffffff" rx="8" />

      {/* compared-attribute badge */}
      <text
        x="16"
        y="26"
        fontFamily={FONT}
        fontSize={large ? 24 : 14}
        fontWeight="600"
        fill="#0e6f63"
      >
        {`Comparing: ${ATTRIBUTE_LABELS[attr]}`}
      </text>

      {/* shared ground line */}
      <line
        x1="10"
        y1={layout.baselineY}
        x2={box.width - 10}
        y2={layout.baselineY}
        stroke="#1c2431"
        strokeWidth={large ? 4 : 2}
        strokeLinecap="round"
      />

      {layout.items.map((placed) => {
        const obj = objects[placed.index];
        const color = OBJ_PALETTE[placed.index % OBJ_PALETTE.length];
        const v = objectVisual(obj, attr) as NonNullable<ReturnType<typeof objectVisual>>;
        return (
          <ObjectGroup
            key={obj.record.id}
            placed={placed}
            obj={obj}
            attr={attr}
            visual={v}
            color={color}
            layout={layout}
            unitSystem={unitSystem}
            fontSizes={{ nameSize, valueSize, sourceSize }}
            showSource={showSources}
          />
        );
      })}

      {/* honesty note */}
      <text
        x={box.width - 16}
        y={totalH - 12}
        textAnchor="end"
        fontFamily={FONT}
        fontSize={large ? 18 : 11}
        fill="#6b7280"
      >
        {health?.extreme
          ? 'True scale — the smallest object really is this tiny relative to the largest'
          : 'All objects drawn to one true scale'}
      </text>
    </svg>
  );
}

interface ObjectGroupProps {
  placed: PlacedItem;
  obj: ComparisonObject;
  attr: LinearAttr;
  visual: NonNullable<ReturnType<typeof objectVisual>>;
  color: string;
  layout: Layout;
  unitSystem: UnitSystem;
  fontSizes: { nameSize: number; valueSize: number; sourceSize: number };
  showSource: boolean;
}

function ObjectGroup({
  placed,
  obj,
  attr,
  visual,
  color,
  layout,
  unitSystem,
  fontSizes,
  showSource,
}: ObjectGroupProps) {
  const name = objectName(obj);
  const valueText = formatAttrValue(attr, visual.valueMm, unitSystem);
  const { nameSize, valueSize, sourceSize } = fontSizes;

  // Canvas keeps the citation to the source name only — full provenance
  // lives in the print sheet, where it can't collide between neighbours.
  const sourceNameOnly =
    obj.kind === 'library'
      ? (obj.record.measurements[attr]?.source_name ?? 'Custom measurement')
      : 'Custom measurement';

  const centerX = placed.x + placed.w / 2;
  const labelY = layout.baselineY + (nameSize + 14);

  // Dimension line along the measured axis with end ticks.
  const tick = 6;
  const dimLine =
    visual.axis === 'vertical' || visual.axis === 'both' ? (
      <g stroke="#334155" strokeWidth="1.5">
        <line x1={Math.max(placed.x - 8, 2)} y1={placed.y} x2={Math.max(placed.x - 8, 2)} y2={layout.baselineY} />
        <line x1={Math.max(placed.x - 8, 2) - tick} y1={placed.y} x2={Math.max(placed.x - 8, 2) + tick} y2={placed.y} />
        <line x1={Math.max(placed.x - 8, 2) - tick} y1={layout.baselineY} x2={Math.max(placed.x - 8, 2) + tick} y2={layout.baselineY} />
      </g>
    ) : (
      <g stroke="#334155" strokeWidth="1.5">
        <line x1={placed.x} y1={layout.baselineY + 8} x2={placed.x + placed.w} y2={layout.baselineY + 8} />
        <line x1={placed.x} y1={layout.baselineY + 8 - tick} x2={placed.x} y2={layout.baselineY + 8 + tick} />
        <line x1={placed.x + placed.w} y1={layout.baselineY + 8 - tick} x2={placed.x + placed.w} y2={layout.baselineY + 8 + tick} />
      </g>
    );

  const silhouette = visual.silhouette ? SILHOUETTES[visual.silhouette] : null;

  return (
    <g>
      {silhouette ? (
        <svg
          x={placed.x}
          y={placed.y}
          width={placed.w}
          height={placed.h}
          viewBox={silhouette.viewBox}
          preserveAspectRatio="none"
        >
          {silhouette.render(color)}
        </svg>
      ) : (
        <rect
          x={placed.x + placed.w * 0.1}
          y={placed.y}
          width={placed.w * 0.8}
          height={placed.h}
          rx={Math.min(12, placed.w * 0.15)}
          fill={color}
          opacity="0.9"
        />
      )}
      {dimLine}

      {/* labels under the ground line */}
      <text
        x={centerX}
        y={labelY}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={nameSize}
        fontWeight="700"
        fill="#1c2431"
      >
        {name.length > 24 ? `${name.slice(0, 23)}…` : name}
      </text>
      <text
        x={centerX}
        y={labelY + valueSize + 6}
        textAnchor="middle"
        fontFamily={FONT}
        fontSize={valueSize}
        fontWeight="700"
        fill={color}
      >
        {valueText}
      </text>
      {showSource && (
        <text
          x={centerX}
          y={labelY + valueSize + 6 + sourceSize + 6}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={sourceSize}
          fill="#6b7280"
        >
          {sourceNameOnly.length > 28 ? `${sourceNameOnly.slice(0, 27)}…` : sourceNameOnly}
        </text>
      )}
    </g>
  );
}
