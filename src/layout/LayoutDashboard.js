import Header from "components/layout/Header";
import DashboardSidebar from "module/dashboard/DashboardSidebar";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { useAuthStore } from "store";

const LayoutDashboardStyles = styled.div`
  .container {
    margin-top: ${(props) => props.theme.headerHeight};
  }
`;

const LayoutDashboard = () => {
  const { user } = useAuthStore((state) => state);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LayoutDashboardStyles>
      <Header></Header>
      <DashboardSidebar></DashboardSidebar>
      <div className="container">
        <Outlet></Outlet>
      </div>
    </LayoutDashboardStyles>
  );
};

export default LayoutDashboard;
