import { db } from "config/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { postStatus } from "utils/constants";

// Whether another post already uses `slug`. Firestore rules only let staff
// query every post; everyone else can check approved posts and their own,
// so a clash with someone else's unpublished post can still slip through.
export async function isSlugTaken(slug, { postId, uid, isStaff }) {
  const bySlug = query(collection(db, "posts"), where("slug", "==", slug));
  const queries = isStaff
    ? [bySlug]
    : [
        query(bySlug, where("status", "==", postStatus.APPROVED)),
        query(bySlug, where("user.id", "==", uid)),
      ];
  const snapshots = await Promise.all(queries.map((q) => getDocs(q)));
  return snapshots.some((snapshot) =>
    snapshot.docs.some((doc) => doc.id !== postId)
  );
}

export const randomSlugSuffix = () => Math.random().toString(36).slice(2, 6);
