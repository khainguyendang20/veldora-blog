// One-off backfill: sets likeCount and commentCount on posts from their
// likes and comments, for posts liked or commented before the counters
// existed. Count queries cost one read per post and subcollection.
//
// Runs as a service account (Admin SDK, unaffected by security rules and
// App Check enforcement). Point GOOGLE_APPLICATION_CREDENTIALS at the JSON
// key from Firebase Console > Project settings > Service accounts.
//
// Dry run (lists changes only):
//   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node scripts/backfill-counters.mjs
// Apply:
//   GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node scripts/backfill-counters.mjs --write
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const write = process.argv.includes("--write");
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to a service account key file.");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const count = async (postRef, name) =>
  (await postRef.collection(name).count().get()).data().count;

const posts = await db.collection("posts").get();
let changed = 0;
for (const postDoc of posts.docs) {
  const post = postDoc.data();
  const likeCount = await count(postDoc.ref, "likes");
  const commentCount = await count(postDoc.ref, "comments");
  if (post.likeCount === likeCount && post.commentCount === commentCount) continue;
  changed++;
  console.log(`${postDoc.id} "${post.title}": likes ${likeCount}, comments ${commentCount}`);
  if (write) await postDoc.ref.update({ likeCount, commentCount });
}

console.log(
  write
    ? `Updated ${changed} of ${posts.size} posts.`
    : `${changed} of ${posts.size} posts need counters. Re-run with --write to apply.`
);
process.exit(0);
