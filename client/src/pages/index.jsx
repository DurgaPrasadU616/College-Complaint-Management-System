import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          College Complaint Management System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome back, {user.name}!
        </p>
        <div className="flex gap-4">
          <Link
            to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        College Complaint Management System
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl text-center">
        Report campus issues and track them through to resolution. A centralized
        platform for students and administrators.
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
