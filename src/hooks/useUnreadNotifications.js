import { db } from "config/firebase-config";
import { collection, limit, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";

// The listener reads at most this many unread notifications; beyond that
// the badge just says "9+"
const badgeLimit = 10;

// Live unread notification count for the header bell and the dashboard
// sidebar. `label` is ready for a badge ("3", "9+"); "" when none.
export default function useUnreadNotifications(uid) {
  const { data: unread } = useFirestoreQuery(
    () =>
      uid
        ? query(
            collection(db, "users", uid, "notifications"),
            where("read", "==", false),
            limit(badgeLimit)
          )
        : null,
    [uid]
  );
  const count = unread.length;
  const label = !count
    ? ""
    : count >= badgeLimit
      ? `${badgeLimit - 1}+`
      : String(count);
  return { count, label };
}
