import { getDocs, getDocsFromCache } from "firebase/firestore";
import { useEffect, useState } from "react";

const storageKey = (key) => `query-cache:${key}`;
const defaultMaxAge = 5 * 60 * 1000;

const readFreshUntil = (key) => {
  try {
    return Number(localStorage.getItem(storageKey(key))) || 0;
  } catch (error) {
    return 0;
  }
};

const writeFreshUntil = (key, time) => {
  try {
    localStorage.setItem(storageKey(key), String(time));
  } catch (error) {
    // Private mode or full storage: just fetch from the server next time
  }
};

// Makes the next read of `key` in this browser go to the server, e.g. so
// staff see their own change on the home page straight away
export const forgetCachedQuery = (key) => writeFreshUntil(key, 0);

const toData = (snapshot) =>
  snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// One-off read of a public query that reuses the copy Firestore keeps in
// IndexedDB for `maxAge` after fetching it, costing no reads. On the free
// plan's 50k reads a day this is what keeps busy public pages affordable;
// the trade-off is that readers see changes up to `maxAge` late. `key`
// names the query (it must change whenever the query does).
export default function useCachedQuery(key, buildQuery, deps, maxAge = defaultMaxAge) {
  const [state, setState] = useState({ data: [], loading: true });

  useEffect(() => {
    const q = buildQuery();
    if (!q) {
      setState({ data: [], loading: false });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    const load = async () => {
      if (Date.now() < readFreshUntil(key)) {
        try {
          const cached = await getDocsFromCache(q);
          // Empty means the cache was cleared, not that nothing matches
          if (!cached.empty) {
            if (!cancelled) setState({ data: toData(cached), loading: false });
            return;
          }
        } catch (error) {
          // Not in the cache after all; fall through to the server
        }
      }
      try {
        const snapshot = await getDocs(q);
        writeFreshUntil(key, Date.now() + maxAge);
        if (!cancelled) setState({ data: toData(snapshot), loading: false });
      } catch (error) {
        console.error(error);
        if (!cancelled) setState({ data: [], loading: false, error });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
