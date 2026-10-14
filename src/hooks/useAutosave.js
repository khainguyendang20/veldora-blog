import { useCallback, useEffect, useRef, useState } from "react";

const storageKey = (key) => `autosave:${key}`;
const delay = 1000;

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(key)) || "null");
  } catch (error) {
    return null;
  }
};

const sameValues = (a, b) =>
  Object.keys(a).every((field) => (a[field] || "") === (b[field] || ""));

// Keeps unsaved form values in localStorage (a second after the last
// change) so a closed tab or crash doesn't lose them. `saved` is a copy
// from an earlier visit that differs from `initial`, for the form to offer
// to restore. Call clear() once the form is submitted.
export default function useAutosave(key, values, initial) {
  const [saved, setSaved] = useState(() => {
    const previous = read(key);
    return previous && !sameValues(previous.values, initial) ? previous : null;
  });
  const timer = useRef(null);
  const serialized = JSON.stringify(values);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        if (sameValues(values, initial)) {
          localStorage.removeItem(storageKey(key));
        } else {
          localStorage.setItem(
            storageKey(key),
            JSON.stringify({ values, savedAt: Date.now() })
          );
        }
      } catch (error) {
        // Storage full or blocked: autosave is a convenience, skip it
      }
    }, delay);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, serialized]);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    setSaved(null);
    try {
      localStorage.removeItem(storageKey(key));
    } catch (error) {
      // Nothing to clear
    }
  }, [key]);

  // The offer was answered either way; future changes keep autosaving
  const dismiss = useCallback(() => setSaved(null), []);

  return { saved, clear, dismiss };
}
