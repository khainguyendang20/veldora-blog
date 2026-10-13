import { db } from "config/firebase-config";
import { doc, serverTimestamp } from "firebase/firestore";

// Notifications live in users/{authorId}/notifications and are written by
// the reader who liked or commented, in the same batch as the like or
// comment (Firestore rules check that it exists). Like notifications have
// a fixed id, so unliking removes them and liking again can't pile them up.
const notificationRef = (post, id) =>
  doc(db, "users", post.user.id, "notifications", id);

const likeId = (post, uid) => `like_${post.id}_${uid}`;
const commentId = (id) => `comment_${id}`;

// No notifications for your own posts
const notifies = (post, uid) => Boolean(post.user?.id) && post.user.id !== uid;

const payload = (post, actor, type) => ({
  type,
  postId: post.id,
  postSlug: post.slug || "",
  postTitle: post.title || "",
  actor: {
    id: actor.uid,
    fullname: actor.fullname || "",
    username: actor.username || "",
    avatar: actor.avatar || "",
  },
  read: false,
  createdAt: serverTimestamp(),
});

export const addLikeNotification = (batch, post, actor) => {
  if (!notifies(post, actor.uid)) return;
  batch.set(notificationRef(post, likeId(post, actor.uid)), payload(post, actor, "like"));
};

export const removeLikeNotification = (batch, post, uid) => {
  if (!notifies(post, uid)) return;
  batch.delete(notificationRef(post, likeId(post, uid)));
};

export const addCommentNotification = (batch, post, actor, id) => {
  if (!notifies(post, actor.uid)) return;
  batch.set(notificationRef(post, commentId(id)), {
    ...payload(post, actor, "comment"),
    commentId: id,
  });
};

export const removeCommentNotification = (batch, post, comment) => {
  // The commenter's own comment on their own post never notified anyone
  if (!notifies(post, comment.user?.id)) return;
  batch.delete(notificationRef(post, commentId(comment.id)));
};
