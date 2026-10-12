import Heading from "components/layout/Heading";
import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "store";

// Route guard: renders nested routes only for users whose role is listed.
// UI only — Firestore Security Rules must enforce the same permissions.
const RequireRole = ({ roles }) => {
  const role = useAuthStore((state) => state.user?.role);

  if (!roles.includes(role)) {
    return (
      <>
        <Heading>Access Denied</Heading>
        <p>You do not have permission to access this page.</p>
      </>
    );
  }

  return <Outlet />;
};

export default RequireRole;
