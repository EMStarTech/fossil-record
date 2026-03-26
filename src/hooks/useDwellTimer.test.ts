/**
 * Fossil Dashboard — useDwellTimer Behavioral Test
 * Test ID: UT-DWELL-01
 * Locked: March 25, 2026 | Atlas Interaction Test Matrix v1.0.2
 */

import { renderHook, act } from '@testing-library/react';
import { useDwellTimer } from './useDwellTimer';

vi.useFakeTimers();

describe('UT-DWELL-01: useDwellTimer Behavioral Logic', () => {

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should not fire before 1500ms', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDwellTimer(onComplete));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1449); });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should fire exactly once at 1500ms', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDwellTimer(onComplete));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1500); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should never fire if cancelled at 1000ms', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDwellTimer(onComplete));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { result.current.cancel(); });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('should restart timer from zero on re-entry after cancel', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDwellTimer(onComplete));
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { result.current.cancel(); });
    act(() => { result.current.start(); });
    act(() => { vi.advanceTimersByTime(1499); });
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

});
