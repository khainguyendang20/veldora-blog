// One-off migration: profiles in `users` are public, so move each email
// into `userEmails/{uid}` (readable by its owner and admins only) and
// remove it from the profile. Needs the Firestore rules that define
// userEmails. Prints document ids only, never emails.
//
// Dry run (lists changes only):
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/move-user-emails.mjs
// Apply:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node --env-file=.env scripts/move-user-emails.mjs --write
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  writeBatch,
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

const users = await getDocs(collection(db, "users"));
let moved = 0;
for (const userDoc of users.docs) {
  const { email } = userDoc.data();
  if (!email) continue;
  moved++;
  console.log(`users/${userDoc.id}: move email to userEmails/${userDoc.id}`);
  if (write) {
    // Both in one batch, so the email is never lost half-way
    const batch = writeBatch(db);
    batch.set(doc(db, "userEmails", userDoc.id), { email });
    batch.update(doc(db, "users", userDoc.id), { email: deleteField() });
    await batch.commit();
  }
}

console.log(
  write
    ? `Moved ${moved} emails.`
    : `${moved} of ${users.size} profiles still hold an email. Re-run with --write to apply.`
);
process.exit(0);
