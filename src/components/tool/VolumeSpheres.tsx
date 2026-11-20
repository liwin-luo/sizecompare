/**
 * VolumeSpheres — honest 3-D volume comparison in 2-D.
 * Radius ∝ ∛volume at one shared scale: the drawn RADIUS is the honest
 * projection of a 3-D quantity. The caption states the rule because
 * on-screen area is still not proportional to volume.
 */

import { useMemo } from 'react';
import { ChartError, sphereLayout } from '../../lib/charts';
import { formatAttrValue } from '../../lib/attributes';
import { objectName, objectSourceLine, objectValue, type ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { OBJ_PALETTE } from './ScaleCanvas';

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

export function VolumeSpheres({
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
  attr: 'volume';
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
  /** Quiz reveal progress 0→1: below 1 radii blend from equal, values hidden. */
  reveal?: number;
}) {
  const values = objects.map((o) => objectValue(o, attr) ?? 0);

  const layout = useMemo(() => {
    try {
      return { layout: sphereLayout(values, box), error: null as string | null };
    } catch (e) {
      return {
        layout: null,
        error: e instanceof ChartError ? e.message : 'Could not lay out the spheres.',
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
          {layout.error ?? 'Add objects to compare volume'}
        </text>
      </svg>
    );
  }

  const { items, baselineY, extreme } = layout.layout;

  const hidden = reveal < 1;
  // Quiz blend: every radius interpolates from the geometric-mean radius
  // (equal spheres, truth hidden) toward its true ∝∛V radius.
  const t = Math.min(Math.max(reveal, 0), 1);
  const meanRoot = Math.cbrt(
    Math.exp(values.reduce((s, v) => s + Math.log(v), 0) / values.length),
  );
  const equalR = meanRoot * layout.layout.scale;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={
        hidden
          ? `Volume quiz chart: ${objects.map((o) => objectName(o)).join(', ')} with equal spheres and values hidden`
          : `Volume comparison: ${objects.map((o) => objectName(o)).join(', ')}`
      }
    >
      <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill="#0e6f63">
        Comparing: Volume
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
        const r = hidden ? equalR + (item.r - equalR) * t : item.r;
        const cy = baselineY - r;
        const valueText = hidden ? '?' : formatAttrValue(attr, value, unitSystem);
        const source = objectSourceLine(obj, attr);
        const nameY = baselineY + nameSize + 10;
        const valueY = nameY + valueSize + 8;
        return (
          <g key={obj.record.id}>
            <circle
              cx={item.cx}
              cy={cy}
              r={r}
              fill={color}
              opacity="0.92"
            />
            {/* highlight arc suggests 3-D form without dishonest shading */}
            <circle
              cx={item.cx - r * 0.25}
              cy={cy - r * 0.3}
              r={r * 0.55}
              fill="#ffffff"
              opacity="0.14"
            />
            <text
              x={item.cx}
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
              x={item.cx}
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
                x={item.cx}
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
          ? 'Equal spheres — true sizes revealed after you answer'
          : 'Sphere radius ∝ ∛volume — a 2× radius holds 8× the volume'}
      </text>
      {extreme && (
        <text
          x={box.width - 16}
          y={totalH - 8}
          textAnchor="end"
          fontFamily={FONT}
          fontSize={captionSize}
          fill="#b45309"
        >
          True scale — the small sphere really is that tiny
        </text>
      )}
    </svg>
  );
}
