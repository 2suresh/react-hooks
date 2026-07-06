# @sureshsk/react-hooks

A small, **dependency-free**, **TypeScript-first** collection of headless React hooks.
No UI, no styling opinions — just well-tested logic you can drop into any React app.

> Built and maintained by Suresh Kumar. Focused, documented, and accessible-minded.

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
    // Fires only after the user pauses typing for 400ms —
    // not on every keystroke.
    fetch(`/api/search?q=${debouncedQuery}`);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### API

| Param   | Type     | Default | Description                                        |
| ------- | -------- | ------- | -------------------------------------------------- |
| `value` | `T`      | —       | The fast-changing value to debounce.               |
| `delay` | `number` | `300`   | Milliseconds of quiet to wait before updating.     |

**Returns:** `T` — the value, delayed until it stops changing.

### Why it works

Each change starts a timer; if the value changes again before the timer fires,
the previous timer is cleared. Only the **last** value in a burst survives — which
is exactly what debouncing means. Fully typed via generics, so the returned value
keeps the type you passed in.

---

## License

MIT
