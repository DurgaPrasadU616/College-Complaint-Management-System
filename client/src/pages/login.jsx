import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Shield, AlertCircle } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, user, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Must be a valid email";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 gradient-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Campus Report</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="you@college.edu"
                autoFocus
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-1 gradient-accent items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="50" stroke="white" strokeWidth="0.5" />
            <line x1="50" y1="200" x2="350" y2="200" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="50" x2="200" y2="350" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative text-center text-white max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">One complaint away from a fix</h2>
          <p className="text-white/70 leading-relaxed">
            Every report is logged, assigned, and tracked — so nothing falls through the
            cracks.
          </p>
        </div>
      </div>
    </div>
  );
}
