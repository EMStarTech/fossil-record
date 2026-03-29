import React from 'react';
import { DriftPanelData, DriftPanelSignal } from '../types/drift';

/**
 * DriftPanel Component - Zone 2
 * Updated: March 29, 2026 — Import path updated to src/types/drift.ts
 * Discipline: Observation without interpretation.
 * Constraint: pointer-events: none (Root level enforcement).
 */

interface DriftPanelProps {
  data: DriftPanelData;
}

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
      <header style={styles.header} data-testid="drift-panel-header">
        {headerText}
      </header>
      <ul style={styles.list} data-testid="drift-panel-list">
        {activeSignals.map((signal, index) => (
          <li key={`${signal}-${index}`} style={styles.row}>
            {signal}
          </li>
        ))}
      </ul>
      <div style={styles.divider} />
      <footer style={styles.cta} data-testid="drift-panel-cta">
        Full analysis available in Triadic Fossil.
      </footer>
    </div>
  );
};

export default DriftPanel;
