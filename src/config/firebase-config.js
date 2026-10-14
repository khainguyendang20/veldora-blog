import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  // The app's own host: Vite (dev) and vercel.json (production) proxy
  // /__/auth to REACT_APP_FIREBASE_AUTH_DOMAIN. Google sign-in on another
  // domain loses its result in browsers that partition third-party storage.
  authDomain: window.location.host,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// App Check proves requests come from this app, not a script holding the
// public API key that could burn the free plan's daily read quota. Must
// start before Firestore is used. Without a site key (e.g. a fresh local
// setup) it stays off. In development, the console prints a debug token to
// register under Firebase Console > App Check > Manage debug tokens.
const recaptchaSiteKey = import.meta.env.REACT_APP_RECAPTCHA_SITE_KEY;
if (recaptchaSiteKey) {
  if (import.meta.env.DEV) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN =
      import.meta.env.REACT_APP_APPCHECK_DEBUG_TOKEN || true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

// Keep fetched documents in IndexedDB so useCachedQuery can serve recent
// public lists from the browser instead of paying for reads again
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
export const auth = getAuth(app);
