import { IconBell } from "components/icons";
import { db } from "config/firebase-config";
import { collection, limit, query, where } from "firebase/firestore";
import useFirestoreQuery from "hooks/useFirestoreQuery";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// The listener reads at most this many unread notifications; beyond that
// the badge just says "9+"
const badgeLimit = 10;

const NotificationBellStyles = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  .notification-bell__badge {
    position: absolute;
    top: -6px;
    right: -8px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 100rem;
    background: #e74c3c;
    color: white;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const NotificationBell = ({ uid }) => {
  const { data: unread } = useFirestoreQuery(
    () =>
      query(
        collection(db, "users", uid, "notifications"),
        where("read", "==", false),
        limit(badgeLimit)
      ),
    [uid]
  );
  const count = unread.length;
  const label = count >= badgeLimit ? `${badgeLimit - 1}+` : String(count);
  return (
    <NotificationBellStyles
      to="/manage/notifications"
      aria-label={count ? `Notifications (${label} unread)` : "Notifications"}
    >
      <IconBell size={26} color="currentColor" />
      {count > 0 && <span className="notification-bell__badge">{label}</span>}
    </NotificationBellStyles>
  );
};

export default NotificationBell;
