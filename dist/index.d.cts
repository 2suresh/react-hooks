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
declare function useDebounce<T>(value: T, delay?: number): T;

export { useDebounce };
