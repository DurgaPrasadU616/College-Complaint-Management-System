import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Shield, AlertCircle } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated, user, clearError } = useAuthStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length > 100) newErrors.name = "Must be under 100 characters";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Must be a valid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "At least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate(data.user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
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

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 mb-8">Join as a student to start reporting issues</p>

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reg-name" className="label">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`input ${errors.name ? "input-error" : ""}`}
                placeholder="John Doe"
                autoFocus
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-email" className="label">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="you@college.edu"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-password" className="label">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="label">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden lg:flex flex-1 gradient-accent items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <rect
              x="50"
              y="50"
              width="300"
              height="300"
              rx="20"
              stroke="white"
              strokeWidth="0.5"
            />
            <rect
              x="100"
              y="100"
              width="200"
              height="200"
              rx="12"
              stroke="white"
              strokeWidth="0.5"
            />
            <rect
              x="150"
              y="150"
              width="100"
              height="100"
              rx="8"
              stroke="white"
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <div className="relative text-center text-white max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Your campus, your voice</h2>
          <p className="text-white/70 leading-relaxed">
            Register in seconds and start making a difference in your college community.
          </p>
        </div>
      </div>
    </div>
  );
}
