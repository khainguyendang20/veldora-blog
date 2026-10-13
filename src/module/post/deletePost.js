import { db } from "config/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

// Firestore batches hold at most 500 writes
const batchSize = 400;

// Deleting a document leaves its subcollections behind, so remove the
// post's comments and likes first. Firestore rules let the post's author
// and staff delete both.
export async function deletePost(postId) {
  for (const name of ["comments", "likes"]) {
    const snapshot = await getDocs(collection(db, "posts", postId, name));
    for (let i = 0; i < snapshot.docs.length; i += batchSize) {
      const batch = writeBatch(db);
      snapshot.docs
        .slice(i, i + batchSize)
        .forEach((child) => batch.delete(child.ref));
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, "posts", postId));
}
