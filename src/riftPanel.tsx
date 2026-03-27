import React from 'react';

/**
 * DriftPanel Type Definitions
 * Locked Canonical Signal Names - Atlas Spec / Ring 3 Boundary
 */
export type DriftPanelSignal = 
  | 'Protocol alignment variance' 
  | 'Weighting pattern deviation' 
  | 'Distribution shift';

export interface DriftPanelData {
  totalActiveSignals: number;
  activeSignals: DriftPanelSignal[];
}

interface DriftPanelProps {
  data: DriftPanelData;
}

/**
 * DriftPanel Component - Zone 2 / Task 002 Final Implementation
 * Discipline: Observation without interpretation.
 * Compliance: Standardized CSS tokens from fossil-theme.css.
 */
const DriftPanel: React.FC<DriftPanelProps> = ({ data }) => {
  const { totalActiveSignals, activeSignals } = data;

  const styles = {
    container: {
      pointerEvents: 'none' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '12px',
      background: 'var(--color-bg-secondary)',
      border: '0.5px solid var(--color-border-default)',
      color: 'var(--color-text-primary)',
      width: '280px',
    },
    header: {
      fontSize: '12px',
      marginBottom: '8px',
      color: 'var(--color-text-secondary)',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: '8px 0',
    },
    row: {
      fontSize: '11px',
      padding: '4px 0',
      borderBottom: '0.5px solid var(--color-border-default)',
      fontWeight: 'normal' as const,
      color: 'var(--color-text-primary)',
    },
    divider: {
      height: '1px',
      background: 'var(--color-border-default)',
      margin: '12px 0 8px 0',
    },
    cta: {
      fontSize: '10px',
      color: 'var(--color-upgrade-text)',
      fontStyle: 'italic' as const,
    }
  };

  const headerText = totalActiveSignals > 0
    ? `${totalActiveSignals} active drift signal${totalActiveSignals > 1 ? 's' : ''}`
    : 'No drift signals active this period.';

  return (
    <div style={styles.container} data-testid="drift-panel-root">
      
      {/* Section 1: Header */}
      <header style={styles.header} data-testid="drift-panel-header">
        {headerText}
      </header>

      {/* Section 2: Semantic Signal List */}
      <ul style={styles.list} data-testid="drift-panel-list">
        {activeSignals.map((signal, index) => (
          <li key={`${signal}-${index}`} style={styles.row}>
            {signal}
          </li>
        ))}
      </ul>

      {/* Section 3: Divider + Locked CTA */}
      <div style={styles.divider} />
      <footer style={styles.cta} data-testid="drift-panel-cta">
        Full analysis available in Triadic Fossil.
      </footer>

    </div>
  );
};

export default DriftPanel;
