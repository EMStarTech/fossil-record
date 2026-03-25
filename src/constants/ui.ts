/**
 * Fossil Dashboard — UI Constants
 * Locked: March 24, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * DWELL_TIMER_MS is a locked PI decision.
 * Do not modify without PI authorization and triadic review.
 * Do not inline this value anywhere in component code.
 * Reference this constant exclusively.
 */

/**
 * Dwell timer threshold in milliseconds.
 * Locked at 1500ms per PI Decision March 24, 2026.
 * Gates both tooltip visibility and dynamic CTA appearance.
 * Applied per-node. Canceled immediately on mouseleave.
 */
export const DWELL_TIMER_MS = 1500;

/**
 * Node diameter tiers — mapped to temporal_weighting ranges.
 * Size implies weight. No numeric label on production nodes.
 */
export const NODE_DIAMETER = {
  HIGH: 42,       // TW 8 to 10
  MODERATE: 28,   // TW 4 to 7
  LOW: 14,        // TW 1 to 3
} as const;

/**
 * Deviation ring width in pixels.
 * Locked at 3px per UI Component Token List.
 */
export const DEVIATION_RING_WIDTH = 3;

/**
 * CTA copy — locked. Three placements only.
 * Do not modify. Do not elaborate.
 * Any change requires PI authorization.
 */
export const CTA_COPY = "Full analysis available in Triadic Fossil." as const;

/**
 * Zero state strings — neutral, never empty, never broken.
 */
export const ZERO_STATE = {
  NO_DATA:      "No reasoning traces recorded in this period.",
  NO_DRIFT:     "No drift signals active this period.",
  LOW_ACTIVITY: "Limited activity recorded in this period.",
} as const;
