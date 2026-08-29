import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"} replace />;
  }

  return children;
}
