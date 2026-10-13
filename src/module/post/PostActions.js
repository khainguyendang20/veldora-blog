import { IconBookmark, IconHeart } from "components/icons";
import { db } from "config/firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import styled from "styled-components";

const PostActionsStyles = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 32px 0;
  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 100rem;
    background: white;
    cursor: pointer;
    font-size: 14px;
  }
  button[aria-pressed="true"] {
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
`;

// Whether a document exists, kept live; false while signed out
const useDocExists = (path) => {
  const [exists, setExists] = useState(false);
  const key = path?.join("/");
  useEffect(() => {
    if (!path) {
      setExists(false);
      return;
    }
    return onSnapshot(doc(db, ...path), (snapshot) =>
      setExists(snapshot.exists())
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [exists, setExists];
};

// Like and save buttons for a published post. A like is
// posts/{id}/likes/{uid}; a saved post is users/{uid}/bookmarks/{id}.
const PostActions = ({ postId }) => {
  const uid = useAuthStore((state) => state.user?.uid);
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState(null);
  const [liked, setLiked] = useDocExists(
    uid ? ["posts", postId, "likes", uid] : null
  );
  const [saved, setSaved] = useDocExists(
    uid ? ["users", uid, "bookmarks", postId] : null
  );

  // A count query costs one read, not one per like
  useEffect(() => {
    let cancelled = false;
    getCountFromServer(collection(db, "posts", postId, "likes"))
      .then((snapshot) => {
        if (!cancelled) setLikeCount(snapshot.data().count);
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Flip the button at once and undo it if the write fails
  const toggle = async ({ on, setOn, makeRef, onCountChange }) => {
    if (!uid) {
      toast.info("Sign in to like and save posts.");
      navigate("/login");
      return;
    }
    const ref = makeRef();
    setOn(!on);
    onCountChange?.(on ? -1 : 1);
    try {
      if (on) await deleteDoc(ref);
      else await setDoc(ref, { createdAt: serverTimestamp() });
    } catch (error) {
      setOn(on);
      onCountChange?.(on ? 1 : -1);
      toast.error("Something went wrong, please try again!");
    }
  };

  const handleLike = () =>
    toggle({
      on: liked,
      setOn: setLiked,
      makeRef: () => doc(db, "posts", postId, "likes", uid),
      onCountChange: (delta) =>
        setLikeCount((count) => (count === null ? count : count + delta)),
    });

  const handleSave = () =>
    toggle({
      on: saved,
      setOn: setSaved,
      makeRef: () => doc(db, "users", uid, "bookmarks", postId),
    });

  return (
    <PostActionsStyles>
      <button type="button" aria-pressed={liked} onClick={handleLike}>
        <IconHeart size={18} color="currentColor" filled={liked} />
        {liked ? "Liked" : "Like"}
        {likeCount !== null && <span>· {likeCount}</span>}
      </button>
      <button type="button" aria-pressed={saved} onClick={handleSave}>
        <IconBookmark size={18} color="currentColor" filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    </PostActionsStyles>
  );
};

export default PostActions;
