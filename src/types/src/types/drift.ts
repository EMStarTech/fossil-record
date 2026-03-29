/**
 * Fossil Dashboard — Canonical Drift Types
 * Created: March 29, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * Moved from DriftPanel.tsx per Atlas recommendation.
 * This is the single source of truth for drift-related types.
 * DriftPanel.tsx and signals.ts both import from here.
 * No scoring fields. No severity fields. No threshold values.
 *
 * Ring 3 silence: Canonical signal names are observational only.
 * They describe presence, not significance.
 */

export type DriftPanelSignal =
  | 'Protocol alignment variance'
  | 'Weighting pattern deviation'
  | 'Distribution shift';

export interface DriftPanelData {
  totalActiveSignals: number;
  activeSignals: DriftPanelSignal[];
}
