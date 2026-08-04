import { useEffect, useState } from "react";
// file added since it was taking a lot time for agents filtering and it was making the UI unresponsive. 
// So added a debounce to the search input to reduce the 
// number of times the filter function is called.

// code is changed files like hooks/use-debounced-value.ts and agents-view.tsx to implement the debounce functionality.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
}
