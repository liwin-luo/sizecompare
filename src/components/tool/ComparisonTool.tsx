/**
 * CompareStudio — the SizeCompare comparison island.
 *
 * Owns the comparison state (objects, active attribute, title, question,
 * units, answers), persists to localStorage only, and composes the
 * three visualization families (linear scale, weight bars, volume
 * spheres) plus editor panels, presentation mode and the print sheet.
 * Nothing leaves the browser.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIBRARY_BY_ID, OBJECT_LIBRARY } from '../../data/library';
import {
  ATTRIBUTE_FAMILY,
  ATTRIBUTE_LABELS,
  formatAttrValue,
  sharedAttributes,
  type AttributeKey,
} from '../../lib/attributes';
import {
  objectAttrs,
  objectName,
  objectSourceLine,
  objectValue,
  type CustomObject,
  type ObjectV2,
} from '../../lib/objects';
import { computeLayout, assessScale } from '../../lib/scale';
import type { UnitSystem } from '../../lib/units';
import { ScaleCanvas, buildAnswerSentence, formatValue, objectVisual, MAX_OBJECTS } from './ScaleCanvas';
import { WeightBars } from './WeightBars';
import { VolumeSpheres } from './VolumeSpheres';
import {
  CustomObjectForm,
  EditorPanel,
  ExportPanel,
  ObjectPicker,
  SelectedObjects,
} from './Panels';
import { PresentationMode } from './PresentationMode';
import { EXAMPLES } from './examples';
import { exportSvgAsPng } from './exportPng';
import { track } from './track';

interface StudioState {
  title: string;
  prompt: string;
  unitSystem: UnitSystem;
  showAnswers: boolean;
  libraryIds: string[];
  customs: CustomObject[];
  /** Active attribute; falls back to the first shared one at render time. */
  activeAttr: AttributeKey | null;
}

const STORAGE_KEY = 'sizecompare:studio:v2';

function exampleState(exampleId: string): StudioState {
  const ex = EXAMPLES.find((e) => e.id === exampleId) ?? EXAMPLES[0];
  return {
    title: ex.title,
    prompt: ex.prompt,
    unitSystem: 'metric',
    showAnswers: false,
    libraryIds: [...ex.libraryIds],
    customs: [],
    activeAttr: ex.attr ?? null,
  };
}

const EMPTY: StudioState = {
  title: '',
  prompt: '',
  unitSystem: 'metric',
  showAnswers: false,
  libraryIds: [],
  customs: [],
  activeAttr: null,
};

export default function CompareStudio({
  preloadIds,
  preloadTitle,
  preloadPrompt,
}: {
  /** Objects preloaded from a /compare/ page (checked against the library). */
  preloadIds?: string[];
  preloadTitle?: string;
  preloadPrompt?: string;
}) {
  const [state, setState] = useState<StudioState>(() =>
    preloadIds && preloadIds.length >= 2
      ? {
          ...EMPTY,
          libraryIds: preloadIds.filter((id) => id in LIBRARY_BY_ID),
          title: preloadTitle ?? '',
          prompt: preloadPrompt ?? '',
        }
      : exampleState(EXAMPLES[0].id),
  );
  const [presenting, setPresenting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 800, height: 440 });
  const [query, setQuery] = useState('');

  /* restore previous work from localStorage (client only) — but never
     override a comparison preloaded from a /compare/ page */
  useEffect(() => {
    track('tool_start');
    if (preloadIds && preloadIds.length >= 2) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as StudioState;
        if (saved && Array.isArray(saved.libraryIds)) setState(saved);
      }
    } catch {
      /* corrupted save — start from the example */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* persist */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — the session still works */
    }
  }, [state]);

  /* responsive canvas */
  useEffect(() => {
    const el = canvasWrapRef.current;
    const resize = () => {
      const w = el?.clientWidth ?? 800;
      setBox({ width: w, height: Math.round(Math.max(340, Math.min(520, w * 0.52))) });
    };
    resize();
    if (!el) return;
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const objects = useMemo(() => {
    const lib = state.libraryIds
      .map((id) => LIBRARY_BY_ID[id])
      .filter((r): r is ObjectV2 => Boolean(r))
      .map((record) => ({ kind: 'library' as const, record }));
    const custom = state.customs.map((record) => ({ kind: 'custom' as const, record }));
    return [...lib, ...custom];
  }, [state.libraryIds, state.customs]);

  /* attributes every selected object shares, in canonical order */
  const shared = useMemo(
    () => sharedAttributes(objects.map(objectAttrs)),
    [objects],
  );

  const attr: AttributeKey | null =
    state.activeAttr && shared.includes(state.activeAttr)
      ? state.activeAttr
      : (shared[0] ?? null);

  /* comparison_generated fires when a viewable comparison exists */
  useEffect(() => {
    if (objects.length >= 2 && attr) {
      track('comparison_generated', { count: objects.length, attr });
    }
  }, [objects, attr]);

  const warnings = useMemo(() => {
    const list: { tone: 'warn' | 'info'; text: string }[] = [];
    if (objects.length >= 2 && shared.length === 0) {
      list.push({
        tone: 'warn',
        text: 'These objects have no attribute in common. Remove one or add another object that shares a measured attribute.',
      });
      return list;
    }
    if (objects.length < 2 || !attr) return list;

    const family = ATTRIBUTE_FAMILY[attr];
    if (family === 'linear') {
      const visuals = objects.map((o) => objectVisual(o, attr as never));
      const items = visuals
        .filter((v): v is NonNullable<typeof v> => v !== null)
        .map((v) => ({ valueMm: v.valueMm, aspect: v.aspect, axis: v.axis }));
      try {
        const layout = computeLayout(items, box, 34, 34);
        const health = assessScale(items.map((i) => i.valueMm), layout.scale);
        if (health.extreme) {
          list.push({
            tone: 'warn',
            text: 'These objects differ so much in size that the smallest one is barely visible — that is honest true scale. Discuss why the difference is so huge!',
          });
        }
      } catch {
        /* invalid values are caught at input time */
      }
    } else if (family === 'weight') {
      const values = objects.map((o) => objectValue(o, attr) ?? 0);
      const ratio = Math.max(...values) / Math.min(...values);
      if (ratio > 1000) {
        list.push({
          tone: 'warn',
          text: 'These weights differ enormously — the short bar is honestly that light. Bars stay truly proportional.',
        });
      }
    } else {
      const values = objects.map((o) => objectValue(o, attr) ?? 0);
      const ratio = Math.max(...values) / Math.min(...values);
      if (Math.cbrt(ratio) > 10) {
        list.push({
          tone: 'warn',
          text: 'These volumes differ enormously — the small sphere is honestly that tiny (radius scales with the cube root of volume).',
        });
      }
    }
    return list;
  }, [objects, shared, attr, box]);

  const answer =
    attr && objects.length >= 2
      ? buildAnswerSentence(objects, attr as never, state.unitSystem)
      : null;
  const atMax = objects.length >= MAX_OBJECTS;

  const addLibrary = useCallback((record: ObjectV2) => {
    track('object_added', { source: 'library', category: record.category });
    setState((p) =>
      p.libraryIds.includes(record.id) || p.libraryIds.length + p.customs.length >= MAX_OBJECTS
        ? p
        : { ...p, libraryIds: [...p.libraryIds, record.id] },
    );
  }, []);

  const addCustom = useCallback((custom: CustomObject) => {
    track('object_added', { source: 'custom' });
    setState((p) =>
      p.libraryIds.length + p.customs.length >= MAX_OBJECTS
        ? p
        : { ...p, customs: [...p.customs, custom] },
    );
  }, []);

  const removeById = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      libraryIds: p.libraryIds.filter((x) => x !== id),
      customs: p.customs.filter((c) => c.id !== id),
    }));
  }, []);

  function loadExample(id: string) {
    setState(exampleState(id));
    setExportError(null);
  }

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return [];
    return OBJECT_LIBRARY.filter(
      (r) => r.name.toLowerCase().includes(q) || r.id.includes(q),
    ).slice(0, 8);
  }, [query]);

  async function downloadPng() {
    const svg = document.getElementById('compare-canvas-svg') as SVGSVGElement | null;
    if (!svg) return;
    try {
      const slug =
        (state.title || 'comparison')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50) || 'comparison';
      await exportSvgAsPng(svg, `${slug}.png`);
      track('export_png');
      setExportError(null);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.');
    }
  }

  function printSheet() {
    track('print_started');
    window.print();
  }

  function startPresentation() {
    track('presentation_started');
    setPresenting(true);
  }

  const selectedItems = objects.map((o) => {
    const first = objectAttrs(o)[0];
    const v = first ? objectValue(o, first) : null;
    return {
      id: o.record.id,
      name: objectName(o),
      display:
        first && v !== null ? formatAttrValue(first, v, state.unitSystem) : '—',
    };
  });

  const family = attr ? ATTRIBUTE_FAMILY[attr] : null;
  const canExport = objects.length >= 2 && attr !== null;

  return (
    <div className="tool-root">
      <div className="tool-main">
        <div className="tool-toolbar">
          <div className="example-chips" aria-label="Example comparisons">
            <span className="hint">Try an example:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex.id} type="button" className="chip" onClick={() => loadExample(ex.id)}>
                {ex.title}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canExport}
              onClick={startPresentation}
            >
              ▶ Present
            </button>
          </div>
        </div>

        <div className="canvas-card" ref={canvasWrapRef}>
          {attr === null ? (
            <div className="canvas-empty" style={{ minHeight: box.height }}>
              {objects.length === 0 ? (
                <>
                  <p>Search for something to compare —</p>
                  <p className="hint">e.g. "elephant", "basketball", "Earth", "coffee"</p>
                </>
              ) : (
                <>
                  <p>No shared attribute between these objects.</p>
                  <p className="hint">Remove one, or pick objects that share a measurement.</p>
                </>
              )}
            </div>
          ) : family === 'weight' ? (
            <WeightBars
              objects={objects}
              attr={attr as 'weight'}
              box={box}
              unitSystem={state.unitSystem}
              svgId="compare-canvas-svg"
            />
          ) : family === 'volume' ? (
            <VolumeSpheres
              objects={objects}
              attr={attr as 'volume'}
              box={box}
              unitSystem={state.unitSystem}
              svgId="compare-canvas-svg"
            />
          ) : (
            <ScaleCanvas
              objects={objects}
              attr={attr as never}
              box={box}
              unitSystem={state.unitSystem}
              svgId="compare-canvas-svg"
            />
          )}
        </div>

        {/* attribute tabs */}
        {shared.length > 0 && (
          <div className="attr-tabs" role="tablist" aria-label="Comparison attribute">
            {shared.map((a) => (
              <button
                key={a}
                role="tab"
                type="button"
                aria-selected={a === attr}
                className={a === attr ? 'on' : ''}
                onClick={() => setState((p) => ({ ...p, activeAttr: a }))}
              >
                {ATTRIBUTE_LABELS[a]}
              </button>
            ))}
          </div>
        )}

        {warnings.map((w, i) => (
          <p
            key={i}
            className={w.tone === 'warn' ? 'warn-banner' : 'info-banner'}
            role="status"
          >
            {w.text}
          </p>
        ))}

        {answer && state.showAnswers && (
          <p className="answer-line" aria-live="polite">
            <strong>Answer:</strong> {answer}
          </p>
        )}

        <ExportPanel canExport={canExport} onPng={downloadPng} onPrint={printSheet} />
        {exportError && (
          <p className="form-error" role="alert">
            {exportError}
          </p>
        )}
        <p className="hint storage-note">
          Your comparison saves automatically in this browser. Nothing is uploaded anywhere.
        </p>
      </div>

      <aside className="tool-side">
        <section className="panel">
          <h3>Objects ({objects.length}/{MAX_OBJECTS})</h3>
          <div className="search-box">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 50+ objects…"
              aria-label="Search objects"
            />
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((r) => {
                  const picked = state.libraryIds.includes(r.id);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        disabled={atMax && !picked}
                        onClick={() => {
                          addLibrary(r);
                          setQuery('');
                        }}
                      >
                        <span>{r.name}</span>
                        <span className="hint">{formatValue(r, r.primaryAttr, 'metric')}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {query.trim() !== '' && searchResults.length === 0 && (
              <p className="hint" style={{ margin: '6px 0 0' }}>
                Nothing in the library matches — add it as a custom object instead.
              </p>
            )}
          </div>
          <SelectedObjects items={selectedItems} onRemove={removeById} max={MAX_OBJECTS} />
        </section>

        <section className="panel">
          <h3>Browse library</h3>
          <ObjectPicker selectedIds={state.libraryIds} onAdd={addLibrary} disabled={atMax} />
        </section>

        <section className="panel">
          <h3>Add your own</h3>
          <CustomObjectForm onAdd={addCustom} disabled={atMax} />
        </section>

        <section className="panel">
          <h3>Editor</h3>
          <EditorPanel
            title={state.title}
            prompt={state.prompt}
            unitSystem={state.unitSystem}
            showAnswers={state.showAnswers}
            onTitle={(v) => setState((p) => ({ ...p, title: v }))}
            onPrompt={(v) => setState((p) => ({ ...p, prompt: v }))}
            onUnitSystem={(v) => setState((p) => ({ ...p, unitSystem: v }))}
            onShowAnswers={(v) => setState((p) => ({ ...p, showAnswers: v }))}
          />
        </section>

        <section className="panel">
          <h3>Start over</h3>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setState(EMPTY);
              setExportError(null);
            }}
          >
            Clear this comparison
          </button>
        </section>
      </aside>

      {/* hidden on screen, shown by print.css on paper */}
      <div className="print-sheet" aria-hidden="true">
        <h2 className="print-title">{state.title || 'Comparison'}</h2>
        {state.prompt && <p className="print-prompt">{state.prompt}</p>}
        {attr !== null && (
          <>
            {family === 'weight' ? (
              <WeightBars
                objects={objects}
                attr={attr as 'weight'}
                box={{ width: 740, height: 380 }}
                unitSystem={state.unitSystem}
              />
            ) : family === 'volume' ? (
              <VolumeSpheres
                objects={objects}
                attr={attr as 'volume'}
                box={{ width: 740, height: 380 }}
                unitSystem={state.unitSystem}
              />
            ) : (
              <ScaleCanvas
                objects={objects}
                attr={attr as never}
                box={{ width: 740, height: 480 }}
                unitSystem={state.unitSystem}
              />
            )}
            <table className="print-table">
              <thead>
                <tr>
                  <th>Object</th>
                  <th>{ATTRIBUTE_LABELS[attr]}</th>
                  <th>Source / notes</th>
                </tr>
              </thead>
              <tbody>
                {objects.map((o) => {
                  const v = objectValue(o, attr);
                  return (
                    <tr key={o.record.id}>
                      <td>{objectName(o)}</td>
                      <td>{v !== null ? formatAttrValue(attr, v, state.unitSystem) : '—'}</td>
                      <td>
                        {objectSourceLine(o, attr) ?? 'Custom measurement'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {answer && state.showAnswers && (
              <p className="print-answer">
                <strong>Answer:</strong> {answer}
              </p>
            )}
          </>
        )}
        <p className="print-foot">Made with sizecompare.org — true-scale comparisons.</p>
      </div>

      {presenting && attr !== null && (
        <PresentationMode
          title={state.title}
          prompt={state.prompt}
          objects={objects}
          attr={attr}
          unitSystem={state.unitSystem}
          onExit={() => setPresenting(false)}
        />
      )}
    </div>
  );
}
