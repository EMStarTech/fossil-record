/**
 * Fossil Dashboard — useDwellTimer Hook
 * Locked: March 24, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * This hook enforces the 1.5 second intentional dwell requirement.
 * It gates both tooltip visibility and dynamic CTA appearance.
 * Timer is node-specific and cancels immediately on mouseleave.
 * No ghost tooltips. No partial carryover between nodes.
 *
 * Atlas Test Matrix conditions satisfied:
 * H3 — Early exit before dwell: cancel() on mouseleave
 * H4 — Re-entry after canceled dwell: start() clears prior timer
 * R1 — Rapid sweep no dwell: cancel() fires before onComplete
 * R2 — Rapid sweep ending on deviation: only final node completes
 */

import { useRef, useCallback } from 'react';
import { DWELL_TIMER_MS } from '../constants/ui';

interface UseDwellTimerReturn {
  start: () => void;
  cancel: () => void;
}

/**
 * Manages a dwell timer for intentional hover detection.
 * @param onComplete - Callback fired only when dwell completes
 *                     while pointer is still on the same node.
 */
export const useDwellTimer = (onComplete: () => void): UseDwellTimerReturn => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // Cancel any existing timer before starting a new one.
    // This prevents overlap on rapid re-entry (Test H4).
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onComplete();
    }, DWELL_TIMER_MS);
  }, [cancel, onComplete]);

  return { start, cancel };
};
