import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

// Subscribes to a Firestore query and unsubscribes on unmount / deps change.
// `buildQuery` may return null to skip subscribing (e.g. missing params).
export default function useFirestoreQuery(buildQuery, deps) {
  const [state, setState] = useState({ data: [], loading: true });

  useEffect(() => {
    const q = buildQuery();
    if (!q) {
      setState({ data: [], loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setState({ data, loading: false });
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
