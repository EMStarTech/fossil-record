/**
 * Fossil Dashboard — Matrix Validation Test Suite: Subset A
 * Locked: March 25, 2026 | Atlas Interaction Test Matrix v1.0.2
 * Audit Hardened: Final Production Audit — March 25, 2026
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { FossilRegistryProvider } from '../../components/FossilRegistry';
import { TraceNode } from '../../components/TraceNode';

vi.useFakeTimers();

const mockTraces = [
  {
    trace_id: 'n1',
    is_deviation: true,
    artifact_type: 'fossil_record',
    stack_type: 'stacked',
    protocol_alignment: 'v7.3',
    temporal_weighting: 8,
    pr_url: 'https://github.com/EMStarTech/fossil-record',
    x: 100,
    y: 100,
  },
  {
    trace_id: 'n2',
    is_deviation: false,
    artifact_type: 'policy_doc',
    stack_type: 'stacked',
    protocol_alignment: 'v7.3',
    temporal_weighting: 5,
    pr_url: 'https://github.com/EMStarTech/fossil-record/pull/2',
    x: 200,
    y: 200,
  },
];

describe('Matrix Subset A: Runtime Verification (Audit Hardened)', () => {

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('T4: should reveal tooltip and CTA exactly at 1500ms boundary', () => {
    render(
      <FossilRegistryProvider traces={[mockTraces[0]]}>
        <TraceNode mappedTrace={mockTraces[0]} />
      </FossilRegistryProvider>
    );

    const node = screen.getByTestId('trace-node');
    fireEvent.mouseEnter(node);

    act(() => { vi.advanceTimersByTime(1499); });
    expect(screen.queryByTestId('fossil-tooltip-container')).not.toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.getByTestId('fossil-tooltip-container')).toBeInTheDocument();
  });

  it('S1: should enforce exactly one active tooltip at any time', () => {
    render(
      <FossilRegistryProvider traces={mockTraces}>
        <TraceNode mappedTrace={mockTraces[0]} />
        <TraceNode mappedTrace={mockTraces[1]} />
      </FossilRegistryProvider>
    );

    const nodes = screen.getAllByTestId('trace-node');

    fireEvent.mouseEnter(nodes[0]);
    act(() => { vi.advanceTimersByTime(1500); });

    fireEvent.mouseLeave(nodes[0]);
    fireEvent.mouseEnter(nodes[1]);
    act(() => { vi.advanceTimersByTime(1500); });

    const tooltips = screen.queryAllByTestId('fossil-tooltip-container');
    expect(tooltips).toHaveLength(1);
  });

  it('R2: should not reveal if cursor leaves before 1500ms', () => {
    render(
      <FossilRegistryProvider traces={[mockTraces[0]]}>
        <TraceNode mappedTrace={mockTraces[0]} />
      </FossilRegistryProvider>
    );

    const node = screen.getByTestId('trace-node');
    fireEvent.mouseEnter(node);
    act(() => { vi.advanceTimersByTime(1400); });
    fireEvent.mouseLeave(node);
    act(() => { vi.advanceTimersByTime(200); });

    expect(screen.queryByTestId('fossil-tooltip-container')).not.toBeInTheDocument();
  });

  it('C1/C2: should trigger window.open with correct URL on click', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <FossilRegistryProvider traces={[mockTraces[0]]}>
        <TraceNode mappedTrace={mockTraces[0]} />
      </FossilRegistryProvider>
    );

    const node = screen.getByTestId('trace-node');
    fireEvent.click(node);

    expect(windowSpy).toHaveBeenCalledWith(
      'https://github.com/EMStarTech/fossil-record',
      '_blank',
      expect.any(String)
    );
    windowSpy.mockRestore();
  });

  it('Surface One: should not leak prohibited Ring 3 terminology', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    render(
      <FossilRegistryProvider traces={[mockTraces[0]]}>
        <TraceNode mappedTrace={mockTraces[0]} />
      </FossilRegistryProvider>
    );

    const node = screen.getByTestId('trace-node');
    fireEvent.mouseEnter(node);
    act(() => { vi.advanceTimersByTime(1500); });

    const html = document.body.innerHTML;
    const prohibited = [
      'DIA Score', 'DIA Scoring Rubric', 'Snoddy Method',
      'Joint Fragility', 'Active Handshake', 'DIA-27',
      'instability', 'risk', 'degradation', 'conflict',
    ];

    prohibited.forEach(term => {
      expect(html).not.toContain(term);
    });

    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Test C3')
    );
    consoleSpy.mockRestore();
  });

});
