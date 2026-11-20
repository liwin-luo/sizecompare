/**
 * AreaSquares — honest area comparison in 2-D.
 * Side ∝ √area at one shared scale: the drawn SIDE is the honest
 * projection of an area quantity (same philosophy as the sphere's ∛V).
 * Inline presentation attributes only, so PNG export stays faithful.
 */

import { useMemo } from 'react';
import { ChartError, areaSquareLayout } from '../../lib/charts';
import { formatAttrValue } from '../../lib/attributes';
import { objectName, objectSourceLine, objectValue, type ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { OBJ_PALETTE } from './ScaleCanvas';

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

/** Flag emoji drawn inside the square when it is comfortably readable. */
const MIN_FLAG_SIDE_PX = 56;

export function AreaSquares({
  objects,
  attr,
  box,
  unitSystem,
  large = false,
  showSources = true,
  svgId,
  reveal = 1,
}: {
  objects: ComparisonObject[];
  attr: 'area';
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
  /** Quiz reveal progress 0→1: below 1 sides blend from equal, values hidden. */
  reveal?: number;
}) {
  const values = objects.map((o) => objectValue(o, attr) ?? 0);

  const layout = useMemo(() => {
    try {
      return { layout: areaSquareLayout(values, box), error: null as string | null };
    } catch (e) {
      return {
        layout: null,
        error: e instanceof ChartError ? e.message : 'Could not lay out the squares.',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, attr, box.width, box.height]);

  const nameSize = large ? 28 : 15;
  const valueSize = large ? 24 : 14;
  const sourceSize = large ? 16 : 11;
  const captionSize = large ? 18 : 11;

  const labelZone = (nameSize + 6) + (valueSize + 8) + (showSources ? sourceSize + 8 : 0);
  const totalH = box.height + labelZone;

  if (!layout.layout) {
    return (
      <svg id={svgId} viewBox={`0 0 ${box.width} ${totalH}`} width="100%" role="img">
        <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
        <text x={box.width / 2} y={totalH / 2} textAnchor="middle" fontFamily={FONT} fontSize="16" fill="#6b7280">
          {layout.error ?? 'Add places to compare area'}
        </text>
      </svg>
    );
  }

  const { items, baselineY, extreme } = layout.layout;

  const hidden = reveal < 1;
  // Quiz blend: every side interpolates from the geometric-mean side
  // (equal squares, truth hidden) toward its true ∝√A side.
  const t = Math.min(Math.max(reveal, 0), 1);
  const meanRoot = Math.sqrt(
    Math.exp(values.reduce((s, v) => s + Math.log(v), 0) / values.length),
  );
  const equalSide = meanRoot * layout.layout.scale;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={
        hidden
          ? `Area quiz chart: ${objects.map((o) => objectName(o)).join(', ')} with equal squares and values hidden`
          : `Area comparison: ${objects.map((o) => objectName(o)).join(', ')}`
      }
    >
      <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill="#0e6f63">
        Comparing: Area
      </text>

      {/* shared ground line */}
      <line
        x1="10"
        y1={baselineY}
        x2={box.width - 10}
        y2={baselineY}
        stroke="#1c2431"
        strokeWidth={large ? 4 : 2}
        strokeLinecap="round"
      />

      {items.map((item) => {
        const obj = objects[item.index];
        const color = OBJ_PALETTE[item.index % OBJ_PALETTE.length];
        const value = values[item.index];
        const side = hidden ? equalSide + (item.side - equalSide) * t : item.side;
        const y = baselineY - side;
        const cx = item.x + side / 2;
        const valueText = hidden ? '?' : formatAttrValue(attr, value, unitSystem);
        const source = objectSourceLine(obj, attr);
        const nameY = baselineY + nameSize + 10;
        const valueY = nameY + valueSize + 8;

        // Flag identifier (Fluent Emoji asset) centred in the square when
        // it fits; tiny squares keep just the name label.
        const flag =
          obj.kind === 'library' &&
          obj.record.image &&
          side >= MIN_FLAG_SIDE_PX
            ? (() => {
                const fh = side * 0.5;
                const fw = fh * (obj.record.aspect || 0.75);
                return (
                  <image
                    href={obj.record.image}
                    xlinkHref={obj.record.image}
                    x={cx - fw / 2}
                    y={baselineY - side / 2 - fh / 2}
                    width={fw}
                    height={fh}
                    preserveAspectRatio="none"
                  />
                );
              })()
            : null;

        return (
          <g key={obj.record.id}>
            <rect
              x={item.x}
              y={y}
              width={side}
              height={side}
              rx={Math.min(6, side * 0.04)}
              fill={color}
              opacity="0.92"
            />
            {flag}
            <text
              x={cx}
              y={nameY}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={nameSize}
              fontWeight="700"
              fill="#1c2431"
            >
              {objectName(obj).length > 24 ? `${objectName(obj).slice(0, 23)}…` : objectName(obj)}
            </text>
            <text
              x={cx}
              y={valueY}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={valueSize}
              fontWeight="700"
              fill={color}
            >
              {valueText}
            </text>
            {showSources && source && (
              <text
                x={cx}
                y={valueY + sourceSize + 8}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize={sourceSize}
                fill="#6b7280"
              >
                {source.length > 28 ? `${source.slice(0, 27)}…` : source}
              </text>
            )}
          </g>
        );
      })}

      <text
        x="16"
        y={totalH - 8}
        fontFamily={FONT}
        fontSize={captionSize}
        fill="#6b7280"
      >
        {hidden
          ? 'Equal squares — true areas revealed after you answer'
          : 'Square side ∝ √area — a 2× side means 4× the area'}
      </text>
      {extreme && !hidden && (
        <text
          x={box.width - 16}
          y={totalH - 8}
          textAnchor="end"
          fontFamily={FONT}
          fontSize={captionSize}
          fill="#b45309"
        >
          True scale — the small square really is that tiny
        </text>
      )}
    </svg>
  );
}
