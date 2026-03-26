/**
 * Fossil Dashboard — TraceNode Component
 * Commit 3 Update — March 25, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * Hover state consumed exclusively through FossilRegistryProvider context.
 * Single control path per Atlas decision.
 * data-testid attributes locked for Atlas Matrix test stability.
 * Ring 3 silence: No scoring fields, no derived metrics.
 */

import React, { useCallback, memo } from 'react';
import { useDwellTimer } from '../hooks/useDwellTimer';
import { calculateNodeRadius } from '../utils/geometry';
import { validateAndNavigate } from '../utils/navigation';
import { useFossilRegistry } from './FossilRegistry';
import { CTA_COPY } from '../constants/ui';
import type { MappedTrace } from '../types/fossil';

interface TraceNodeProps {
  mappedTrace: MappedTrace;
}

export const TraceNode: React.FC<TraceNodeProps> = memo(({ mappedTrace }) => {
  const { activeNodeId, setActiveNodeId } = useFossilRegistry();
  const isActive = activeNodeId === mappedTrace.trace_id;
  const radius = calculateNodeRadius(mappedTrace.temporal_weighting);

  const onComplete = useCallback(() => {
    setActiveNodeId(mappedTrace.trace_id);
  }, [mappedTrace.trace_id, setActiveNodeId]);

  const { start, cancel } = useDwellTimer(onComplete);

  const handleMouseEnter = useCallback(() => { start(); }, [start]);

  const handleMouseLeave = useCallback(() => {
    cancel();
    setActiveNodeId(null);
  }, [cancel, setActiveNodeId]);

  const handleClick = useCallback(() => {
    validateAndNavigate(mappedTrace.pr_url);
  }, [mappedTrace.pr_url]);

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-testid="trace-node"
      aria-label={`${mappedTrace.artifact_type} - ${mappedTrace.stack_type}`}
      style={{ cursor: mappedTrace.pr_url ? 'pointer' : 'default' }}
    >
      <circle
        className={`fossil-node${mappedTrace.is_deviation ? ' fossil-node--deviation' : ''}`}
        cx={mappedTrace.x}
        cy={mappedTrace.y}
        r={radius}
      />
      {isActive && (
        <foreignObject
          x={mappedTrace.x + radius + 4}
          y={mappedTrace.y - 32}
          width={160}
          height={80}
          data-testid="fossil-tooltip-container"
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: 'var(--color-bg-primary)',
            border: '0.5px solid var(--color-border-default)',
            borderRadius: 'var(--border-radius-md)',
            padding: '6px 10px',
            fontSize: '11px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
          }}>
            <div>{mappedTrace.artifact_type}</div>
            <div>{mappedTrace.stack_type}</div>
            <div>{mappedTrace.protocol_alignment}</div>
            {mappedTrace.is_deviation && (
              <div style={{
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: '0.5px solid var(--color-border-default)',
                color: 'var(--color-upgrade-text)',
                fontSize: '10px',
              }}>
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
