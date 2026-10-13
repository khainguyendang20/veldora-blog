import { auth, db } from "config/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import { userStatus } from "utils/constants";

// Keeps the auth store in sync with the Firebase session and the
// signed-in user's profile document (users/{uid}).
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
      unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
        const profile = snapshot.data();
        // Also the case for a moment right after sign-up, until the
        // profile is written
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
