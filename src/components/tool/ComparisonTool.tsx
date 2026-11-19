/**
 * ComparisonTool — the Size Comparison Maker island.
 *
 * Owns the project state (objects, title, prompt, units, answers),
 * persists to localStorage only, and composes the canvas, editor panels,
 * presentation mode and print sheet. Nothing leaves the browser.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIBRARY_BY_ID } from '../../data/library';
import {
  checkDimensionMix,
  objectDimension,
  objectName,
  objectValueMm,
  type CustomObject,
  type ObjectRecord,
} from '../../lib/objects';
import { computeLayout, assessScale } from '../../lib/scale';
import type { UnitSystem } from '../../lib/units';
import {
  ScaleCanvas,
  buildAnswerSentence,
  formatValue,
  objectVisual,
  MAX_OBJECTS,
} from './ScaleCanvas';
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

interface ProjectState {
  title: string;
  prompt: string;
  unitSystem: UnitSystem;
  showAnswers: boolean;
  libraryIds: string[];
  customs: CustomObject[];
}

const STORAGE_KEY = 'sizecompare:project:v1';

function exampleProject(exampleId: string): ProjectState {
  const ex = EXAMPLES.find((e) => e.id === exampleId) ?? EXAMPLES[0];
  return {
    title: ex.title,
    prompt: ex.prompt,
    unitSystem: 'metric',
    showAnswers: false,
    libraryIds: [...ex.libraryIds],
    customs: [],
  };
}

const EMPTY: ProjectState = {
  title: '',
  prompt: '',
  unitSystem: 'metric',
  showAnswers: false,
  libraryIds: [],
  customs: [],
};

export default function ComparisonTool() {
  const [project, setProject] = useState<ProjectState>(() => exampleProject(EXAMPLES[0].id));
  const [presenting, setPresenting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 800, height: 440 });

  /* restore previous work from localStorage (client only) */
  useEffect(() => {
    track('tool_start');
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as ProjectState;
        if (saved && Array.isArray(saved.libraryIds)) setProject(saved);
      }
    } catch {
      /* corrupted save — start from the example */
    }
  }, []);

  /* persist */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      /* storage full or blocked — the session still works */
    }
  }, [project]);

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
    const lib = project.libraryIds
      .map((id) => LIBRARY_BY_ID[id])
      .filter((r): r is ObjectRecord => Boolean(r))
      .map((record) => ({ kind: 'library' as const, record }));
    const custom = project.customs.map((record) => ({ kind: 'custom' as const, record }));
    return [...lib, ...custom];
  }, [project.libraryIds, project.customs]);

  /* comparison_generated fires when a viewable comparison first exists / changes */
  useEffect(() => {
    if (objects.length >= 2) track('comparison_generated', { count: objects.length });
  }, [objects]);

  const warnings = useMemo(() => {
    const list: { tone: 'warn'; text: string }[] = [];
    if (objects.length < 2) return list;
    const mix = checkDimensionMix(objects.map(objectDimension));
    if (mix.status === 'warn') list.push({ tone: 'warn', text: mix.message });
    const items = objects.map((o) => {
      const v = objectVisual(o);
      return { valueMm: v.valueMm, aspect: v.aspect, axis: v.axis };
    });
    try {
      const layout = computeLayout(items, box, 34, 34);
      const health = assessScale(items.map((i) => i.valueMm), layout.scale);
      if (health.extreme) {
        list.push({
          tone: 'warn',
          text: 'These objects differ so much in size that the smallest one is barely visible — that is honest true scale. Try a closer pair, or discuss why the difference is so huge!',
        });
      }
    } catch {
      /* invalid object values are caught at input time */
    }
    return list;
  }, [objects, box]);

  const answer = buildAnswerSentence(objects, project.unitSystem);
  const atMax = objects.length >= MAX_OBJECTS;

  const addLibrary = useCallback((record: ObjectRecord) => {
    track('object_added', { source: 'library', category: record.category });
    setProject((p) =>
      p.libraryIds.includes(record.id) || p.libraryIds.length + p.customs.length >= MAX_OBJECTS
        ? p
        : { ...p, libraryIds: [...p.libraryIds, record.id] },
    );
  }, []);

  const addCustom = useCallback((custom: CustomObject) => {
    track('object_added', { source: 'custom' });
    setProject((p) =>
      p.libraryIds.length + p.customs.length >= MAX_OBJECTS
        ? p
        : { ...p, customs: [...p.customs, custom] },
    );
  }, []);

  const removeById = useCallback((id: string) => {
    setProject((p) => ({
      ...p,
      libraryIds: p.libraryIds.filter((x) => x !== id),
      customs: p.customs.filter((c) => c.id !== id),
    }));
  }, []);

  function loadExample(id: string) {
    setProject(exampleProject(id));
    setExportError(null);
  }

  async function downloadPng() {
    const svg = document.getElementById('compare-canvas-svg') as SVGSVGElement | null;
    if (!svg) return;
    try {
      const slug =
        (project.title || 'size-comparison')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50) || 'size-comparison';
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

  const selectedItems = objects.map((o) => ({
    id: o.record.id,
    name: objectName(o),
    value_mm: objectValueMm(o),
  }));

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
              disabled={objects.length < 2}
              onClick={startPresentation}
            >
              ▶ Present to class
            </button>
          </div>
        </div>

        <div className="canvas-card" ref={canvasWrapRef}>
          <ScaleCanvas
            objects={objects}
            box={box}
            unitSystem={project.unitSystem}
            svgId="compare-canvas-svg"
          />
        </div>

        {warnings.map((w, i) => (
          <p key={i} className="warn-banner" role="status">
            {w.text}
          </p>
        ))}

        {answer && project.showAnswers && (
          <p className="answer-line" aria-live="polite">
            <strong>Answer:</strong> {answer}
          </p>
        )}

        <ExportPanel canExport={objects.length >= 2} onPng={downloadPng} onPrint={printSheet} />
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
          <SelectedObjects items={selectedItems} onRemove={removeById} max={MAX_OBJECTS} />
        </section>

        <section className="panel">
          <h3>Library</h3>
          <ObjectPicker
            selectedIds={project.libraryIds}
            onAdd={addLibrary}
            disabled={atMax}
          />
        </section>

        <section className="panel">
          <h3>Add your own</h3>
          <CustomObjectForm onAdd={addCustom} disabled={atMax} />
        </section>

        <section className="panel">
          <h3>Lesson</h3>
          <EditorPanel
            title={project.title}
            prompt={project.prompt}
            unitSystem={project.unitSystem}
            showAnswers={project.showAnswers}
            onTitle={(v) => setProject((p) => ({ ...p, title: v }))}
            onPrompt={(v) => setProject((p) => ({ ...p, prompt: v }))}
            onUnitSystem={(v) => setProject((p) => ({ ...p, unitSystem: v }))}
            onShowAnswers={(v) => setProject((p) => ({ ...p, showAnswers: v }))}
          />
        </section>

        <section className="panel">
          <h3>Start over</h3>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setProject(EMPTY);
              setExportError(null);
            }}
          >
            Clear this comparison
          </button>
        </section>
      </aside>

      {/* hidden on screen, shown by print.css on paper */}
      <div className="print-sheet" aria-hidden="true">
        <h2 className="print-title">{project.title || 'Size comparison'}</h2>
        {project.prompt && <p className="print-prompt">{project.prompt}</p>}
        <ScaleCanvas
          objects={objects}
          box={{ width: 740, height: 480 }}
          unitSystem={project.unitSystem}
        />
        <table className="print-table">
          <thead>
            <tr>
              <th>Object</th>
              <th>Measured size</th>
              <th>Dimension</th>
              <th>Source / notes</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((o) => {
              const rec = o.record as ObjectRecord & { source_name?: string };
              return (
                <tr key={rec.id}>
                  <td>{objectName(o)}</td>
                  <td>{formatValue(objectValueMm(o), project.unitSystem)}</td>
                  <td>{rec.dimension_type}</td>
                  <td>
                    {o.kind === 'library'
                      ? `${rec.source_name} — ${rec.measurement_context}`
                      : 'Custom measurement'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {answer && project.showAnswers && (
          <p className="print-answer">
            <strong>Answer:</strong> {answer}
          </p>
        )}
        <p className="print-foot">Made with sizecompare.org — true-scale visual comparisons for teaching.</p>
      </div>

      {presenting && (
        <PresentationMode
          title={project.title}
          prompt={project.prompt}
          objects={objects}
          unitSystem={project.unitSystem}
          onExit={() => setPresenting(false)}
        />
      )}
    </div>
  );
}
