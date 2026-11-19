/**
 * Editor side panels — object picker, custom object form, lesson editor
 * and export actions. Pure presentational components; state lives in
 * ComparisonTool.
 */

import { useState } from 'react';
import { CATEGORY_LABELS, OBJECT_LIBRARY } from '../../data/library';
import {
  DIMENSION_LABELS,
  validateName,
  type Category,
  type CustomObject,
  type DimensionType,
  type ObjectRecord,
} from '../../lib/objects';
import { parseMeasurement, UNIT_LABELS, type Unit, type UnitSystem } from '../../lib/units';
import { SILHOUETTES } from './silhouettes';
import { OBJ_PALETTE, formatValue } from './ScaleCanvas';

/* ── selected objects list ── */

export interface SelectedItem {
  id: string;
  name: string;
  value_mm: number;
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
        No objects yet — pick from the library or add your own below.
      </p>
    );
  }
  return (
    <ul className="selected-list">
      {items.map((r, i) => (
        <li key={r.id}>
          <span className="dot" style={{ background: OBJ_PALETTE[i % OBJ_PALETTE.length] }} />
          <span className="sel-name">{r.name}</span>
          <span className="sel-value">{formatValue(r.value_mm, 'metric')}</span>
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

const CATEGORIES: Category[] = ['classroom', 'everyday', 'animal', 'reference'];

export function ObjectPicker({
  selectedIds,
  onAdd,
  disabled,
}: {
  selectedIds: string[];
  onAdd: (record: ObjectRecord) => void;
  disabled: boolean;
}) {
  const [cat, setCat] = useState<Category>('classroom');

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
                title={r.measurement_context}
              >
                <MiniSilhouette record={r} />
                <span className="lib-name">{r.name}</span>
                <span className="lib-value">{formatValue(r.value_mm, 'metric')}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MiniSilhouette({ record }: { record: ObjectRecord }) {
  const sil = SILHOUETTES[record.silhouette];
  const h = 34;
  const w = Math.min(64, Math.max(10, h * record.aspect));
  return (
    <svg width={w} height={h} viewBox={sil.viewBox} preserveAspectRatio="none" aria-hidden="true">
      {sil.render('#475569')}
    </svg>
  );
}

/* ── custom object form ── */

const DIMENSIONS: DimensionType[] = ['height', 'length', 'width', 'diameter'];
const UNITS: Unit[] = ['mm', 'cm', 'm', 'in', 'ft'];

export function CustomObjectForm({
  onAdd,
  disabled,
}: {
  onAdd: (custom: CustomObject) => void;
  disabled: boolean;
}) {
  const [name, setName] = useState('');
  const [dimension, setDimension] = useState<DimensionType>('length');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<Unit>('cm');
  const [error, setError] = useState<string | null>(null);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const nameCheck = validateName(name);
    if (!nameCheck.ok) {
      setError(nameCheck.error ?? 'Check the name.');
      return;
    }
    const parsed = parseMeasurement(value, unit);
    if (!parsed.ok || parsed.mm === undefined) {
      setError(parsed.error ?? 'Check the measurement.');
      return;
    }
    onAdd({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      dimension_type: dimension,
      value_mm: parsed.mm,
      color: OBJ_PALETTE[0],
    });
    setName('');
    setValue('');
    setError(null);
  }

  return (
    <form className="custom-form" onSubmit={submit}>
      <label>
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My shoe"
          maxLength={60}
        />
      </label>
      <div className="row">
        <label>
          Measurement
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={unit === 'ft' ? `e.g. 30 or 5'4"` : 'e.g. 30'}
            inputMode="decimal"
          />
        </label>
        <label>
          Unit
          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Dimension
        <select
          value={dimension}
          onChange={(e) => setDimension(e.target.value as DimensionType)}
        >
          {DIMENSIONS.map((d) => (
            <option key={d} value={d}>
              {DIMENSION_LABELS[d]}
            </option>
          ))}
        </select>
      </label>
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

/* ── lesson editor ── */

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
        Classroom question
        <input
          value={prompt}
          onChange={(e) => onPrompt(e.target.value)}
          placeholder="Which one is taller? How much taller?"
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
            Metric (cm / m)
          </button>
          <button
            type="button"
            aria-pressed={unitSystem === 'imperial'}
            className={unitSystem === 'imperial' ? 'on' : ''}
            onClick={() => onUnitSystem('imperial')}
          >
            Imperial (in / ft)
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
