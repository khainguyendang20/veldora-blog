import { IconBell } from "components/icons";
import useUnreadNotifications from "hooks/useUnreadNotifications";
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

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
  const { count, label } = useUnreadNotifications(uid);
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
