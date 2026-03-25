/**
 * Fossil Dashboard — useDwellTimer Hook
 * Locked: March 24, 2026 | PI Decision | Snoddy Method v7.3
 *
 * Gates both tooltip visibility and dynamic CTA appearance.
 * Timer is node-specific and cancels immediately on mouseleave.
 * No ghost tooltips. No partial carryover between nodes.
 */

import { useRef, useCallback } from 'react';
import { DWELL_TIMER_MS } from '../constants/ui';

interface UseDwellTimerReturn {
  start: () => void;
  cancel: () => void;
}

export const useDwellTimer = (onComplete: () => void): UseDwellTimerReturn => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onComplete();
    }, DWELL_TIMER_MS);
  }, [cancel, onComplete]);

  return { start, cancel };
};
