import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay`
 * milliseconds have passed without `value` changing.
 *
 * Useful for expensive reactions to fast-changing input — search-as-you-type,
 * window resizing, autosave — where you want to wait until the user pauses.
 *
 * @param value  The fast-changing value to debounce.
 * @param delay  Milliseconds of "quiet" to wait before updating. Default 300.
 * @returns      The value, delayed until it stops changing.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 400);
 * // debouncedQuery only settles once the user stops typing for 400ms
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Start a timer whenever `value` (or `delay`) changes.
    const timer = setTimeout(() => setDebounced(value), delay);

    // Cleanup runs before the next effect and on unmount: if `value` changes
    // again before the timer fires, we cancel the pending update. This is the
    // heart of debouncing — only the *last* change in a burst survives.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
