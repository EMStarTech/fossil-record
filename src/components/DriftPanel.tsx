import React from 'react';

/**
 * DriftPanel Data Contract
 * Standardized: March 26, 2026
 * Consistency Update: totalActiveCount -> totalActiveSignals
 */
export type DriftPanelSignal = 
  | 'Protocol alignment variance' 
  | 'Weighting pattern deviation' 
  | 'Distribution shift';

export interface DriftPanelData {
  totalActiveSignals: number; // Standardized per Atlas feedback
  activeSignals: DriftPanelSignal[];
}

interface DriftPanelProps {
  data: DriftPanelData;
}

/**
 * DriftPanel Component - Zone 2 / Commit 001
 * Primary Role: Contract anchor and D2 test resolution.
 * Constraint: pointer-events: none (Strict CSS enforcement)
 */
const DriftPanel: React.FC<DriftPanelProps> = ({ data }) => {
  const containerStyle: React.CSSProperties = {
    pointerEvents: 'none',
    display: 'block',
    position: 'absolute',
  };

  return (
    <div 
      data-testid="drift-panel-root" 
      style={containerStyle}
    >
      {/* Task 001: Contract Anchor Only. 
          Task 002 (HOLD): Rendering logic pending Atlas Spec & Claude Gate.
      */}
    </div>
  );
};

export default DriftPanel;
