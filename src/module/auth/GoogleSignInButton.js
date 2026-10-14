import { auth } from "config/firebase-config";
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { authErrorMessage } from "utils/authErrorMessage";
import { ensureUserProfile } from "./userProfile";

const GoogleButtonStyles = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 48px;
  padding: 0 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover {
    background: var(--color-subtle);
  }
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

// Google's multicolour "G"
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
);

// The reader closing the popup is not an error worth reporting
const dismissed = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

// Signs in with Google, creating the profile on first sign-in. Needs the
// Google provider enabled under Firebase Console > Authentication.
const GoogleSignInButton = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const finishSignIn = async (user) => {
    await ensureUserProfile(user);
    navigate("/");
  };

  // Coming back from the redirect fallback below lands on this page again
  useEffect(() => {
    let cancelled = false;
    getRedirectResult(auth)
      .then((result) => {
        if (result && !cancelled) return finishSignIn(result.user);
      })
      .catch((error) => toast.error(authErrorMessage(error)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async () => {
    setBusy(true);
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      await finishSignIn(user);
    } catch (error) {
      if (error?.code === "auth/popup-blocked") {
        // Some browsers and in-editor previews block popups; a full-page
        // redirect to Google needs none
        await signInWithRedirect(auth, provider);
        return;
      }
      if (!dismissed.includes(error?.code)) toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GoogleButtonStyles type="button" onClick={handleClick} disabled={busy}>
      <GoogleLogo />
      Continue with Google
    </GoogleButtonStyles>
  );
};

export default GoogleSignInButton;
