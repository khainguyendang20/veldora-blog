import ThemeToggle from "components/layout/ThemeToggle";
import DashboardSidebar from "module/dashboard/DashboardSidebar";
import { dashboardSidebar } from "utils/constants";
import React, { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "store";

const LayoutDashboardStyles = styled.div`
  min-height: 100vh;
  background: var(--color-bg);
  .dashboard-main {
    margin-left: ${dashboardSidebar.width};
    /* Room at the bottom so the floating theme toggle never covers
       a form's last button */
    padding: 32px 40px 96px;
  }
  .dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  .dashboard-theme-toggle {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--color-border);
    border-radius: 100rem;
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transition:
      transform 0.15s,
      box-shadow 0.15s;
    .theme-toggle__icon {
      font-size: 20px;
    }
  }
  .dashboard-theme-toggle:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  }
  @media only screen and (max-width: 1024px) {
    .dashboard-main {
      margin-left: ${dashboardSidebar.railWidth};
      padding: 24px 20px 88px;
    }
  }
  @media only screen and (max-width: 640px) {
    .dashboard-main {
      padding: 16px 12px 80px;
    }
    .dashboard-theme-toggle {
      right: 16px;
      bottom: 16px;
    }
  }
`;

const LayoutDashboard = () => {
  const { user, isAuthLoading } = useAuthStore((state) => state);

  // Wait for Firebase to restore the session before deciding to redirect
  if (isAuthLoading) return null;

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LayoutDashboardStyles>
      <DashboardSidebar></DashboardSidebar>
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Suspense fallback={null}>
            <Outlet></Outlet>
          </Suspense>
        </div>
      </main>
      <ThemeToggle className="dashboard-theme-toggle"></ThemeToggle>
    </LayoutDashboardStyles>
  );
};

export default LayoutDashboard;
