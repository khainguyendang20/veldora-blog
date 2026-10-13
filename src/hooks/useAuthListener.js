import { auth, db } from "config/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { userStatus } from "utils/constants";

// Keeps the auth store in sync with the Firebase session and the
// signed-in user's profile document.
export default function useAuthListener() {
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);

  useEffect(() => {
    let unsubscribeUser = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUser?.();
      unsubscribeUser = null;
      if (!user) {
        setCurrentUser(null);
        return;
      }
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
        let profile = null;
        snapshot.forEach((doc) => {
          profile = doc.data();
        });
        if (!profile) {
          setCurrentUser(null);
          return;
        }
        // Live listener, so a ban also ends sessions that are already open.
        // Firestore rules block banned users' writes either way.
        if (profile.status === userStatus.BANNED) {
          setCurrentUser(null);
          toast.error("Your account has been banned.");
          signOut(auth);
          return;
        }
        setCurrentUser({ ...user, ...profile });
      });
    });
    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, [setCurrentUser]);
}
