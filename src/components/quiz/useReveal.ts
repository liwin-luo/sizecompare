/**
 * useReveal — rAF-driven 0→1 progress for the quiz answer animation.
 *
 * Returns 0 while `revealing` is false. When it flips true the value
 * eases (easeOutCubic) from 0 to 1 over `durationMs` and stays at 1.
 * Honors prefers-reduced-motion by jumping straight to 1.
 */

import { useEffect, useState } from 'react';

export function useReveal(revealing: boolean, durationMs = 900): number {
  const [progress, setProgress] = useState(revealing ? 1 : 0);

  useEffect(() => {
    if (!revealing) {
      setProgress(0);
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || durationMs <= 0) {
      setProgress(1);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const linear = Math.min((now - start) / durationMs, 1);
      setProgress(1 - Math.pow(1 - linear, 3));
      if (linear < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revealing, durationMs]);

  return progress;
}
