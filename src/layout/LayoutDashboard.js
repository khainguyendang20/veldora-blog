import Header from "components/layout/Header";
import DashboardSidebar from "module/dashboard/DashboardSidebar";
import React, { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "store";

const LayoutDashboardStyles = styled.div`
  .container {
    margin-top: ${(props) => props.theme.headerHeight};
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
      <div className="container">
        <Suspense fallback={null}>
          <Outlet></Outlet>
        </Suspense>
      </div>
    </LayoutDashboardStyles>
  );
};

export default LayoutDashboard;
