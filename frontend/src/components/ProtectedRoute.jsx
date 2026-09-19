import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // User is not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in
  return <Outlet />;
};

export default ProtectedRoute;
