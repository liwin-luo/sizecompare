/**
 * Aggregate analytics events only — no PII, no input values, no student
 * data. Events fire through GA4's gtag when (and only when) a measurement
 * ID is configured in site.config.ts.
 */

type EventName =
  | 'tool_start'
  | 'object_added'
  | 'comparison_generated'
  | 'export_png'
  | 'print_started'
  | 'presentation_started'
  | 'quiz_start'
  | 'quiz_answer'
  | 'quiz_round_end'
  | 'quiz_share';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}
