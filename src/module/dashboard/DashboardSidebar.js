import {
  IconBook,
  IconDashboard,
  IconTags,
  IconUsers,
} from "components/icons";
import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { dashboardSidebar, isStaffRole, userRole } from "utils/constants";
import { useAuthStore } from "store";
import UserMenu from "./UserMenu";

// The dashboard has no page header: the sidebar carries the brand (a way
// back to the blog), the navigation and the signed-in user's menu
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
  .sidebar__footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
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
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                <span className="sidebar__link-title">{link.title}</span>
              </NavLink>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="sidebar__footer">
        <UserMenu />
      </div>
    </DashboardSidebarStyles>
  );
};

export default DashboardSidebar;
