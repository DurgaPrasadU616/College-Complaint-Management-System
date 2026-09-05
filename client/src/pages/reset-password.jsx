import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Shield, Eye, EyeOff, Check, X } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { resetPassword, loading } = useAuthStore();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.password) newErrors.password = "Password is required.";
    else {
      if (form.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        newErrors.password = "Password does not meet the required security rules.";
      }
    }

    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await resetPassword(token, form.password);
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        toast.error("Password reset link is invalid or has expired.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
    
    // Real-time password match validation
    if (e.target.name === "confirmPassword" && form.password) {
      if (e.target.value !== form.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match." }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
    if (e.target.name === "password" && form.confirmPassword) {
      if (e.target.value !== form.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match." }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: null }));
      }
    }
  };

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;
    return score; // Max 5
  };

  const strength = calculateStrength(form.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-brand-500", "bg-green-500"];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Create new password</h1>
          <p className="text-center text-slate-500 mb-8">
            Your new password must be different from previous used passwords.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reset-password" className="label text-sm font-medium text-slate-700 mb-1 block">
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`input w-full pr-10 ${errors.password ? "input-error" : ""}`}
                  placeholder="At least 8 characters"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full ${
                          i < strength ? strengthColors[strength - 1] : "bg-slate-200"
                        } transition-colors duration-300`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength < 3 ? "text-slate-500" : "text-green-600"}`}>
                    Password strength: <span className="font-medium">{strength > 0 ? strengthLabels[strength - 1] : ""}</span>
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="reset-confirm" className="label text-sm font-medium text-slate-700 mb-1 block">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input w-full pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                  placeholder="Re-enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> {errors.confirmPassword}
                </p>
              ) : form.confirmPassword && form.password === form.confirmPassword ? (
                <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Passwords match
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || (form.password && form.confirmPassword && form.password !== form.confirmPassword)}
              className="btn-primary w-full py-3 mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
