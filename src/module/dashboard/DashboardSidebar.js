import {
  IconBell,
  IconBook,
  IconBookmark,
  IconDashboard,
  IconLogout,
  IconTags,
  IconUsers,
} from "components/icons";
import { Image } from "components/image";
import ThemeToggle from "components/layout/ThemeToggle";
import { auth } from "config/firebase-config";
import { signOut } from "firebase/auth";
import useUnreadNotifications from "hooks/useUnreadNotifications";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import {
  avatarDefault,
  dashboardSidebar,
  getRoleName,
  isStaffRole,
  userRole,
} from "utils/constants";
import { useAuthStore } from "store";

// The dashboard has no page header: the sidebar carries the brand (a way
// back to the blog), the navigation and the signed-in user
const DashboardSidebarStyles = styled.nav`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: ${dashboardSidebar.width};
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  overflow-y: auto;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  z-index: 20;
  .sidebar__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 12px 20px;
    img {
      width: 32px;
      flex-shrink: 0;
    }
  }
  .sidebar__brand-title {
    font-size: 20px;
    font-weight: 700;
    color: ${(props) => props.theme.primary};
    white-space: nowrap;
  }
  .sidebar__nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sidebar__group {
    margin: 16px 12px 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .sidebar__group:first-child {
    margin-top: 0;
  }
  .sidebar__link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--color-text);
    font-size: 15px;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .sidebar__link:hover {
    background: var(--color-subtle);
  }
  .sidebar__link--active {
    background: rgba(41, 128, 185, 0.12);
    color: ${(props) => props.theme.primary};
  }
  .sidebar__link-icon {
    display: flex;
    flex-shrink: 0;
    width: 20px;
    justify-content: center;
    font-size: 18px;
  }
  .sidebar__badge {
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
  .sidebar__footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .sidebar__user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    min-width: 0;
    img {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      border-radius: 100rem;
      object-fit: cover;
    }
  }
  .sidebar__user:hover,
  .sidebar__user.sidebar__link--active {
    background: var(--color-subtle);
  }
  .sidebar__user-text {
    min-width: 0;
    line-height: 1.3;
  }
  .sidebar__user-name,
  .sidebar__user-role {
    display: block;
  }
  .sidebar__user-name {
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sidebar__user-role {
    font-size: 12px;
    color: var(--color-muted);
  }
  /* Tablets and phones: an icon rail; titles show as tooltips */
  @media only screen and (max-width: 1024px) {
    width: ${dashboardSidebar.railWidth};
    padding: 16px 10px;
    .sidebar__brand {
      justify-content: center;
      padding: 4px 0 16px;
    }
    .sidebar__brand-title,
    .sidebar__group,
    .sidebar__link-title,
    .sidebar__user-text {
      display: none;
    }
    .sidebar__link,
    .sidebar__user {
      justify-content: center;
      padding: 12px 0;
    }
    .sidebar__badge {
      position: absolute;
      top: 4px;
      right: 6px;
      margin: 0;
      min-width: 16px;
      padding: 0 4px;
    }
  }
`;

const iconProps = { size: 20, color: "currentColor" };

// Grouped links for the signed-in user's role
const getLinkGroups = (role) => {
  const groups = [
    {
      title: "Content",
      links: [
        {
          title: "Dashboard",
          url: "/manage/dashboard",
          icon: <IconDashboard {...iconProps} />,
        },
        {
          title: "Posts",
          url: "/manage/post",
          icon: <IconBook {...iconProps} />,
        },
      ],
    },
    {
      title: "Account",
      links: [
        {
          title: "Notifications",
          url: "/manage/notifications",
          icon: <IconBell {...iconProps} />,
          badge: "unread",
        },
        {
          title: "Saved",
          url: "/manage/saved",
          icon: <IconBookmark {...iconProps} />,
        },
      ],
    },
  ];
  if (isStaffRole(role)) {
    groups[0].links.push({
      title: "Categories",
      url: "/manage/category",
      icon: <IconTags {...iconProps} />,
    });
  }
  if (role === userRole.ADMIN) {
    groups.push({
      title: "Admin",
      links: [
        {
          title: "Users",
          url: "/manage/user",
          icon: <IconUsers {...iconProps} />,
        },
      ],
    });
  }
  return groups;
};

const linkClass =
  (base) =>
  ({ isActive }) =>
    isActive ? `${base} sidebar__link--active` : base;

const DashboardSidebar = () => {
  const user = useAuthStore((state) => state.user);
  const unread = useUnreadNotifications(user?.uid);
  const name = user?.fullname || user?.displayName || "Your profile";
  return (
    <DashboardSidebarStyles className="sidebar" aria-label="Dashboard">
      <Link to="/" className="sidebar__brand" title="Back to the blog">
        <img srcSet="/logo.png 2x" alt="" />
        <span className="sidebar__brand-title">Veldora Blog</span>
      </Link>
      <div className="sidebar__nav">
        {getLinkGroups(user?.role).map((group) => (
          <React.Fragment key={group.title}>
            <p className="sidebar__group">{group.title}</p>
            {group.links.map((link) => (
              <NavLink
                key={link.url}
                to={link.url}
                className={linkClass("sidebar__link")}
                title={link.title}
                aria-label={
                  link.badge && unread.count
                    ? `${link.title} (${unread.label} unread)`
                    : undefined
                }
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                <span className="sidebar__link-title">{link.title}</span>
                {link.badge && unread.count > 0 && (
                  <span className="sidebar__badge" aria-hidden="true">
                    {unread.label}
                  </span>
                )}
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="sidebar__footer">
        <ThemeToggle showLabel className="sidebar__link"></ThemeToggle>
        <NavLink
          to="/manage/profile"
          className={linkClass("sidebar__user")}
          title="Profile"
        >
          <Image src={user?.avatar} fallback={avatarDefault} resizeTo={96} />
          <span className="sidebar__user-text">
            <span className="sidebar__user-name">{name}</span>
            <span className="sidebar__user-role">
              {getRoleName(user?.role)}
            </span>
          </span>
        </NavLink>
        <button
          type="button"
          className="sidebar__link"
          title="Logout"
          onClick={() => signOut(auth)}
        >
          <span className="sidebar__link-icon">
            <IconLogout {...iconProps} />
          </span>
          <span className="sidebar__link-title">Logout</span>
        </button>
      </div>
    </DashboardSidebarStyles>
  );
};

export default DashboardSidebar;
