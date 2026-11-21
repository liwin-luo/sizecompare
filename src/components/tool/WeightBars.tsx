/**
 * WeightBars — honest proportional bar chart for weight and the other
 * bar-family attributes (population, lifespan, speed, densities).
 * Bar length is strictly proportional to the value (no truncated axes).
 * Inline presentation attributes only, so PNG export stays faithful.
 */

import { useMemo } from 'react';
import { ChartError, weightBarLayout } from '../../lib/charts';
import { ATTRIBUTE_LABELS, formatAttrValue, type BarAttr } from '../../lib/attributes';
import { objectName, objectValue, type ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { ANCHOR_COLOR } from '../../lib/anchors';
import { OBJ_PALETTE } from './ScaleCanvas';

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

export function WeightBars({
  objects,
  attr,
  box,
  unitSystem,
  large = false,
  showSources = true,
  svgId,
  reveal = 1,
  anchor = null,
}: {
  objects: ComparisonObject[];
  attr: BarAttr;
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
  /** Quiz reveal progress 0→1: below 1 bars blend from equal length, values hidden. */
  reveal?: number;
  /** Reference anchor drawn in neutral grey to give the scale human meaning. */
  anchor?: ComparisonObject | null;
}) {
  const attrLabel = ATTRIBUTE_LABELS[attr];
  // the anchor participates in the layout but never in the quiz blend or
  // the answer sentence — it is a scale marker, not a contestant
  const all = useMemo(() => (anchor ? [...objects, anchor] : objects), [objects, anchor]);
  const values = all.map((o) => objectValue(o, attr) ?? 0);

  const nameSize = large ? 28 : 15;
  const valueSize = large ? 24 : 14;
  const sourceSize = large ? 16 : 11;
  const captionSize = large ? 18 : 11;
  const sourceH = showSources ? sourceSize + 10 : 0;

  const layout = useMemo(() => {
    try {
      return {
        layout: weightBarLayout(values, box, 28, { sourceH }),
        error: null as string | null,
      };
    } catch (e) {
      return {
        layout: null,
        error: e instanceof ChartError ? e.message : 'Could not lay out the bars.',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, attr, box.width, box.height, sourceH]);

  const totalH = (layout.layout?.neededHeight ?? box.height) + captionSize + 8;

  if (!layout.layout) {
    return (
      <svg id={svgId} viewBox={`0 0 ${box.width} ${box.height}`} width="100%" role="img">
        <rect width={box.width} height={box.height} fill="#ffffff" rx="8" />
        <text x={box.width / 2} y={box.height / 2} textAnchor="middle" fontFamily={FONT} fontSize="16" fill="#6b7280">
          {layout.error ?? 'Add objects to compare weight'}
        </text>
      </svg>
    );
  }

  const { rows, extreme } = layout.layout;

  const hidden = reveal < 1;
  // Quiz blend: every bar interpolates from the geometric-mean length
  // (equal bars, truth hidden) toward its true proportional length.
  const t = Math.min(Math.max(reveal, 0), 1);
  const pxPerUnit = layout.layout.maxBarW / layout.layout.maxValue;
  const meanUnit = Math.exp(values.reduce((s, v) => s + Math.log(v), 0) / values.length);
  const equalW = meanUnit * pxPerUnit;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={
        hidden
          ? `${attrLabel} quiz chart: ${objects.map((o) => objectName(o)).join(', ')} with equal bars and values hidden`
          : `${attrLabel} comparison: ${objects.map((o) => objectName(o)).join(', ')}`
      }
    >
      <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill="#0e6f63">
        {`Comparing: ${attrLabel}`}
      </text>

      {rows.map((row) => {
        const obj = all[row.index];
        const isAnchor = row.index >= objects.length;
        const color = isAnchor ? ANCHOR_COLOR : OBJ_PALETTE[row.index % OBJ_PALETTE.length];
        const value = values[row.index];
        const barW = hidden ? equalW + (row.barW - equalW) * t : row.barW;
        const valueText = hidden ? '?' : formatAttrValue(attr, value, unitSystem);
        const label = isAnchor ? `${objectName(obj)} · ref` : objectName(obj);
        // Caption: source name + a *formatted* range when one exists.
        const m = obj.kind === 'library' ? obj.record.measurements[attr] : null;
        const source = m
          ? `${m.source_name}${m.min != null && m.max != null ? ` (${formatAttrValue(attr, m.min, unitSystem)}–${formatAttrValue(attr, m.max, unitSystem)})` : ''}`
          : 'Custom measurement';
        return (
          <g key={obj.record.id}>
            <text
              x={row.barX}
              y={row.y + nameSize + 4}
              fontFamily={FONT}
              fontSize={nameSize}
              fontWeight="700"
              fill="#1c2431"
            >
              {label.length > 30 ? `${label.slice(0, 29)}…` : label}
            </text>
            <rect
              x={row.barX}
              y={row.barY}
              width={barW}
              height={row.barH}
              rx={6}
              fill={color}
            />
            <text
              x={hidden ? row.barX + barW + 10 : row.valueInside ? row.barX + row.barW - 10 : row.valueX}
              y={row.barY + row.barH / 2 + valueSize / 2.6}
              textAnchor={hidden ? 'start' : row.valueInside ? 'end' : 'start'}
              fontFamily={FONT}
              fontSize={valueSize}
              fontWeight="700"
              fill={hidden ? color : row.valueInside ? '#ffffff' : color}
            >
              {valueText}
            </text>
            {showSources && source && (
              <text
                x={row.barX}
                y={row.barY + row.barH + sourceSize + 6}
                fontFamily={FONT}
                fontSize={sourceSize}
                fill="#6b7280"
              >
                {source.length > 70 ? `${source.slice(0, 69)}…` : source}
              </text>
            )}
          </g>
        );
      })}

      <text
        x={box.width - 16}
        y={totalH - 8}
        textAnchor="end"
        fontFamily={FONT}
        fontSize={captionSize}
        fill="#6b7280"
      >
        {hidden
          ? 'Equal bars — true lengths revealed after you answer'
          : extreme
            ? 'Bar lengths are truly proportional — the short bar really is that light'
            : 'Bar lengths proportional to real weight'}
      </text>
    </svg>
  );
}
