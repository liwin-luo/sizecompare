/**
 * AreaOverlay — country outlines overlaid at one shared true scale.
 * Bottom-centre anchored on a common ground line: the larger country sits
 * behind, the smaller is semi-transparent on top, so the difference reads
 * at a glance. Shapes come from PLACE_SHAPES (equal-area calibrated to CIA
 * WFB totals). Inline presentation attributes only, so PNG export stays
 * faithful; no reveal — the quiz keeps the √A squares (an overlay would
 * spoil the answer before the guess).
 */

import { useMemo } from 'react';
import { ChartError, overlayLayout } from '../../lib/charts';
import { formatAttrValue } from '../../lib/attributes';
import { objectName, objectSourceLine, objectValue, type ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { PLACE_SHAPES } from '../../data/placeShapes';
import { ANCHOR_COLOR } from '../../lib/anchors';
import { OBJ_PALETTE, buildAnswerSentence } from './ScaleCanvas';

const FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

export function AreaOverlay({
  objects,
  attr,
  box,
  unitSystem,
  large = false,
  showSources = true,
  svgId,
  anchor = null,
}: {
  objects: ComparisonObject[];
  attr: 'area';
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
  /** Reference anchor drawn in neutral grey behind the outlines. */
  anchor?: ComparisonObject | null;
}) {
  const nameSize = large ? 26 : 15;
  const sourceSize = large ? 16 : 11;
  const captionSize = large ? 18 : 11;

  const layout = useMemo(() => {
    try {
      const footprints = objects.map((o) => {
        const id = o.kind === 'library' ? o.record.id : null;
        const shape = id ? PLACE_SHAPES[id] : undefined;
        if (!shape) throw new ChartError('Every object needs an outline shape.');
        const [, , vbW, vbH] = shape.viewBox.split(' ').map(Number);
        return {
          wMm: vbW * shape.scaleToMm,
          hMm: vbH * shape.scaleToMm,
          value: objectValue(o, attr) ?? 0,
        };
      });
      // the anchor joins the fit (it may be the largest footprint) but is
      // rendered behind everything as a scale marker, never a contestant
      if (anchor) {
        const id = anchor.kind === 'library' ? anchor.record.id : '';
        const shape = PLACE_SHAPES[id];
        const value = objectValue(anchor, attr) ?? 0;
        if (shape) {
          const [, , vbW, vbH] = shape.viewBox.split(' ').map(Number);
          footprints.push({ wMm: vbW * shape.scaleToMm, hMm: vbH * shape.scaleToMm, value });
        } else {
          const side = Math.sqrt(value);
          footprints.push({ wMm: side, hMm: side, value });
        }
      }
      return { layout: overlayLayout(footprints, box), error: null as string | null };
    } catch (e) {
      return {
        layout: null,
        error: e instanceof ChartError ? e.message : 'Could not lay out the overlay.',
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, attr, box.width, box.height, anchor]);

  const rowH = nameSize + 10;
  const labelZone = (objects.length + (anchor ? 1 : 0)) * rowH + (showSources ? sourceSize + 12 : 6);
  const totalH = box.height + labelZone;

  if (!layout.layout) {
    return (
      <svg id={svgId} viewBox={`0 0 ${box.width} ${totalH}`} width="100%" role="img">
        <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
        <text x={box.width / 2} y={totalH / 2} textAnchor="middle" fontFamily={FONT} fontSize="16" fill="#6b7280">
          {layout.error ?? 'Country outlines are not available for this comparison'}
        </text>
      </svg>
    );
  }

  const { items, baselineY, extreme } = layout.layout;

  const sentence = buildAnswerSentence(objects, attr, unitSystem);
  const firstSource =
    objects.length > 0 ? objectSourceLine(objects[0], attr) : null;

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${box.width} ${totalH}`}
      width="100%"
      role="img"
      aria-label={`Area comparison: ${objects.map((o) => objectName(o)).join(' overlaid on ')}`}
    >
      <rect width={box.width} height={totalH} fill="#ffffff" rx="8" />
      <text x="16" y="26" fontFamily={FONT} fontSize={large ? 24 : 14} fontWeight="600" fill="#0e6f63">
        Comparing: Area
      </text>
      {sentence && (
        <text
          x={box.width - 16}
          y="26"
          textAnchor="end"
          fontFamily={FONT}
          fontSize={large ? 22 : 13}
          fontWeight="600"
          fill="#1c2431"
        >
          {sentence}
        </text>
      )}

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

      {/* anchor first (painted behind every outline), then real objects */}
      {[...items]
        .sort((a, b) => Number(a.index >= objects.length) - Number(b.index >= objects.length))
        .map((item, drawIndex) => {
          const isAnchor = item.index >= objects.length;
          const obj = isAnchor ? anchor! : objects[item.index];
          const id = obj.kind === 'library' ? obj.record.id : '';
          const shape = PLACE_SHAPES[id];
          const color = isAnchor ? ANCHOR_COLOR : OBJ_PALETTE[item.index % OBJ_PALETTE.length];
          const value = objectValue(obj, attr) ?? 0;
          const label = isAnchor ? `${objectName(obj)} · ref` : objectName(obj);
          // draw order is largest-first: later shapes overlay earlier ones
          const onTop = !isAnchor && drawIndex > 0;
          // stroke of a constant 2px in canvas space, expressed in viewBox units
          const strokeWidth = shape ? (2 * Number(shape.viewBox.split(' ')[2])) / item.w : 2;

          return (
            <g key={`${id}-${isAnchor ? 'anchor' : 'obj'}`}>
              {shape ? (
                <svg
                  x={item.x}
                  y={item.y}
                  width={item.w}
                  height={item.h}
                  viewBox={shape.viewBox}
                  preserveAspectRatio="none"
                >
                  <path
                    d={shape.path}
                    fill={color}
                    fillOpacity={isAnchor ? 0.25 : onTop ? 0.5 : 0.92}
                    stroke={isAnchor || onTop ? color : 'none'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isAnchor ? `${strokeWidth * 2.5} ${strokeWidth * 2}` : undefined}
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                isAnchor && (
                  // anchor without an outline: an honest √A square at the same scale
                  <rect
                    x={item.x}
                    y={item.y}
                    width={item.w}
                    height={item.h}
                    fill={ANCHOR_COLOR}
                    fillOpacity="0.25"
                    stroke={ANCHOR_COLOR}
                    strokeWidth="2"
                    strokeDasharray="5 4"
                  />
                )
              )}
              <text
                x={box.width / 2}
                y={baselineY + (drawIndex + 1) * rowH}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize={nameSize}
                fontWeight="700"
              >
                <tspan fill="#1c2431">
                  {label.length > 24 ? `${label.slice(0, 23)}…` : label}
                </tspan>
                <tspan fill={color}>{` — ${formatAttrValue(attr, value, unitSystem)}`}</tspan>
              </text>
            </g>
          );
        })}

      {showSources && firstSource && (
        <text
          x={box.width / 2}
          y={baselineY + objects.length * rowH + sourceSize + 4}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={sourceSize}
          fill="#6b7280"
        >
          {firstSource.length > 28 ? `${firstSource.slice(0, 27)}…` : firstSource}
        </text>
      )}

      <text
        x="16"
        y={totalH - 8}
        fontFamily={FONT}
        fontSize={captionSize}
        fill="#6b7280"
      >
        One shared scale — outlines equal-area calibrated to CIA WFB totals · Natural Earth (public domain)
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
          True scale — the small outline really is that tiny
        </text>
      )}
    </svg>
  );
}
