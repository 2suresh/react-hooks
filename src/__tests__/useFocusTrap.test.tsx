import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

function Dialog({ onEscape }: { onEscape?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useFocusTrap<HTMLDivElement>(open, {
    onEscape: () => { onEscape?.(); setOpen(false); },
  });
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <div ref={ref} role="dialog" aria-modal="true">
          <button>First</button>
          <button>Middle</button>
          <button>Last</button>
        </div>
      )}
    </div>
  );
}

describe("useFocusTrap", () => {
  afterEach(cleanup);

  it("moves focus into the container when activated", () => {
    render(<Dialog />);
    fireEvent.click(screen.getByText("Open"));
    expect(document.activeElement).toBe(screen.getByText("First"));
  });

  it("cycles Tab from the last element back to the first", () => {
    render(<Dialog />);
    fireEvent.click(screen.getByText("Open"));
    screen.getByText("Last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("First"));
  });

  it("cycles Shift+Tab from the first element back to the last", () => {
    render(<Dialog />);
    fireEvent.click(screen.getByText("Open"));
    screen.getByText("First").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("Last"));
  });

  it("calls onEscape when Escape is pressed", () => {
    const onEscape = vi.fn();
    render(<Dialog onEscape={onEscape} />);
    fireEvent.click(screen.getByText("Open"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("restores focus to the trigger when deactivated", () => {
    render(<Dialog />);
    const trigger = screen.getByText("Open");
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByText("First"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });
});
