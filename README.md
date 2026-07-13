# @sureshsk/react-hooks

A small, **dependency-free**, **TypeScript-first** collection of headless React hooks.
No UI, no styling opinions — just well-tested logic you can drop into any React app.

Built and maintained by Suresh Kumar.

## Install

```bash
npm install @sureshsk/react-hooks
```

Requires React 18 or 19 (uses only stable, standard hooks — no experimental APIs).

---

## `useDebounce`

Returns a debounced copy of a value that only updates after it stops changing
for a given delay. Ideal for search-as-you-type, resize handlers, and autosave —
anywhere a fast-changing value drives expensive work.

### Usage

```tsx
import { useState, useEffect } from "react";
import { useDebounce } from "@sureshsk/react-hooks";

function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery) return;
    // Fires only after the user pauses typing for 400ms — not on every keystroke.
    fetch(`/api/search?q=${debouncedQuery}`);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### API

| Param   | Type     | Default | Description                                    |
| ------- | -------- | ------- | ---------------------------------------------- |
| `value` | `T`      | —       | The fast-changing value to debounce.           |
| `delay` | `number` | `300`   | Milliseconds of quiet to wait before updating. |

**Returns:** `T` — the value, delayed until it stops changing.

### Why it works

Each change starts a timer; if the value changes again before the timer fires, the
previous timer is cleared. Only the **last** value in a burst survives — which is
exactly what debouncing means. Fully typed via generics, so the returned value keeps
the type you passed in.

---

## `useFocusTrap`

Traps keyboard focus inside a container while it's active — the behaviour a modal
dialog needs so that Tab doesn't wander off into the page behind it.

Accessibility belongs in the component, not in a checklist run before launch. Build
focus management into your dialog once, and every screen that uses it is correct by
construction.

### Usage

```tsx
import { useFocusTrap } from "@sureshsk/react-hooks";

function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(isOpen, { onEscape: onClose });

  if (!isOpen) return null;

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="title">
      <h2 id="title">Confirm</h2>
      <button onClick={onClose}>Cancel</button>
      <button onClick={onClose}>Confirm</button>
    </div>
  );
}
```

### API

```ts
useFocusTrap<T extends HTMLElement>(
  isActive: boolean,
  options?: UseFocusTrapOptions
): RefObject<T>
```

| Param      | Type                  | Default | Description                                            |
| ---------- | --------------------- | ------- | ------------------------------------------------------ |
| `isActive` | `boolean`             | —       | Whether the trap is engaged (e.g. a modal's `isOpen`). |
| `options`  | `UseFocusTrapOptions` | `{}`    | See below.                                             |

**Options**

| Option         | Type         | Default | Description                                            |
| -------------- | ------------ | ------- | ------------------------------------------------------ |
| `onEscape`     | `() => void` | —       | Called when Escape is pressed. Omit to disable.        |
| `restoreFocus` | `boolean`    | `true`  | Return focus to the triggering element when it closes. |
| `autoFocus`    | `boolean`    | `true`  | Move focus into the container when it opens.           |

**Returns:** a ref to attach to the container element.

### What it handles

1. **Finds the focusable elements** inside the container — re-queried on every Tab,
   so it stays correct if content changes while the dialog is open.
2. **Cycles Tab / Shift+Tab at the boundaries.** Tab from the last element wraps to
   the first; Shift+Tab from the first wraps to the last. The browser handles
   everything in between — the hook only intervenes at the edges.
3. **Moves focus in** when it activates (the first focusable element, or the
   container itself if there is none).
4. **Restores focus** to whatever was focused before — usually the button that opened
   the dialog. Without this, closing a modal dumps the user at the top of the document.

Escape handling is included via `onEscape`, since almost every dialog needs it.

### Known limitations (v1)

Being precise about the edges matters more than claiming completeness:

- Focusable elements inside **iframes** or **Shadow DOM** are not traversed.
- **Radio groups** are treated as individual tab stops rather than a single one.
- Visibility is determined from **computed styles** (`display`, `visibility`, `hidden`,
  `inert`) rather than layout geometry. This keeps it correct in test environments as
  well as browsers, but it will not detect an element hidden only by being scrolled out
  of an overflow container.

### A note on ARIA

A focus trap governs **keyboard behaviour**. It pairs with, but does not replace, the
ARIA that tells assistive technology *what the thing is* — `role="dialog"`,
`aria-modal="true"`, and a label. Use both.

---

## Development

```bash
npm install
npm test        # vitest
npm run build   # tsup → ESM + CJS + type declarations
```

## License

MIT
