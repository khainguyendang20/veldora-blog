import { db } from "config/firebase-config";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

// Whether the document at `path` (an array of segments) exists, kept live.
// Pass null (e.g. while signed out) for false. The setter lets callers
// flip the value optimistically before their write lands.
export default function useDocExists(path) {
  const [exists, setExists] = useState(false);
  const key = path?.join("/");
  useEffect(() => {
    if (!path) {
      setExists(false);
      return;
    }
    return onSnapshot(doc(db, ...path), (snapshot) =>
      setExists(snapshot.exists())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [exists, setExists];
}
