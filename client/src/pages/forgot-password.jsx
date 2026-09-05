import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Shield, ArrowLeft } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function ForgotPassword() {
  const { forgotPassword, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
      // Removed the toast since we show a dedicated success UI state
    } catch (err) {
      if (err.response?.status === 429) {
         setError("Too many reset attempts. Please try again later.");
      } else if (!err.response || err.response?.status >= 500) {
         setError("Network or server error. Please try again.");
      } else {
         // Generic fallback just in case
         setError("Failed to process request. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            No worries, we'll send you reset instructions.
          </p>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Check your email</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                If an account exists with this email, you will receive password reset instructions at <span className="font-medium text-slate-900">{email}</span>.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-brand-600 hover:text-brand-700 font-medium text-sm"
              >
                Click to try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className={`input ${error ? "input-error" : ""}`}
                  placeholder="you@college.edu"
                  autoFocus
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
