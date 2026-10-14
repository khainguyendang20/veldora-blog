import {
  IconBell,
  IconBookmark,
  IconLogout,
  IconProfile,
  IconUsers,
} from "components/icons";
import { Image } from "components/image";
import { auth } from "config/firebase-config";
import { signOut } from "firebase/auth";
import { useClickOutside } from "hooks/useClickOutSide";
import useUnreadNotifications from "hooks/useUnreadNotifications";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "store";
import styled from "styled-components";
import { avatarDefault, getRoleName } from "utils/constants";

const UserMenuStyles = styled.div`
  position: relative;
  .user-menu__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 12px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--color-text);
    text-align: left;
    cursor: pointer;
  }
  .user-menu__trigger:hover,
  .user-menu__trigger[aria-expanded="true"] {
    background: var(--color-subtle);
  }
  .user-menu__avatar {
    position: relative;
    flex-shrink: 0;
    img {
      display: block;
      width: 32px;
      height: 32px;
      border-radius: 100rem;
      object-fit: cover;
    }
  }
  /* Unread notifications, while they are tucked inside the menu */
  .user-menu__dot {
    position: absolute;
    top: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-radius: 100rem;
    background: #e74c3c;
    border: 2px solid var(--color-surface);
  }
  .user-menu__text {
    flex: 1;
    min-width: 0;
    line-height: 1.3;
  }
  .user-menu__name,
  .user-menu__role {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .user-menu__name {
    font-size: 14px;
    font-weight: 600;
  }
  .user-menu__role {
    font-size: 12px;
    color: var(--color-muted);
  }
  .user-menu__chevron {
    display: flex;
    flex-shrink: 0;
    color: var(--color-muted);
    transition: transform 0.15s;
  }
  .user-menu__trigger[aria-expanded="true"] .user-menu__chevron {
    transform: rotate(180deg);
  }
  /* Opens upward from the bottom of the sidebar */
  .user-menu__popover {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + 8px);
    padding: 6px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
    z-index: 30;
  }
  .user-menu__head {
    padding: 8px 10px 10px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 6px;
  }
  .user-menu__email {
    font-size: 12px;
    color: var(--color-muted);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--color-text);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
  }
  .user-menu__item:hover,
  .user-menu__item:focus-visible {
    background: var(--color-subtle);
    outline: none;
  }
  .user-menu__badge {
    margin-left: auto;
    min-width: 20px;
    padding: 1px 6px;
    border-radius: 100rem;
    background: #e74c3c;
    color: white;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
  }
  .user-menu__divider {
    height: 1px;
    margin: 6px 0;
    background: var(--color-border);
  }
  .user-menu__item--danger {
    color: #e74c3c;
  }
  /* Icon rail: the trigger is just the avatar and the menu opens beside
     the rail (fixed, so the sidebar's scrolling doesn't clip it) */
  @media only screen and (max-width: 1024px) {
    .user-menu__trigger {
      justify-content: center;
      padding: 8px 0;
    }
    .user-menu__text,
    .user-menu__chevron {
      display: none;
    }
    .user-menu__popover {
      position: fixed;
      left: 80px;
      right: auto;
      bottom: 16px;
      width: 240px;
    }
  }
`;

const iconProps = { size: 18, color: "currentColor" };

// The signed-in user at the foot of the dashboard sidebar; opens their
// account menu (notifications, saved posts, profile, logout)
const UserMenu = () => {
  const user = useAuthStore((state) => state.user);
  const unread = useUnreadNotifications(user?.uid);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);
  const { pathname } = useLocation();
  useEffect(close, [pathname, close]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const name = user?.fullname || user?.displayName || "Your account";
  return (
    <UserMenuStyles ref={ref}>
      {open && (
        <div className="user-menu__popover" role="menu" aria-label="Account">
          <div className="user-menu__head">
            <div className="user-menu__name">{name}</div>
            {user?.email && (
              <div className="user-menu__email">{user.email}</div>
            )}
          </div>
          <Link
            to="/manage/notifications"
            className="user-menu__item"
            role="menuitem"
          >
            <IconBell {...iconProps} />
            Notifications
            {unread.count > 0 && (
              <span className="user-menu__badge">{unread.label}</span>
            )}
          </Link>
          <Link to="/manage/saved" className="user-menu__item" role="menuitem">
            <IconBookmark {...iconProps} />
            Saved
          </Link>
          <Link
            to="/manage/profile"
            className="user-menu__item"
            role="menuitem"
          >
            <IconProfile {...iconProps} />
            Profile settings
          </Link>
          {user?.username && (
            <Link
              to={`/profile/${user.username}`}
              className="user-menu__item"
              role="menuitem"
            >
              <IconUsers {...iconProps} />
              View public profile
            </Link>
          )}
          <div className="user-menu__divider" role="separator"></div>
          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={() => signOut(auth)}
          >
            <IconLogout {...iconProps} />
            Logout
          </button>
        </div>
      )}
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread.count
            ? `Account menu, ${unread.label} unread notifications`
            : "Account menu"
        }
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-menu__avatar">
          <Image src={user?.avatar} fallback={avatarDefault} resizeTo={96} />
          {unread.count > 0 && <span className="user-menu__dot"></span>}
        </span>
        <span className="user-menu__text">
          <span className="user-menu__name">{name}</span>
          <span className="user-menu__role">{getRoleName(user?.role)}</span>
        </span>
        <span className="user-menu__chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 15l6-6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </UserMenuStyles>
  );
};

export default UserMenu;
