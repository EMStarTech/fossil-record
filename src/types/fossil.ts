/**
 * Fossil Dashboard — Type Definitions
 * Updated: March 29, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * FossilTrace = API contract shape. Matches OpenAPI v3.0.1 exactly.
 * MappedTrace = Render model. Extends FossilTrace with UI coordinates.
 * merge_timestamp added per PI lock March 29, 2026.
 *
 * Ring 3 silence: No scoring fields, no fragility index,
 * no derived analytical fields in either type.
 */

export interface FossilTrace {
  trace_id: string;
  artifact_type: string;
  stack_type: string;
  temporal_weighting: number;
  protocol_alignment: string;
  pr_url: string;
  is_deviation: boolean;
  merge_timestamp: string; // ISO-8601 format
}

export interface MappedTrace extends FossilTrace {
  x: number;
  y: number;
}
