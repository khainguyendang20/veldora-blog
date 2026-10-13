import { Button } from "components/button";
import { Image } from "components/image";
import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import styled from "styled-components";
import { avatarDefault, isStaffRole } from "utils/constants";
import { formatDate } from "utils/formatDate";

// Firestore rules enforce the same limit
export const maxCommentLength = 2000;

const CommentSectionStyles = styled.section`
  margin-bottom: 60px;
  .comment-form textarea {
    width: 100%;
    min-height: 100px;
    padding: 12px 16px;
    border: 1px solid ${(props) => props.theme.grayLight};
    border-radius: 8px;
    resize: vertical;
    margin-bottom: 12px;
  }
  .comment-form__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #888;
  }
  .comment-form button {
    margin: 0;
    min-width: 160px;
  }
  .comment-list {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .comment {
    display: flex;
    gap: 12px;
  }
  .comment img {
    width: 40px;
    height: 40px;
    border-radius: 100rem;
    object-fit: cover;
    flex-shrink: 0;
  }
  .comment__header {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: 14px;
  }
  .comment__author {
    font-weight: 600;
  }
  .comment__date {
    color: #888;
    font-size: 12px;
  }
  .comment__content {
    margin-top: 4px;
    white-space: pre-line;
    word-break: break-word;
  }
  .comment__delete {
    margin-left: auto;
    border: 0;
    background: none;
    color: #c0392b;
    cursor: pointer;
    font-size: 12px;
  }
`;

const CommentSection = ({ post }) => {
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const { data: comments } = useFirestoreQuery(
    () =>
      query(
        collection(db, "posts", post.id, "comments"),
        orderBy("createdAt", "asc")
      ),
    [post.id]
  );
  // Comments are only open on published posts (Firestore rules agree)
  const isOpen = post.status === 1;
  const canModerate =
    isStaffRole(user?.role) || (user?.uid && post.user?.id === user.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSending(true);
    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        content: text,
        // Must match the author's profile; rules check it
        user: {
          id: user.uid,
          fullname: user.fullname || "",
          username: user.username || "",
          avatar: user.avatar || "",
        },
        createdAt: serverTimestamp(),
      });
      setContent("");
    } catch (error) {
      toast.error("Could not post your comment, please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, "posts", post.id, "comments", commentId));
    } catch (error) {
      toast.error("Could not delete the comment, please try again.");
    }
  };

  return (
    <CommentSectionStyles aria-label="Comments">
      <Heading>Comments ({comments.length})</Heading>
      {isOpen &&
        (user ? (
          <form className="comment-form" onSubmit={handleSubmit}>
            <textarea
              aria-label="Write a comment"
              placeholder="Share your thoughts..."
              value={content}
              maxLength={maxCommentLength}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <div className="comment-form__footer">
              <span>
                {content.length}/{maxCommentLength}
              </span>
              <Button
                type="submit"
                height="44px"
                disabled={sending || !content.trim()}
                isLoading={sending}
              >
                Post comment
              </Button>
            </div>
          </form>
        ) : (
          <p>
            <Link to="/login">Sign in</Link> to join the discussion.
          </p>
        ))}
      <ul className="comment-list">
        {comments.map((comment) => (
          <li className="comment" key={comment.id}>
            <Image
              src={comment.user?.avatar}
              fallback={avatarDefault}
              resizeTo={96}
            />
            <div style={{ flex: 1 }}>
              <div className="comment__header">
                {comment.user?.username ? (
                  <Link
                    className="comment__author"
                    to={`/profile/${comment.user.username}`}
                  >
                    {comment.user.fullname || "Unknown author"}
                  </Link>
                ) : (
                  <span className="comment__author">
                    {comment.user?.fullname || "Unknown author"}
                  </span>
                )}
                <span className="comment__date">
                  {formatDate(comment.createdAt)}
                </span>
                {user && (canModerate || comment.user?.id === user.uid) && (
                  <button
                    type="button"
                    className="comment__delete"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="comment__content">{comment.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </CommentSectionStyles>
  );
};

export default CommentSection;
