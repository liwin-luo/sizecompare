/**
 * WeightBars — honest proportional bar chart for weight comparisons.
 * Bar length is strictly proportional to real mass (no truncated axes).
 * Inline presentation attributes only, so PNG export stays faithful.
 */

import { useMemo } from 'react';
import { ChartError, weightBarLayout } from '../../lib/charts';
import { formatAttrValue } from '../../lib/attributes';
import { objectName, objectSourceLine, objectValue, type ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
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
}: {
  objects: ComparisonObject[];
  attr: 'weight';
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
}) {
  const values = objects.map((o) => objectValue(o, attr) ?? 0);

  const layout = useMemo(() => {
    try {
      return { layout: weightBarLayout(values, box), error: null as string | null };
    } catch (e) {
      return {
        layout: null,
        error: e instanceof ChartError ? e.message : 'Could not lay out the bars.',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, attr, box.width, box.height]);

  const nameSize = large ? 28 : 15;
  const valueSize = large ? 24 : 14;
  const sourceSize = large ? 16 : 11;
  const captionSize = large ? 18 : 11;

  const totalH = box.height + (showSources ? objects.length * (sourceSize + 10) : 0) + 8;

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
  const sourcePad = showSources ? sourceSize + 10 : 0;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={`Weight comparison: ${objects.map((o) => objectName(o)).join(', ')}`}
    >
      <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill="#0e6f63">
        Comparing: Weight
      </text>

      {rows.map((row) => {
        const obj = objects[row.index];
        const color = OBJ_PALETTE[row.index % OBJ_PALETTE.length];
        const value = values[row.index];
        const valueText = formatAttrValue(attr, value, unitSystem);
        const source = objectSourceLine(obj, attr);
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
              {objectName(obj).length > 30 ? `${objectName(obj).slice(0, 29)}…` : objectName(obj)}
            </text>
            <rect
              x={row.barX}
              y={row.barY}
              width={row.barW}
              height={row.barH}
              rx={6}
              fill={color}
            />
            <text
              x={row.valueInside ? row.barX + row.barW - 10 : row.valueX}
              y={row.barY + row.barH / 2 + valueSize / 2.6}
              textAnchor={row.valueInside ? 'end' : 'start'}
              fontFamily={FONT}
              fontSize={valueSize}
              fontWeight="700"
              fill={row.valueInside ? '#ffffff' : color}
            >
              {valueText}
            </text>
            {showSources && source && (
              <text
                x={row.barX}
                y={row.barY + row.barH + sourcePad - 2}
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
        {extreme
          ? 'Bar lengths are truly proportional — the short bar really is that light'
          : 'Bar lengths proportional to real weight'}
      </text>
    </svg>
  );
}
