/**
 * Fossil Dashboard — FossilRegistryProvider & TraceNode
 * Locked: March 24, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * FossilRegistryProvider is the single source of truth for trace data.
 * TraceNode is a purely functional display component.
 * Neither component derives meaning from the data it receives.
 * Observation without interpretation is enforced by construction.
 *
 * Ring 3 silence: No scoring fields, no derived metrics,
 * no interpretive language in any prop, state, or rendered output.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { useDwellTimer } from '../hooks/useDwellTimer';
import { validateAndNavigate } from '../utils/navigation';
import { NODE_DIAMETER, DEVIATION_RING_WIDTH, CTA_COPY } from '../constants/ui';

export interface FossilTrace {
  trace_id: string;
  artifact_type: string;
  stack_type: string;
  temporal_weighting: number;
  protocol_alignment: string;
  pr_url: string;
  is_deviation: boolean;
}

interface FossilRegistryContextValue {
  traces: FossilTrace[];
  activeNodeId: string | null;
  setActiveNodeId: (id: string | null) => void;
  isLoading: boolean;
}

const FossilRegistryContext = createContext<FossilRegistryContextValue | null>(null);

export const useFossilRegistry = (): FossilRegistryContextValue => {
  const ctx = useContext(FossilRegistryContext);
  if (!ctx) throw new Error('useFossilRegistry must be used within FossilRegistryProvider');
  return ctx;
};

interface FossilRegistryProviderProps {
  children: React.ReactNode;
  startDate?: string;
  endDate?: string;
}

export const FossilRegistryProvider: React.FC<FossilRegistryProviderProps> = ({
  children,
  startDate,
  endDate,
}) => {
  const [traces, setTraces] = useState<FossilTrace[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const url = `/v1/traces/summary${params.toString() ? '?' + params.toString() : ''}`;
    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data: FossilTrace[]) => setTraces(data))
      .catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Fossil Dashboard] Failed to fetch traces:', err);
        }
      })
      .finally(() => setIsLoading(false));
  }, [startDate, endDate]);

  return (
    <FossilRegistryContext.Provider
      value={{ traces, activeNodeId, setActiveNodeId, isLoading }}
    >
      {children}
    </FossilRegistryContext.Provider>
  );
};

const getNodeDiameter = (tw: number): number => {
  if (tw >= 8) return NODE_DIAMETER.HIGH;
  if (tw >= 4) return NODE_DIAMETER.MODERATE;
  return NODE_DIAMETER.LOW;
};

interface TraceNodeProps {
  trace: FossilTrace;
  cx: number;
  cy: number;
}

export const TraceNode: React.FC<TraceNodeProps> = memo(({ trace, cx, cy }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { setActiveNodeId } = useFossilRegistry();

  const diameter = getNodeDiameter(trace.temporal_weighting);
  const radius = diameter / 2;

  const handleDwellComplete = useCallback(() => {
    setShowTooltip(true);
    setActiveNodeId(trace.trace_id);
  }, [trace.trace_id, setActiveNodeId]);

  const { start, cancel } = useDwellTimer(handleDwellComplete);

  const handleMouseEnter = useCallback(() => { start(); }, [start]);

  const handleMouseLeave = useCallback(() => {
    cancel();
    setShowTooltip(false
