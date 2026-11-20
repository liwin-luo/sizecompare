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
  parseMass,
  parseMeasurement,
  parseVolume,
  MASS_LABELS,
  UNIT_LABELS,
  VOLUME_LABELS,
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

const CATEGORIES = ['animal', 'everyday', 'food', 'space', 'building', 'vehicle', 'reference'];

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
  if (record.image && record.image_box) {
    const [l, t, bw, bh] = record.image_box;
    return (
      <svg
        width={w}
        height={h}
        viewBox={`${l * 36} ${t * 36} ${bw * 36} ${bh * 36}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <image href={record.image} xlinkHref={record.image} width="36" height="36" />
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

function unitsFor(attr: AttributeKey): { values: string[]; labels: Record<string, string> } {
  const family = ATTRIBUTE_FAMILY[attr];
  if (family === 'weight') return { values: MASS_UNITS, labels: MASS_LABELS };
  if (family === 'volume') return { values: VOLUME_UNITS, labels: VOLUME_LABELS };
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
    if (family === 'weight') {
      const res = parseMass(value, unit as MassUnit);
      if (!res.ok) { setError(res.error ?? 'Check the weight.'); return; }
      base = res.g ?? null;
    } else if (family === 'volume') {
      const res = parseVolume(value, unit as VolumeUnit);
      if (!res.ok) { setError(res.error ?? 'Check the volume.'); return; }
      base = res.ml ?? null;
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
  onTitle,
  onPrompt,
  onUnitSystem,
  onShowAnswers,
}: {
  title: string;
  prompt: string;
  unitSystem: UnitSystem;
  showAnswers: boolean;
  onTitle: (v: string) => void;
  onPrompt: (v: string) => void;
  onUnitSystem: (v: UnitSystem) => void;
  onShowAnswers: (v: boolean) => void;
}) {
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
