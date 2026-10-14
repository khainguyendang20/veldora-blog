import { db } from "config/firebase-config";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import useDocExists from "hooks/useDocExists";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import styled from "styled-components";

const FollowButtonStyles = styled.button`
  padding: 6px 18px;
  border-radius: 100rem;
  border: 1px solid ${(props) => props.theme.primary};
  background: ${(props) => (props.$following ? "transparent" : props.theme.primary)};
  color: ${(props) => (props.$following ? props.theme.primary : "white")};
  font-weight: 500;
  cursor: pointer;
`;

// Follows an author: users/{uid}/following/{authorId}, private to the
// reader. Hidden on the reader's own profile.
const FollowButton = ({ authorId }) => {
  const uid = useAuthStore((state) => state.user?.uid);
  const navigate = useNavigate();
  const [following, setFollowing] = useDocExists(
    uid && authorId ? ["users", uid, "following", authorId] : null
  );
  if (!authorId || authorId === uid) return null;

  const handleClick = async () => {
    if (!uid) {
      toast.info("Sign in to follow authors.");
      navigate("/login");
      return;
    }
    const ref = doc(db, "users", uid, "following", authorId);
    setFollowing(!following);
    try {
      if (following) await deleteDoc(ref);
      else await setDoc(ref, { createdAt: serverTimestamp() });
    } catch (error) {
      setFollowing(following);
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <FollowButtonStyles
      type="button"
      $following={following}
      aria-pressed={following}
      onClick={handleClick}
    >
      {following ? "Following" : "Follow"}
    </FollowButtonStyles>
  );
};

export default FollowButton;
