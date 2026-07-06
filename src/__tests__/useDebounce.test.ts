import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("a"); // still old value
  });

  it("updates after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("b");
  });

  it("only keeps the last value in a rapid burst", () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 300),
      { initialProps: { v: "a" } }
    );
    rerender({ v: "b" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ v: "c" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ v: "d" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("d"); // b and c were cancelled
  });
});
