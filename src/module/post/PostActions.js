import { IconBookmark, IconHeart } from "components/icons";
import { db } from "config/firebase-config";
import {
  deleteDoc,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import useDocExists from "hooks/useDocExists";
import styled from "styled-components";
import {
  addLikeNotification,
  removeLikeNotification,
} from "module/notification/notify";

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
    border: 1px solid var(--color-border);
    border-radius: 100rem;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 14px;
  }
  button[aria-pressed="true"] {
    border-color: ${(props) => props.theme.primary};
    color: ${(props) => props.theme.primary};
  }
`;

// Like and save buttons for a published post. A like is
// posts/{id}/likes/{uid}, written in one batch with the post's likeCount
// (Firestore rules require both); a saved post is users/{uid}/bookmarks/{id}.
const PostActions = ({ post }) => {
  const postId = post.id;
  const user = useAuthStore((state) => state.user);
  const uid = user?.uid;
  const navigate = useNavigate();
  // The post document is live, so its likeCount catches up on its own;
  // until then show the reader's own click
  const [pendingDelta, setPendingDelta] = useState(0);
  const likeCount = (post.likeCount || 0) + pendingDelta;
  useEffect(() => setPendingDelta(0), [post.likeCount]);
  const [liked, setLiked] = useDocExists(
    uid ? ["posts", postId, "likes", uid] : null
  );
  const [saved, setSaved] = useDocExists(
    uid ? ["users", uid, "bookmarks", postId] : null
  );

  // Flip the button at once and undo it if the write fails
  const toggle = async ({ on, setOn, write, onCountChange }) => {
    if (!uid) {
      toast.info("Sign in to like and save posts.");
      navigate("/login");
      return;
    }
    setOn(!on);
    onCountChange?.(on ? -1 : 1);
    try {
      await write(!on);
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
      write: (turnOn) => {
        const batch = writeBatch(db);
        const likeRef = doc(db, "posts", postId, "likes", uid);
        if (turnOn) batch.set(likeRef, { createdAt: serverTimestamp() });
        else batch.delete(likeRef);
        batch.update(doc(db, "posts", postId), {
          likeCount: increment(turnOn ? 1 : -1),
        });
        if (turnOn) addLikeNotification(batch, post, user);
        else removeLikeNotification(batch, post, uid);
        return batch.commit();
      },
      onCountChange: (delta) => setPendingDelta((value) => value + delta),
    });

  const handleSave = () =>
    toggle({
      on: saved,
      setOn: setSaved,
      write: (turnOn) => {
        const ref = doc(db, "users", uid, "bookmarks", postId);
        return turnOn
          ? setDoc(ref, { createdAt: serverTimestamp() })
          : deleteDoc(ref);
      },
    });

  return (
    <PostActionsStyles>
      <button type="button" aria-pressed={liked} onClick={handleLike}>
        <IconHeart size={18} color="currentColor" filled={liked} />
        {liked ? "Liked" : "Like"}
        <span>· {likeCount}</span>
      </button>
      <button type="button" aria-pressed={saved} onClick={handleSave}>
        <IconBookmark size={18} color="currentColor" filled={saved} />
        {saved ? "Saved" : "Save"}
      </button>
    </PostActionsStyles>
  );
};

export default PostActions;
