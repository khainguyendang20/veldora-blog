import { db } from "config/firebase-config";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import slugify from "slugify";
import { avatarDefault, userRole, userStatus } from "utils/constants";

// The public profile (users/{uid}) is readable by anyone, so the email
// lives apart in userEmails/{uid}, which only its owner and admins can
// read. Both are written together so neither exists without the other.
export async function createUserProfile(authUser, { fullname, avatar } = {}) {
  const name =
    fullname || authUser.displayName || authUser.email.split("@")[0];
  const batch = writeBatch(db);
  batch.set(doc(db, "users", authUser.uid), {
    fullname: name,
    avatar: avatar || avatarDefault,
    username: slugify(`${name}-${authUser.uid.slice(0, 10)}`, { lower: true }),
    role: userRole.USER,
    status: userStatus.ACTIVE,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "userEmails", authUser.uid), { email: authUser.email });
  await batch.commit();
}

// For sign-ins that can create the account on the fly (e.g. Google)
export async function ensureUserProfile(authUser) {
  const snapshot = await getDoc(doc(db, "users", authUser.uid));
  if (!snapshot.exists()) {
    await createUserProfile(authUser, { avatar: authUser.photoURL });
  }
}
