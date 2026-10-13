import { Image } from "components/image";
import Heading from "components/layout/Heading";
import { db } from "config/firebase-config";
import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "store";
import styled from "styled-components";
import { avatarDefault } from "utils/constants";
import { formatDate } from "utils/formatDate";

const pageSize = 30;

const NotificationsStyles = styled.div`
  .notifications__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .notifications__mark-all {
    border: 0;
    background: none;
    color: ${(props) => props.theme.primary};
    cursor: pointer;
  }
  .notification {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
  }
  .notification--unread {
    background: ${(props) => props.theme.gray1};
    font-weight: 500;
  }
  .notification img {
    width: 40px;
    height: 40px;
    border-radius: 100rem;
    object-fit: cover;
  }
  .notification__date {
    font-size: 12px;
    color: #888;
  }
`;

const describe = (notification) =>
  notification.type === "like" ? "liked your post" : "commented on your post";

const NotificationsPage = () => {
  const uid = useAuthStore((state) => state.user?.uid);
  const { data: notifications, loading } = useFirestoreQuery(
    () =>
      query(
        collection(db, "users", uid, "notifications"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      ),
    [uid]
  );
  const unread = notifications.filter((notification) => !notification.read);

  const markRead = (notification) => {
    if (notification.read) return;
    updateDoc(doc(db, "users", uid, "notifications", notification.id), {
      read: true,
    }).catch(() => {});
  };

  const markAllRead = async () => {
    const batch = writeBatch(db);
    unread.forEach((notification) =>
      batch.update(doc(db, "users", uid, "notifications", notification.id), {
        read: true,
      })
    );
    try {
      await batch.commit();
    } catch (error) {
      toast.error("Something went wrong, please try again!");
    }
  };

  return (
    <NotificationsStyles>
      <div className="notifications__header">
        <Heading>Notifications</Heading>
        {unread.length > 0 && (
          <button
            type="button"
            className="notifications__mark-all"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      {!loading && !notifications.length && (
        <p>Likes and comments on your posts will show up here.</p>
      )}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <Link
              to={`/post/${notification.postSlug}`}
              className={
                notification.read
                  ? "notification"
                  : "notification notification--unread"
              }
              onClick={() => markRead(notification)}
            >
              <Image
                src={notification.actor?.avatar}
                fallback={avatarDefault}
                resizeTo={96}
              />
              <div>
                <p>
                  <strong>{notification.actor?.fullname || "Someone"}</strong>{" "}
                  {describe(notification)} “{notification.postTitle}”
                </p>
                <span className="notification__date">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </NotificationsStyles>
  );
};

export default NotificationsPage;
