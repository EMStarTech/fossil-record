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

/* ─────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────── */

export interface FossilTrace {
  trace_id: string;
  artifact_type: string;
  stack_type: string;
  temporal_weighting: number;   // 1 to 10
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

/* ─────────────────────────────────────────
 * CONTEXT
 * ───────────────────────────────────────── */

const FossilRegistryContext = createContext<FossilRegistryContextValue | null>(null);

export const useFossilRegistry = (): FossilRegistryContextValue => {
  const ctx = useContext(FossilRegistryContext);
  if (!ctx) throw new Error('useFossilRegistry must be used within FossilRegistryProvider');
  return ctx;
};

/* ─────────────────────────────────────────
 * PROVIDER
 * Fetches traces from /v1/traces/summary.
 * Holds activeNodeId for hover state management.
 * ───────────────────────────────────────── */

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

/* ─────────────────────────────────────────
 * NODE DIAMETER HELPER
 * Size implies temporal weight.
 * No numeric label rendered on production nodes.
 * ───────────────────────────────────────── */

const getNodeDiameter = (tw: number): number => {
  if (tw >= 8) return NODE_DIAMETER.HIGH;
  if (tw >= 4) return NODE_DIAMETER.MODERATE;
  return NODE_DIAMETER.LOW;
};

/* ─────────────────────────────────────────
 * TRACE NODE
 * Purely functional SVG component.
 * Receives all visual and navigational data via props.
 * No internal state beyond dwell timer and tooltip visibility.
 *
 * Atlas Test Matrix conditions satisfied:
 * H1 — Standard hover: tooltip on dwell complete
 * H2 — Deviation hover: tooltip + dynamic CTA on dwell complete
 * H3 — Early exit: cancel() on mouseleave
 * H4 — Re-entry: start() clears prior timer, restarts from zero
 * C1 — Standard click: validateAndNavigate to pr_url
 * C2 — Deviation click: same, CTA separate from click
 * C3 — Null pr_url: validateAndNavigate suppresses silently
 * ───────────────────────────────────────── */

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

  const handleMouseEnter = useCallback(() => {
    start();
  }, [start]);

  const handleMouseLeave = useCallback(() => {
    cancel();
    setShowTooltip(false);
    setActiveNodeId(null);
  }, [cancel, setActiveNodeId]);

  const handleClick = useCallback(() => {
    validateAndNavigate(trace.pr_url);
  }, [trace.pr_url]);

  // Node fill color based on protocol alignment
  // Color encodes protocol alignment. Size encodes temporal weight.
  // Deviation state encoded by amber ring only — not by fill color change.
  const fillColor = trace.protocol_alignment.includes('v1.0.1')
    ? 'var(--color-fn-aligned)'
    : trace.temporal_weighting <= 3
    ? 'var(--color-fn-low-weight)'
    : 'var(--color-fn-prior)';

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: trace.pr_url ? 'pointer' : 'default' }}
      aria-label={`${trace.artifact_type} — ${trace.stack_type}`}
    >
      {/* Base node circle */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke={trace.is_deviation ? 'var(--color-fn-deviation)' : 'none'}
        strokeWidth={trace.is_deviation ? DEVIATION_RING_WIDTH : 0}
      />

      {/* Tooltip — categorical data only. No temporal weight numeric. */}
      {showTooltip && (
        <foreignObject
          x={cx + radius + 4}
          y={cy - 32}
          width={160}
          height={80}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'var(--color-bg-primary)',
              border: '0.5px solid var(--color-border-default)',
              borderRadius: 'var(--border-radius-md)',
              padding: '6px 10px',
              fontSize: '11px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
            }}
          >
            <div>{trace.artifact_type}</div>
            <div>{trace.stack_type}</div>
            <div>{trace.protocol_alignment}</div>

            {/* Dynamic CTA — deviation nodes only, post-dwell only */}
            {trace.is_deviation && (
              <div
                style={{
                  marginTop: '6px',
                  paddingTop: '6px',
                  borderTop: '0.5px solid var(--color-border-default)',
                  color: 'var(--color-upgrade-text)',
                  fontSize: '10px',
                }}
              >
                {CTA_COPY}
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
});

TraceNode.displayName = 'TraceNode';
