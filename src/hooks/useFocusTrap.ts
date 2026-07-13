import { useCallback, useEffect, useRef } from "react";

/**
 * Selector for elements that are normally keyboard-focusable.
 * We exclude anything explicitly removed from the tab order (tabindex="-1")
 * and disabled controls, which are focusable in markup but not in practice.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Filters out elements that exist in the DOM but aren't actually reachable.
 *
 * Deliberately style-based rather than layout-based: checking `offsetParent`
 * or `getClientRects()` would be simpler, but those depend on a layout engine,
 * so they report *everything* as hidden in environments that don't compute
 * layout (jsdom, SSR-adjacent test setups). Walking computed styles works
 * consistently in real browsers and test environments alike.
 */
function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute("inert") || el.hasAttribute("hidden")) return false;

  let node: HTMLElement | null = el;
  while (node) {
    const style = getComputedStyle(node);
    if (style.display === "none") return false;
    if (style.visibility === "hidden" || style.visibility === "collapse") {
      return false;
    }
    node = node.parentElement;
  }
  return true;
}

export interface UseFocusTrapOptions {
  /** Called when Escape is pressed inside the trap. Omit to disable Escape handling. */
  onEscape?: () => void;
  /**
   * Restore focus to whatever was focused before the trap activated.
   * @default true
   */
  restoreFocus?: boolean;
  /**
   * Move focus into the container when the trap activates.
   * @default true
   */
  autoFocus?: boolean;
}

/**
 * Traps keyboard focus inside a container while `isActive` is true.
 *
 * Handles the four responsibilities of a real focus trap:
 *  1. Finds the currently focusable elements (re-queried on each Tab, so it
 *     stays correct when content changes while open).
 *  2. Cycles Tab / Shift+Tab at the boundaries instead of letting focus escape.
 *  3. Moves focus into the container when it opens.
 *  4. Restores focus to the triggering element when it closes.
 *
 * Optionally calls `onEscape` when the Escape key is pressed.
 *
 * @param isActive  Whether the trap is engaged (e.g. `isOpen` of a modal).
 * @param options   onEscape, restoreFocus, autoFocus.
 * @returns         A ref to attach to the container element.
 *
 * @example
 * const ref = useFocusTrap(isOpen, { onEscape: close });
 * return isOpen ? <div ref={ref} role="dialog" aria-modal="true">…</div> : null;
 *
 * @remarks
 * Known limitations (v1): focusable elements inside iframes or Shadow DOM are
 * not traversed, and radio groups are treated as individual stops rather than
 * a single one.
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {}
) {
  const { onEscape, restoreFocus = true, autoFocus = true } = options;

  const containerRef = useRef<T>(null);
  // Element that had focus before the trap opened — we return focus here on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the latest onEscape without re-running the main effect on every render.
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  /** Re-query on demand: content can change while the trap is open. */
  const getFocusable = useCallback((): HTMLElement[] => {
    const root = containerRef.current;
    if (!root) return [];
    return Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter(isVisible);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const root = containerRef.current;
    if (!root) return;

    // 3. Remember what had focus, then move focus inside.
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    if (autoFocus) {
      const focusable = getFocusable();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Nothing focusable inside: focus the container itself so the screen
        // reader lands in the dialog rather than back on the page.
        if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
        root.focus();
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable(); // fresh each time — handles dynamic content
      if (focusable.length === 0) {
        // Nothing to move to; keep focus where it is rather than letting it escape.
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // 2. Cycle at the boundaries only — let the browser handle the middle.
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !root.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // 4. Restore focus to the trigger — guard against it having unmounted.
      if (restoreFocus) {
        const target = previouslyFocused.current;
        if (target && document.contains(target)) target.focus();
      }
    };
  }, [isActive, autoFocus, restoreFocus, getFocusable]);

  return containerRef;
}
