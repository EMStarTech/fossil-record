import { NODE_DIAMETER } from '../constants/ui';

/**
 * Fossil Dashboard — Geometry Utility
 * Locked: March 25, 2026 | PI Decision | Snoddy Method v7.3
 *
 * Maps temporal_weighting (1-10) to a deterministic SVG radius.
 * No hardcoded values. All sizing derived from NODE_DIAMETER constants.
 */

export const calculateNodeRadius = (weight: number): number => {
  const safeWeight = Math.max(1, Math.min(10, weight));
  if (safeWeight >= 8) return NODE_DIAMETER.HIGH / 2;
  if (safeWeight >= 4) return NODE_DIAMETER.MODERATE / 2;
  return NODE_DIAMETER.LOW / 2;
};
