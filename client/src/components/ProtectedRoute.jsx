import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles = []}) {
  // 🟢 Fixed: Read "accessToken" instead of generic "token"
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  console.log("--- LIVE GUARD CHECK ---");
  console.log("Token Present:", !!token);
  console.log("Role in Storage:", `"${userRole}"`); 
  console.log("Allowed Roles:", allowedRoles);

  // 1. Authentication Check
  if (!token) {
    console.error("Guard Denied: No accessToken found. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  // 2. Authorization Check (Case-Insensitive)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole) {
      console.error("Guard Denied: userRole is completely missing/null in storage.");
      return <Navigate to="/" replace />;
    }

    const lowerAllowed = allowedRoles.map(role => role.toLowerCase());
    const lowerUserRole = userRole.toLowerCase().trim(); 

    if (!lowerAllowed.includes(lowerUserRole)) {
      console.error(`Guard Denied: Role "${userRole}" does not match allowed paths:`, allowedRoles);
      return <Navigate to="/" replace />;
    }
  }

  // 3. Success
  return children;
}