import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import KnowledgeHub from "./pages/KnowledgeHub";
import AICopilot from "./pages/AICopilot";
import UserManagement from "./pages/UserManagement";
import { SystemMap } from "./pages/SystemMap";
import LandingPage from "./pages/LandingPage";
import Settings from "./pages/Settings";
import MaintenancePage from "./pages/Maintenance";
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from "./components/ProtectedRoute";

// 🟢 Define an array of all valid system roles for common routes
const ALL_ROLES = ['Technician', 'Engineer', 'Manager', 'Compliance_Officer', 'Admin'];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- General Protected Routes (Any valid system role can access) --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/knowledge" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <KnowledgeHub />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/system-map" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <SystemMap />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-copilot" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <AICopilot />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute allowedRoles={ALL_ROLES}>
              <MaintenancePage />
            </ProtectedRoute>
          } 
        />

        {/* --- Role-Protected Route (ONLY Admins can access) --- */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />

        {/* --- Fallback Route --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;