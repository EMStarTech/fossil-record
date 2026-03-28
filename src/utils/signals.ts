import { FossilTrace } from '../types/fossil';
import { DriftPanelData, DriftPanelSignal } from '../components/DriftPanel';

/**
 * Fossil Dashboard — Signal Computation Layer
 * Locked: March 27, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * This is the only layer permitted to derive drift signals.
 * All threshold math is internal. No values leak into DriftPanelData.
 * Canonical signal names and order are locked by PI decision.
 *
 * PI-Locked Signal Rules:
 * Signal A — Protocol alignment variance:
 *   More than one distinct protocol_alignment in current window
 *   AND minority value appears in at least 2 traces.
 * Signal B — Weighting pattern deviation:
 *   |avg(current) - avg(baseline)| > 3.0
 * Signal C — Distribution shift:
 *   Any artifact_type or stack_type >= 60% in current window
 *   AND < 40% in baseline window (calculated per field independently).
 *
 * Window definitions:
 *   Current: last 10 traces by merge_timestamp
 *   Baseline: traces 11-20 by merge_timestamp
 *
 * Cold-start rule:
 *   Fewer than 20 traces returns zero-state immediately.
 *
 * NOTE: DriftPanelData and DriftPanelSignal should be moved to
 * src/types/drift.ts in a follow-up commit per Atlas recommendation.
 */

/**
 * Signal A: Protocol alignment variance
 * More than one distinct protocol_alignment value exists in the
 * current window AND the minority value appears in at least 2 traces.
 */
const detectProtocolVariance = (current: FossilTrace[]): boolean => {
  const counts: Record<string, number> = {};
  current.forEach(t => {
    counts[t.protocol_alignment] = (counts[t.protocol_alignment] || 0) + 1;
  });
  const values = Object.values(counts);
  if (values.length <= 1) return false;
  return Math.min(...values) >= 2;
};

/**
 * Signal B: Weighting pattern deviation
 * Absolute difference between average temporal_weighting in
 * current window and baseline window is greater than 3.0.
 */
const detectWeightingDeviation = (current: FossilTrace[], baseline: FossilTrace[]): boolean => {
  const avg = (arr: FossilTrace[]) =>
    arr.reduce((acc, t) => acc + t.temporal_weighting, 0) / arr.length;
  return Math.abs(avg(current) - avg(baseline)) > 3.0;
};

/**
 * Signal C: Distribution shift
 * Any single artifact_type or stack_type represents >= 60% of
 * traces in the current window AND < 40% in the baseline window.
 * Frequencies calculated per field independently to avoid pool mixing.
 */
const detectDistributionShift = (current: FossilTrace[], baseline: FossilTrace[]): boolean => {
  const getFreq = (arr: FossilTrace[], key: 'artifact_type' | 'stack_type') => {
    const counts: Record<string, number> = {};
    arr.forEach(t => {
      const val = t[key];
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(counts).map(([k, v]) => [k, v / arr.length])
    );
  };

  for (const key of ['artifact_type', 'stack_type'] as const) {
    const curr = getFreq(current, key);
    const base = getFreq(baseline, key);
    if (Object.keys(curr).some(type => curr[type] >= 0.6 && (base[type] || 0) < 0.4)) {
      return true;
    }
  }
  return false;
};

/**
 * Core Computation Utility
 * Windowing → Detection → Canonical Ordering → Sanitized Output
 */
export function computeDriftPanelData(traces: FossilTrace[]): DriftPanelData {
  // Cold-start: minimum 20 traces required for baseline comparison
  if (traces.length < 20) {
    return { totalActiveSignals: 0, activeSignals: [] };
  }

  // Sort descending by merge_timestamp
  const sorted = [...traces].sort((a, b) => b.merge_timestamp - a.merge_timestamp);
  const currentWindow = sorted.slice(0, 10);
  const baselineWindow = sorted.slice(10, 20);

  const activeSignals: DriftPanelSignal[] = [];

  // Canonical order: Protocol → Weighting → Distribution
  if (detectProtocolVariance(currentWindow)) {
    activeSignals.push('Protocol alignment variance');
  }
  if (detectWeightingDeviation(currentWindow, baselineWindow)) {
    activeSignals.push('Weighting pattern deviation');
  }
  if (detectDistributionShift(currentWindow, baselineWindow)) {
    activeSignals.push('Distribution shift');
  }

  return {
    totalActiveSignals: activeSignals.length,
    activeSignals,
  };
}
