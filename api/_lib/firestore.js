// Server-side Firestore for Vercel functions. Files under api/_lib are not
// routes. The Admin SDK signs in with a service account (bypassing App
// Check and security rules), so these functions only ever read approved,
// public data. Set FIREBASE_SERVICE_ACCOUNT in Vercel to the JSON key from
// Firebase Console > Project settings > Service accounts.
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const getDb = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }
  return getFirestore();
};

// Approved posts, newest first
export const approvedPosts = (db, count) =>
  db
    .collection("posts")
    .where("status", "==", 1)
    .orderBy("createdAt", "desc")
    .limit(count);

// Absolute site URL from the request, so preview deployments link to
// themselves
export const siteUrl = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  return `${protocol}://${host}`;
};
