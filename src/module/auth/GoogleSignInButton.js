import { auth } from "config/firebase-config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { authErrorMessage } from "utils/authErrorMessage";
import { ensureUserProfile } from "./userProfile";

const GoogleButtonStyles = styled.button`
  display: block;
  width: 100%;
  max-width: 600px;
  margin: 16px auto 0;
  padding: 14px 20px;
  border: 1px solid ${(props) => props.theme.grayLight};
  border-radius: 8px;
  background: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

// The reader closing the popup is not an error worth reporting
const dismissed = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];

// Signs in with Google, creating the profile on first sign-in. Needs the
// Google provider enabled under Firebase Console > Authentication.
const GoogleSignInButton = () => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserProfile(user);
      navigate("/");
    } catch (error) {
      if (!dismissed.includes(error?.code)) toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <GoogleButtonStyles type="button" onClick={handleClick} disabled={busy}>
      Continue with Google
    </GoogleButtonStyles>
  );
};

export default GoogleSignInButton;
