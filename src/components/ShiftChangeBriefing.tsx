import React, { useMemo } from 'react';
import { FossilTrace } from '../types/fossil';
import { computeShiftChangeBriefingData } from '../utils/briefing';
import '../styles/ShiftChangeBriefing.css';

/**
 * Fossil Dashboard — ShiftChangeBriefing Component
 * Created: March 29, 2026 | PI Decision | Snoddy Method v7.3
 *
 * GOVERNANCE NOTE:
 * Display-only operational read-in surface for shift handoff context.
 * Second static CTA placement in the three-CTA architecture.
 * Observation without interpretation enforced by construction.
 * pointer-events: none enforced via .shift-briefing-root CSS class.
 *
 * PI-Locked display fields: artifact_type, stack_type,
 * protocol_alignment, merge_timestamp.
 *
 * Not rendered: trace_id, pr_url, temporal_weighting, is_deviation.
 *
 * Ring 3 silence: No prohibited terminology in any rendered output.
 */

interface ShiftChangeBriefingProps {
  traces: FossilTrace[];
}

const ShiftChangeBriefing: React.FC<ShiftChangeBriefingProps> = ({ traces }) => {
  const data = useMemo(() => computeShiftChangeBriefingData(traces), [traces]);

  return (
    <section className="shift-briefing-root" data-testid="shift-briefing-root">
      <header className="shift-briefing-header" data-testid="shift-briefing-header">
        <h3 className="fossil-heading-small">Shift-Change Briefing</h3>
        <span className="fossil-text-secondary">
          Recent trace activity for handoff review
        </span>
      </header>

      <div className="shift-briefing-content" data-testid="shift-briefing-content">
        {data.isEmpty ? (
          <p className="fossil-text-muted">
            No recent trace activity available for briefing.
          </p>
        ) : (
          <>
            <div className="fossil-text-mono">
              Last recorded trace: {data.lastUpdatedLabel}
            </div>
            <ul
              className="fossil-list-clean"
              data-testid="shift-briefing-signals"
            >
              {data.briefingItems.map((item, i) => (
                <li
                  key={`${item.time}-${i}`}
                  className="fossil-list-item-briefing"
                >
                  {item.time} | {item.type} | {item.stack} | {item.protocol}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <footer className="shift-briefing-cta" data-testid="shift-briefing-cta">
        <div className="fossil-cta-locked">
          Full analysis available in Triadic Fossil.
        </div>
      </footer>
    </section>
  );
};

export default ShiftChangeBriefing;
