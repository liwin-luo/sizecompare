/**
 * Editor side panels — object picker, custom object form, comparison
 * editor and export actions. Pure presentational components; state
 * lives in CompareStudio.
 */

import { useState } from 'react';
import { CATEGORY_LABELS, OBJECT_LIBRARY } from '../../data/library';
import {
  ATTRIBUTE_FAMILY,
  ATTRIBUTE_LABELS,
  ALL_ATTRS,
  type AttributeFamily,
  type AttributeKey,
} from '../../lib/attributes';
import { validateName, type CustomObject, type ObjectV2 } from '../../lib/objects';
import {
  parseArea,
  parseBarValue,
  parseMass,
  parseMeasurement,
  parseVolume,
  AREA_LABELS,
  KMH_PER_MPH,
  MASS_LABELS,
  MAX_KMH,
  MAX_PEOPLE,
  MAX_YEARS,
  MIN_KMH,
  MIN_PEOPLE,
  MIN_YEARS,
  UNIT_LABELS,
  VOLUME_LABELS,
  type AreaUnit,
  type MassUnit,
  type Unit,
  type UnitSystem,
  type VolumeUnit,
} from '../../lib/units';
import { SILHOUETTES } from './silhouettes';
import { OBJ_PALETTE, formatValue } from './ScaleCanvas';

/* ── selected objects list ── */

export interface SelectedItem {
  id: string;
  name: string;
  /** Pre-formatted primary-attribute display, e.g. "3.2 m". */
  display: string;
}

export function SelectedObjects({
  items,
  onRemove,
  max,
}: {
  items: SelectedItem[];
  onRemove: (id: string) => void;
  max: number;
}) {
  if (items.length === 0) {
    return (
      <p className="hint" style={{ margin: 0 }}>
        No objects yet — search the library or add your own below.
      </p>
    );
  }
  return (
    <ul className="selected-list">
      {items.map((r, i) => (
        <li key={r.id}>
          <span className="dot" style={{ background: OBJ_PALETTE[i % OBJ_PALETTE.length] }} />
          <span className="sel-name">{r.name}</span>
          <span className="sel-value">{r.display}</span>
          <button type="button" onClick={() => onRemove(r.id)} aria-label={`Remove ${r.name}`}>
            ×
          </button>
        </li>
      ))}
      <li className="hint" aria-live="polite">
        {items.length >= max
          ? `${max} objects is the limit in this version.`
          : `${items.length} of up to ${max} objects selected.`}
      </li>
    </ul>
  );
}

/* ── library picker ── */

const CATEGORIES = [
  'animal',
  'everyday',
  'food',
  'space',
  'building',
  'vehicle',
  'place',
  'reference',
];

export function ObjectPicker({
  selectedIds,
  onAdd,
  disabled,
}: {
  selectedIds: string[];
  onAdd: (record: ObjectV2) => void;
  disabled: boolean;
}) {
  const [cat, setCat] = useState('animal');

  return (
    <div>
      <div className="cat-tabs" role="tablist" aria-label="Object categories">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={cat === c}
            className={cat === c ? 'on' : ''}
            onClick={() => setCat(c)}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <ul className="lib-grid">
        {OBJECT_LIBRARY.filter((r) => r.category === cat).map((r) => {
          const selected = selectedIds.includes(r.id);
          return (
            <li key={r.id}>
              <button
                type="button"
                className={`lib-card ${selected ? 'picked' : ''}`}
                disabled={disabled && !selected}
                onClick={() => onAdd(r)}
                title={
                  r.measurements[r.primaryAttr]?.context ??
                  `${ATTRIBUTE_LABELS[r.primaryAttr]}: ${formatValue(r, r.primaryAttr, 'metric')}`
                }
              >
                <MiniSilhouette record={r} />
                <span className="lib-name">{r.name}</span>
                <span className="lib-value">
                  {formatValue(r, r.primaryAttr, 'metric')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MiniSilhouette({ record }: { record: ObjectV2 }) {
  const h = 34;
  const w = Math.min(64, Math.max(10, h * record.aspect));
  if (record.image) {
    return (
      <svg width={w} height={h} aria-hidden="true">
        <image href={record.image} xlinkHref={record.image} width={w} height={h} preserveAspectRatio="none" />
      </svg>
    );
  }
  const sil = SILHOUETTES[record.silhouette];
  return (
    <svg width={w} height={h} viewBox={sil.viewBox} preserveAspectRatio="none" aria-hidden="true">
      {sil.render('#475569')}
    </svg>
  );
}

/* ── custom object form ── */

const LINEAR_UNITS: Unit[] = ['mm', 'cm', 'm', 'in', 'ft'];
const MASS_UNITS: MassUnit[] = ['g', 'kg', 't', 'oz', 'lb'];
const VOLUME_UNITS: VolumeUnit[] = ['ml', 'l', 'floz', 'gal'];
const AREA_UNITS: AreaUnit[] = ['m²', 'km²', 'sq ft', 'sq mi'];
const SPEED_UNITS = ['km/h', 'mph'];

const BAR_UNIT_SPECS: Partial<Record<AttributeKey, { values: string[] }>> = {
  population: { values: ['people'] },
  lifespan: { values: ['years'] },
  speed: { values: SPEED_UNITS },
  popdensity: { values: ['people/km²'] },
  density: { values: ['g/ml'] },
};

function unitsFor(attr: AttributeKey): { values: string[]; labels: Record<string, string> } {
  const family = ATTRIBUTE_FAMILY[attr];
  if (family === 'weight') return { values: MASS_UNITS, labels: MASS_LABELS };
  if (family === 'volume') return { values: VOLUME_UNITS, labels: VOLUME_LABELS };
  if (family === 'area') return { values: AREA_UNITS, labels: AREA_LABELS };
  const bar = BAR_UNIT_SPECS[attr];
  if (bar) return { values: bar.values, labels: Object.fromEntries(bar.values.map((u) => [u, u])) };
  return { values: LINEAR_UNITS, labels: UNIT_LABELS };
}

export function CustomObjectForm({
  onAdd,
  disabled,
}: {
  onAdd: (custom: CustomObject) => void;
  disabled: boolean;
}) {
  const [name, setName] = useState('');
  const [attr, setAttr] = useState<AttributeKey>('height');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<string>('cm');
  const [error, setError] = useState<string | null>(null);

  function switchAttr(next: AttributeKey) {
    setAttr(next);
    const { values } = unitsFor(next);
    if (!values.includes(unit)) setUnit(values[1] ?? values[0]);
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const nameCheck = validateName(name);
    if (!nameCheck.ok) {
      setError(nameCheck.error ?? 'Check the name.');
      return;
    }
    const family = ATTRIBUTE_FAMILY[attr] as AttributeFamily;
    let base: number | null = null;
    if (family === 'bars') {
      const noun = ATTRIBUTE_LABELS[attr].toLowerCase();
      const limits: Record<string, [number, number, string]> = {
        population: [MIN_PEOPLE, MAX_PEOPLE, '10 billion people'],
        lifespan: [MIN_YEARS, MAX_YEARS, '10,000 years'],
        speed: [MIN_KMH, MAX_KMH, '300,000 km/h'],
        popdensity: [0.0001, 1e9, '1 billion people/km²'],
        density: [0.0001, 1e6, '1,000,000 g/ml'],
      };
      const [min, max, maxLabel] = limits[attr] ?? [0.0001, 1e12, 'out of range'];
      const res = parseBarValue(value, min, max, maxLabel, noun);
      if (!res.ok) {
        setError(res.error ?? 'Check the value.');
        return;
      }
      // speed entered in mph converts to the km/h base exactly
      base = attr === 'speed' && unit === 'mph' ? (res.value ?? 0) * KMH_PER_MPH : (res.value ?? 0);
    } else if (family === 'weight') {
      const res = parseMass(value, unit as MassUnit);
      if (!res.ok) { setError(res.error ?? 'Check the weight.'); return; }
      base = res.g ?? null;
    } else if (family === 'volume') {
      const res = parseVolume(value, unit as VolumeUnit);
      if (!res.ok) { setError(res.error ?? 'Check the volume.'); return; }
      base = res.ml ?? null;
    } else if (family === 'area') {
      const res = parseArea(value, unit as AreaUnit);
      if (!res.ok) { setError(res.error ?? 'Check the area.'); return; }
      base = res.mm2 ?? null;
    } else {
      const res = parseMeasurement(value, unit as Unit);
      if (!res.ok) { setError(res.error ?? 'Check the measurement.'); return; }
      base = res.mm ?? null;
    }
    if (base === null) { setError('Enter a value.'); return; }

    onAdd({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      attr,
      value: base,
      color: OBJ_PALETTE[0],
    });
    setName('');
    setValue('');
    setError(null);
  }

  const { values, labels } = unitsFor(attr);

  return (
    <form className="custom-form" onSubmit={submit}>
      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My bike"
          maxLength={60}
        />
      </label>
      <label>
        Attribute
        <select value={attr} onChange={(e) => switchAttr(e.target.value as AttributeKey)}>
          {ALL_ATTRS.map((a) => (
            <option key={a} value={a}>
              {ATTRIBUTE_LABELS[a]}
            </option>
          ))}
        </select>
      </label>
      <div className="row">
        <label>
          Value
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={unit === 'ft' ? `e.g. 30 or 5'4"` : 'e.g. 30'}
            inputMode="decimal"
          />
        </label>
        <label>
          Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            {values.map((u) => (
              <option key={u} value={u}>
                {labels[u]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={disabled}>
        Add object
      </button>
    </form>
  );
}

/* ── comparison editor ── */

export function EditorPanel({
  title,
  prompt,
  unitSystem,
  showAnswers,
  anchorEnabled,
  anchorId,
  anchorOptions,
  anchorDisabled,
  onTitle,
  onPrompt,
  onUnitSystem,
  onShowAnswers,
  onAnchor,
}: {
  title: string;
  prompt: string;
  unitSystem: UnitSystem;
  showAnswers: boolean;
  anchorEnabled: boolean;
  /** null = follow the per-attribute default anchor. */
  anchorId: string | null;
  anchorOptions: { id: string; name: string; isDefault: boolean }[];
  anchorDisabled: boolean;
  onTitle: (v: string) => void;
  onPrompt: (v: string) => void;
  onUnitSystem: (v: UnitSystem) => void;
  onShowAnswers: (v: boolean) => void;
  onAnchor: (enabled: boolean, id: string | null) => void;
}) {
  const defaultOption = anchorOptions.find((o) => o.isDefault);
  return (
    <div className="editor-panel">
      <label>
        Title
        <input value={title} onChange={(e) => onTitle(e.target.value)} maxLength={90} />
      </label>
      <label>
        Question
        <input
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          placeholder="Which one is taller? How much heavier?"
          maxLength={140}
        />
      </label>
      <fieldset className="unit-toggle">
        <legend>Units</legend>
        <div className="seg">
          <button
            type="button"
            aria-pressed={unitSystem === 'metric'}
            className={unitSystem === 'metric' ? 'on' : ''}
            onClick={() => onUnitSystem('metric')}
          >
            Metric (cm / m / kg)
          </button>
          <button
            type="button"
            aria-pressed={unitSystem === 'imperial'}
            className={unitSystem === 'imperial' ? 'on' : ''}
            onClick={() => onUnitSystem('imperial')}
          >
            Imperial (in / ft / lb)
          </button>
        </div>
      </fieldset>
      <fieldset className="unit-toggle" disabled={anchorDisabled}>
        <legend>Reference anchor</legend>
        <label className="check">
          <input
            type="checkbox"
            checked={anchorEnabled && !anchorDisabled}
            disabled={anchorDisabled}
            onChange={(e) => onAnchor(e.target.checked, null)}
          />
          Pin a familiar object for scale
        </label>
        {anchorEnabled && !anchorDisabled && (
          <label>
            Anchor object
            <select
              value={anchorId ?? ''}
              onChange={(e) => onAnchor(true, e.target.value === '' ? null : e.target.value)}
            >
              <option value="">
                {defaultOption ? `Auto (${defaultOption.name})` : 'Choose an object'}
              </option>
              {anchorOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                  {`${o.isDefault ? ' · default' : ''}`}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>
      <label className="check">
        <input
          type="checkbox"
          checked={showAnswers}
          onChange={(e) => onShowAnswers(e.target.checked)}
        />
        Show the answer line
      </label>
    </div>
  );
}

/* ── export ── */

export function ExportPanel({
  canExport,
  onPng,
  onPrint,
}: {
  canExport: boolean;
  onPng: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="export-panel">
      <button type="button" className="btn btn-primary" disabled={!canExport} onClick={onPng}>
        Download PNG
      </button>
      <button type="button" className="btn btn-ghost" disabled={!canExport} onClick={onPrint}>
        Print / Save as PDF
      </button>
    </div>
  );
}
