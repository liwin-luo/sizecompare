/**
 * FamilyCanvas — the ONE place that maps an attribute to its honest
 * visualization. The studio canvas, print sheet, presentation mode and
 * the quiz all render through this switch; adding a family means
 * touching exactly this file.
 *
 * areaOverlay / anchor default off so quiz callers stay simple.
 */

import type { AttributeKey } from '../../lib/attributes';
import { ATTRIBUTE_FAMILY } from '../../lib/attributes';
import type { ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { ScaleCanvas } from './ScaleCanvas';
import { WeightBars } from './WeightBars';
import { VolumeSpheres } from './VolumeSpheres';
import { AreaSquares } from './AreaSquares';
import { AreaOverlay } from './AreaOverlay';

export function FamilyCanvas({
  objects,
  attr,
  box,
  unitSystem,
  large = false,
  showSources = true,
  svgId,
  reveal = 1,
  areaOverlay = false,
  anchor = null,
}: {
  objects: ComparisonObject[];
  attr: AttributeKey;
  box: { width: number; height: number };
  unitSystem: UnitSystem;
  large?: boolean;
  showSources?: boolean;
  svgId?: string;
  reveal?: number;
  /** Area family: outlined country overlay instead of √A squares. */
  areaOverlay?: boolean;
  /** Reference anchor drawn in neutral grey to give the scale human meaning. */
  anchor?: ComparisonObject | null;
}) {
  const family = ATTRIBUTE_FAMILY[attr];
  const shared = {
    objects,
    attr: attr as never,
    box,
    unitSystem,
    large,
    showSources,
    svgId,
    reveal,
    anchor,
  };

  if (family === 'weight' || family === 'bars') {
    return <WeightBars {...shared} />;
  }
  if (family === 'volume') {
    return <VolumeSpheres {...shared} />;
  }
  if (family === 'area') {
    return areaOverlay ? (
      <AreaOverlay {...shared} />
    ) : (
      <AreaSquares {...shared} />
    );
  }
  return <ScaleCanvas {...shared} />;
}
