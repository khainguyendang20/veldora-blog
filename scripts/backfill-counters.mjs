// One-off backfill: sets likeCount and commentCount on posts from their
// likes and comments, for posts liked or commented before the counters
// existed. Count queries cost one read per post and subcollection.
//
// Dry run (lists changes only):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/backfill-counters.mjs
// Apply:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/backfill-counters.mjs --write
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
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
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
});
const db = getFirestore(app);
await signInWithEmailAndPassword(getAuth(app), ADMIN_EMAIL, ADMIN_PASSWORD);

const count = async (postId, name) =>
  (await getCountFromServer(collection(db, "posts", postId, name))).data().count;

const posts = await getDocs(collection(db, "posts"));
let changed = 0;
for (const postDoc of posts.docs) {
  const post = postDoc.data();
  const likeCount = await count(postDoc.id, "likes");
  const commentCount = await count(postDoc.id, "comments");
  if (post.likeCount === likeCount && post.commentCount === commentCount) continue;
  changed++;
  console.log(`${postDoc.id} "${post.title}": likes ${likeCount}, comments ${commentCount}`);
  if (write) {
    await updateDoc(doc(db, "posts", postDoc.id), { likeCount, commentCount });
  }
}

console.log(
  write
    ? `Updated ${changed} of ${posts.size} posts.`
    : `${changed} of ${posts.size} posts need counters. Re-run with --write to apply.`
);
process.exit(0);
