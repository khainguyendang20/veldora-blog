import Header from "components/layout/Header";
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
    margin-top: ${(props) => props.theme.headerHeight};
    margin-left: ${dashboardSidebar.width};
    padding: 32px 40px 64px;
  }
  .dashboard-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  @media only screen and (max-width: 1024px) {
    .dashboard-main {
      margin-left: ${dashboardSidebar.railWidth};
      padding: 24px 20px 48px;
    }
  }
  @media only screen and (max-width: 640px) {
    .dashboard-main {
      padding: 16px 12px 40px;
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
      <Header></Header>
      <DashboardSidebar></DashboardSidebar>
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Suspense fallback={null}>
            <Outlet></Outlet>
          </Suspense>
        </div>
      </main>
    </LayoutDashboardStyles>
  );
};

export default LayoutDashboard;
