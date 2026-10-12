// One-off backfill: adds `categoryIds` to posts created before the field existed.
//
// Dry run (lists changes only):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/backfill-category-ids.mjs
// Apply:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/backfill-category-ids.mjs --write
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const write = process.argv.includes("--write");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  process.exit(1);
}

const app = initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});
const db = getFirestore(app);
await signInWithEmailAndPassword(getAuth(app), ADMIN_EMAIL, ADMIN_PASSWORD);

const snapshot = await getDocs(collection(db, "posts"));
let pending = 0;
for (const postDoc of snapshot.docs) {
  const post = postDoc.data();
  const categoryIds = (post.categories || [])
    .map((category) => category?.id)
    .filter(Boolean);
  const current = post.categoryIds || [];
  if (
    current.length === categoryIds.length &&
    current.every((id, i) => id === categoryIds[i])
  ) {
    continue;
  }
  pending++;
  console.log(`${postDoc.id} "${post.title}": [${categoryIds.join(", ")}]`);
  if (write) await updateDoc(doc(db, "posts", postDoc.id), { categoryIds });
}

console.log(
  write
    ? `Updated ${pending} of ${snapshot.size} posts.`
    : `${pending} of ${snapshot.size} posts need categoryIds. Re-run with --write to apply.`
);
process.exit(0);
