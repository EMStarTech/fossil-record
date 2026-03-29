import { FossilTrace } from '../types/fossil';
import { DriftPanelData, DriftPanelSignal } from '../types/drift';

/**
 * Fossil Dashboard — Signal Computation Layer
 * Updated: March 29, 2026 — Import path updated to src/types/drift.ts
 * PI-Locked Signal Rules: March 27, 2026
 *
 * GOVERNANCE NOTE:
 * This is the only layer permitted to derive drift signals.
 * All threshold math is internal. No values leak into DriftPanelData.
 * Canonical signal names and order are locked by PI decision.
 *
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

const detectWeightingDeviation = (current: FossilTrace[], baseline: FossilTrace[]): boolean => {
  const avg = (arr: FossilTrace[]) =>
    arr.reduce((acc, t) => acc + t.temporal_weighting, 0) / arr.length;
  return Math.abs(avg(current) - avg(baseline)) > 3.0;
};

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

export function computeDriftPanelData(traces: FossilTrace[]): DriftPanelData {
  if (traces.length < 20) {
    return { totalActiveSignals: 0, activeSignals: [] };
  }

  const sorted = [...traces].sort((a, b) =>
    new Date(b.merge_timestamp).getTime() - new Date(a.merge_timestamp).getTime()
  );
  const currentWindow = sorted.slice(0, 10);
  const baselineWindow = sorted.slice(10, 20);

  const activeSignals: DriftPanelSignal[] = [];

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
