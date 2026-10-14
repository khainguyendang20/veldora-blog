import {
  IconBell,
  IconBook,
  IconBookmark,
  IconDashboard,
  IconLogout,
  IconProfile,
  IconTags,
  IconUsers,
} from "components/icons";
import { auth } from "config/firebase-config";
import { signOut } from "firebase/auth";
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { dashboardSidebar, isStaffRole, userRole } from "utils/constants";
import { useAuthStore } from "store";

const DashboardSidebarStyles = styled.nav`
  position: fixed;
  top: ${(props) => props.theme.headerHeight};
  bottom: 0;
  left: 0;
  width: ${dashboardSidebar.width};
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 12px;
  overflow-y: auto;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  z-index: 20;
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
  }
  .sidebar__logout {
    margin-top: auto;
  }
  /* Tablets and phones: an icon rail; titles show as tooltips */
  @media only screen and (max-width: 1024px) {
    width: ${dashboardSidebar.railWidth};
    padding: 16px 10px;
    .sidebar__group,
    .sidebar__link-title {
      display: none;
    }
    .sidebar__link {
      justify-content: center;
      padding: 12px 0;
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
        },
        {
          title: "Saved",
          url: "/manage/saved",
          icon: <IconBookmark {...iconProps} />,
        },
        {
          title: "Profile",
          url: "/manage/profile",
          icon: <IconProfile {...iconProps} />,
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

const DashboardSidebar = () => {
  const role = useAuthStore((state) => state.user?.role);
  return (
    <DashboardSidebarStyles className="sidebar" aria-label="Dashboard">
      {getLinkGroups(role).map((group) => (
        <React.Fragment key={group.title}>
          <p className="sidebar__group">{group.title}</p>
          {group.links.map((link) => (
            <NavLink
              key={link.url}
              to={link.url}
              className={({ isActive }) =>
                isActive
                  ? "sidebar__link sidebar__link--active"
                  : "sidebar__link"
              }
              title={link.title}
            >
              <span className="sidebar__link-icon">{link.icon}</span>
              <span className="sidebar__link-title">{link.title}</span>
            </NavLink>
          ))}
        </React.Fragment>
      ))}
      <button
        type="button"
        className="sidebar__link sidebar__logout"
        title="Logout"
        onClick={() => signOut(auth)}
      >
        <span className="sidebar__link-icon">
          <IconLogout {...iconProps} />
        </span>
        <span className="sidebar__link-title">Logout</span>
      </button>
    </DashboardSidebarStyles>
  );
};

export default DashboardSidebar;
