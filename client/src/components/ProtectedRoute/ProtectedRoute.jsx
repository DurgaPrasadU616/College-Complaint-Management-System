import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import useAuthStore from "../../store/authStore";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, token, loadUser } = useAuthStore();
  const [checking, setChecking] = useState(() => !user && !!token);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      if (!user && token) {
        await loadUser();
      }
      if (isMounted) {
        setChecking(false);
      }
    };
    check();
    return () => {
      isMounted = false;
    };
  }, [loadUser, user, token]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="card p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">
            You don't have permission to access this page. This area is restricted to{" "}
            <span className="font-semibold">{role}s</span> only.
          </p>
          <button
            onClick={() =>
              (window.location.href =
                user.role === "admin" ? "/admin/dashboard" : "/student/dashboard")
            }
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
