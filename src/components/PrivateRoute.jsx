import React from "react";
import { Navigate } from "react-router-dom";
import { checkTokenValidity } from "../api/api"; // Hàm kiểm tra token từ API

const PrivateRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");

  // Kiểm tra token
  if (!token || !checkTokenValidity(token)) {
    return <Navigate to="/" replace />;
  }

  return Component;
};

export default PrivateRoute;
