import { FossilTrace } from '../types/fossil';

/**
 * Fossil Dashboard — Shift-Change Briefing Presentation Helper
 * Created: March 29, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * This is a display formatting layer only. No signal computation.
 * No inference. No scoring. No ranking beyond simple recency ordering.
 * Extracts only PI-approved display fields from FossilTrace.
 *
 * PI-Locked display fields: March 29, 2026
 *   artifact_type, stack_type, protocol_alignment, merge_timestamp
 *
 * Not rendered: trace_id, pr_url, temporal_weighting, is_deviation
 *
 * Ring 3 silence: No prohibited terminology in any output field.
 */

export interface BriefingItem {
  type: string;
  stack: string;
  protocol: string;
  time: string;
}

export interface BriefingDisplayData {
  lastUpdatedLabel: string;
  recentItemCount: number;
  briefingItems: BriefingItem[];
  isEmpty: boolean;
}

/**
 * Formats raw FossilTrace[] into a display-safe briefing summary.
 * Sorts by recency. Limits to 5 most recent items.
 * Returns deterministic zero-state if no traces present.
 */
export function computeShiftChangeBriefingData(traces: FossilTrace[]): BriefingDisplayData {
  if (!traces || traces.length === 0) {
    return {
      lastUpdatedLabel: '',
      recentItemCount: 0,
      briefingItems: [],
      isEmpty: true,
    };
  }

  const sorted = [...traces].sort((a, b) =>
    new Date(b.merge_timestamp).getTime() - new Date(a.merge_timestamp).getTime()
  );

  const recent = sorted.slice(0, 5);

  return {
    lastUpdatedLabel: recent[0]?.merge_timestamp || '',
    recentItemCount: recent.length,
    isEmpty: false,
    briefingItems: recent.map(t => ({
      type: t.artifact_type,
      stack: t.stack_type,
      protocol: t.protocol_alignment,
      time: t.merge_timestamp,
    })),
  };
}
