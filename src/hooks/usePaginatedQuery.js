import { getDocs, limit, query, startAfter } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

const initialState = {
  data: [],
  loading: true,
  loadingMore: false,
  hasMore: false,
  error: null,
};

// Reads an ordered Firestore query one page at a time. Pages are one-off
// reads rather than listeners, so a long list costs one read per document
// shown. `buildQuery` may return null to skip loading (e.g. missing params).
export default function usePaginatedQuery(buildQuery, deps, pageSize = 12) {
  const [state, setState] = useState(initialState);
  const baseQuery = useRef(null);
  const cursor = useRef(null);

  // Ask for one extra document to know whether another page exists
  const readPage = async (q, after) => {
    const constraints = after
      ? [startAfter(after), limit(pageSize + 1)]
      : [limit(pageSize + 1)];
    const snapshot = await getDocs(query(q, ...constraints));
    const docs = snapshot.docs.slice(0, pageSize);
    return {
      items: docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      last: docs[docs.length - 1] || null,
      hasMore: snapshot.docs.length > pageSize,
    };
  };

  useEffect(() => {
    const q = buildQuery();
    baseQuery.current = q;
    cursor.current = null;
    if (!q) {
      setState({ ...initialState, loading: false });
      return;
    }
    setState(initialState);
    readPage(q)
      .then((page) => {
        if (baseQuery.current !== q) return;
        cursor.current = page.last;
        setState({ ...initialState, data: page.items, loading: false, hasMore: page.hasMore });
      })
      .catch((error) => {
        if (baseQuery.current !== q) return;
        console.error(error);
        setState({ ...initialState, loading: false, error });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = async () => {
    const q = baseQuery.current;
    if (!q || !cursor.current) return;
    setState((prev) => ({ ...prev, loadingMore: true }));
    try {
      const page = await readPage(q, cursor.current);
      // The query changed while this page was loading
      if (baseQuery.current !== q) return;
      cursor.current = page.last;
      setState((prev) => ({
        ...prev,
        data: [...prev.data, ...page.items],
        loadingMore: false,
        hasMore: page.hasMore,
      }));
    } catch (error) {
      console.error(error);
      setState((prev) => ({ ...prev, loadingMore: false, error }));
    }
  };

  return { ...state, loadMore };
}
