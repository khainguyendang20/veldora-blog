// One-off cleanup: registration used to store each user's plaintext password
// in their profile, and new posts copied that whole profile into `post.user`.
// This removes `password` from users and trims `post.user` to public fields.
// It only prints document ids, never field values.
//
// Dry run (lists changes only):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/remove-private-user-data.mjs
// Apply:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/remove-private-user-data.mjs --write
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";

const PUBLIC_AUTHOR_FIELDS = ["id", "fullname", "username", "avatar"];
// Firebase Auth uids are 28 characters; auto-generated document ids are 20
const AUTH_UID_LENGTH = 28;

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

const users = await getDocs(collection(db, "users"));
let usersWithPassword = 0;
const legacyUserIds = [];
for (const userDoc of users.docs) {
  if (userDoc.id.length !== AUTH_UID_LENGTH) legacyUserIds.push(userDoc.id);
  if (!("password" in userDoc.data())) continue;
  usersWithPassword++;
  console.log(`users/${userDoc.id}: remove password`);
  if (write) {
    await updateDoc(doc(db, "users", userDoc.id), { password: deleteField() });
  }
}

const posts = await getDocs(collection(db, "posts"));
let postsToTrim = 0;
for (const postDoc of posts.docs) {
  const author = postDoc.data().user || {};
  const extraKeys = Object.keys(author).filter(
    (key) => !PUBLIC_AUTHOR_FIELDS.includes(key)
  );
  if (!extraKeys.length) continue;
  postsToTrim++;
  console.log(`posts/${postDoc.id}: drop user.{${extraKeys.join(", ")}}`);
  if (write) {
    const trimmed = {};
    for (const key of PUBLIC_AUTHOR_FIELDS) {
      if (key in author) trimmed[key] = author[key];
    }
    await updateDoc(doc(db, "posts", postDoc.id), { user: trimmed });
  }
}

console.log(
  write
    ? `Removed ${usersWithPassword} passwords and trimmed ${postsToTrim} posts.`
    : `${usersWithPassword} of ${users.size} users store a password; ` +
        `${postsToTrim} of ${posts.size} posts embed private author fields. ` +
        "Re-run with --write to apply."
);
if (legacyUserIds.length) {
  // Firestore rules look profiles up by auth uid, so these accounts lose
  // write access once the new rules are deployed
  console.log(
    `Profiles not keyed by an auth uid (check by hand): ${legacyUserIds.join(", ")}`
  );
}
process.exit(0);
