import { auth, db } from "config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { useAuthStore } from "store";

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
        if (snapshot.empty) {
          setCurrentUser(null);
          return;
        }
        snapshot.forEach((doc) => {
          setCurrentUser({ ...user, ...doc.data() });
        });
      });
    });
    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, [setCurrentUser]);
}
