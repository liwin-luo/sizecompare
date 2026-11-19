/**
 * Presentation mode — the classroom projection view.
 *
 * Fullscreen, huge type, no editing chrome. The teacher's question sits
 * under the canvas with a Reveal button so answers stay hidden until the
 * class has discussed the comparison.
 */

import { useEffect, useRef, useState } from 'react';
import type { ComparisonObject } from '../../lib/objects';
import type { UnitSystem } from '../../lib/units';
import { ScaleCanvas, buildAnswerSentence } from './ScaleCanvas';

export function PresentationMode({
  title,
  prompt,
  objects,
  unitSystem,
  onExit,
}: {
  title: string;
  prompt: string;
  objects: ComparisonObject[];
  unitSystem: UnitSystem;
  onExit: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [box, setBox] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    const el = rootRef.current;
    if (el && !document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {
        /* overlay still works without fullscreen permission */
      });
    }
    const onFsChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    document.addEventListener('keydown', onKey);

    const resize = () => {
      setBox({
        width: Math.max(640, window.innerWidth - 96),
        height: Math.max(360, Math.min(620, window.innerHeight * 0.52)),
      });
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resize);
    };
  }, [onExit]);

  const answer = buildAnswerSentence(objects, unitSystem);

  return (
    <div className="presentation" ref={rootRef}>
      <div className="presentation-inner">
        <h2 className="presentation-title">{title || 'Size comparison'}</h2>
        <div className="presentation-canvas">
          <ScaleCanvas objects={objects} box={box} unitSystem={unitSystem} large showSources={false} />
        </div>
        <div className="presentation-bottom">
          {prompt && <p className="presentation-prompt">{prompt}</p>}
          <div className="presentation-actions">
            {answer && !revealed && (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setRevealed(true)}>
                Reveal answer
              </button>
            )}
            {answer && revealed && (
              <p className="presentation-answer" aria-live="polite">
                {answer}
              </p>
            )}
            <button type="button" className="btn btn-ghost" onClick={onExit}>
              Exit (Esc)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
