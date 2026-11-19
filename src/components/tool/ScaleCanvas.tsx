/**
 * ScaleCanvas — the true-scale SVG renderer.
 *
 * Everything on the canvas uses inline presentation attributes (no CSS
 * classes, no CSS variables) so the exact same markup serializes cleanly
 * to a standalone PNG and prints identically. One comparison, one scale
 * factor, one shared ground line.
 */

import { useMemo } from 'react';
import {
  computeLayout,
  assessScale,
  type Layout,
  type PlacedItem,
} from '../../lib/scale';
import {
  DIMENSION_LABELS,
  objectDimension,
  objectName,
  objectSourceLine,
  objectValueMm,
  type ComparisonObject,
  type DimensionType,
} from '../../lib/objects';
import { autoMetricUnit, formatImperialHeight, formatMm, type UnitSystem } from '../../lib/units';
import { SILHOUETTES } from './silhouettes';

export const OBJ_PALETTE = ['#0e7490', '#b4551f', '#6d4bb6', '#a8234b', '#2f7d32'];

export const MAX_OBJECTS = 3;

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

/** Perpendicular footprint for custom objects without a silhouette. */
function customAspect(dimension: DimensionType): number {
  switch (dimension) {
    case 'height':
      return 0.42;
    case 'diameter':
      return 1;
    default:
      return 2.2;
  }
}

function customAxis(dimension: DimensionType): 'vertical' | 'horizontal' | 'both' {
  if (dimension === 'height') return 'vertical';
  if (dimension === 'diameter') return 'both';
  return 'horizontal';
}

export function objectVisual(obj: ComparisonObject): {
  valueMm: number;
  aspect: number;
  axis: 'vertical' | 'horizontal' | 'both';
  silhouette: string | null;
} {
  if (obj.kind === 'library') {
    return {
      valueMm: obj.record.value_mm,
      aspect: obj.record.aspect,
      axis: obj.record.axis,
      silhouette: obj.record.silhouette,
    };
  }
  return {
    valueMm: obj.record.value_mm,
    aspect: customAspect(obj.record.dimension_type),
    axis: customAxis(obj.record.dimension_type),
    silhouette: null,
  };
}

export function formatValue(mm: number, system: UnitSystem): string {
  return system === 'metric'
    ? formatMm(mm, autoMetricUnit(mm))
    : formatImperialHeight(mm);
}

const DIMENSION_WORD: Record<DimensionType, string> = {
  height: 'taller',
  length: 'longer',
  width: 'wider',
  diameter: 'wider',
};

/** Auto answer sentence for answer reveal + worksheet answer keys. */
export function buildAnswerSentence(
  objects: ComparisonObject[],
  system: UnitSystem,
): string | null {
  if (objects.length < 2) return null;
  const sorted = [...objects].sort((a, b) => objectValueMm(b) - objectValueMm(a));
  const big = sorted[0];
  const small = sorted[sorted.length - 1];
  const bigV = objectValueMm(big);
  const smallV = objectValueMm(small);
  const ratio = bigV / smallV;
  const mixed =
    new Set(sorted.map((o) => objectDimension(o))).size > 1;
  const word = mixed ? 'larger than the measured size of' : DIMENSION_WORD[objectDimension(big)];
  return `The ${objectName(big)} (${formatValue(bigV, system)}) is about ${ratio >= 1.05 ? `${ratio.toFixed(ratio < 10 ? 1 : 0)}× ` : ''}${word} the ${objectName(small)} (${formatValue(smallV, system)}).`;
}

interface CanvasProps {
  objects: ComparisonObject[];
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  /** Big type for classroom projection. */
  large?: boolean;
  /** Show measurement source lines under objects. */
  showSources?: boolean;
  svgId?: string;
}

export function ScaleCanvas({
  objects,
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
  }>(() => {
    if (objects.length === 0) return { layout: null, health: null };
    const items = objects.map((o) => {
      const v = objectVisual(o);
      return { valueMm: v.valueMm, aspect: v.aspect, axis: v.axis };
    });
    const l = computeLayout(items, box, large ? 60 : 34, large ? 80 : 34);
    return { layout: l, health: assessScale(items.map((i) => i.valueMm), l.scale) };
  }, [objects, box, large]);

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
          Add two objects to compare
        </text>
      </svg>
    );
  }

  const totalH = box.height + labelZone;
  const dims = objects.map((o) => objectDimension(o));
  const mixed = new Set(dims).size > 1;
  const dimLabel = mixed
    ? `Mixed: ${[...new Set(dims)].map((d) => DIMENSION_LABELS[d]).join(' + ')}`
    : DIMENSION_LABELS[dims[0]];

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={`Size comparison chart: ${objects.map((o) => objectName(o)).join(', ')} at one true scale`}
    >
      <rect x="0" y="0" width={box.width} height={totalH} fill="#ffffff" rx="8" />

      {/* compared-dimension badge */}
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill={mixed ? '#b45309' : '#0e6f63'}>
        {`Comparing: ${dimLabel}`}
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
        const v = objectVisual(obj);
        return (
          <ObjectGroup
            key={obj.record.id}
            placed={placed}
            obj={obj}
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
  visual: ReturnType<typeof objectVisual>;
  color: string;
  layout: Layout;
  unitSystem: UnitSystem;
  fontSizes: { nameSize: number; valueSize: number; sourceSize: number };
  showSource: boolean;
}

function ObjectGroup({
  placed,
  obj,
  visual,
  color,
  layout,
  unitSystem,
  fontSizes,
  showSource,
}: ObjectGroupProps) {
  const name = objectName(obj);
  const valueText = formatValue(visual.valueMm, unitSystem);
  const source = objectSourceLine(obj);
  const { nameSize, valueSize, sourceSize } = fontSizes;

  const centerX = placed.x + placed.w / 2;
  const labelY = layout.baselineY + (nameSize + 14);

  // Dimension line along the measured axis with end ticks.
  const tick = 6;
  let dimLine: React.ReactNode = null;
  if (visual.axis === 'vertical' || visual.axis === 'both') {
    const x = Math.max(placed.x - 8, 2);
    dimLine = (
      <g stroke="#334155" strokeWidth="1.5">
        <line x1={x} y1={placed.y} x2={x} y2={layout.baselineY} />
        <line x1={x - tick} y1={placed.y} x2={x + tick} y2={placed.y} />
        <line x1={x - tick} y1={layout.baselineY} x2={x + tick} y2={layout.baselineY} />
      </g>
    );
  } else {
    const y = layout.baselineY + 8;
    dimLine = (
      <g stroke="#334155" strokeWidth="1.5">
        <line x1={placed.x} y1={y} x2={placed.x + placed.w} y2={y} />
        <line x1={placed.x} y1={y - tick} x2={placed.x} y2={y + tick} />
        <line x1={placed.x + placed.w} y1={y - tick} x2={placed.x + placed.w} y2={y + tick} />
      </g>
    );
  }

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
      {showSource && source && (
        <text
          x={centerX}
          y={labelY + valueSize + 6 + sourceSize + 6}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={sourceSize}
          fill="#6b7280"
        >
          {source.length > 56 ? `${source.slice(0, 55)}…` : source}
        </text>
      )}
    </g>
  );
}
