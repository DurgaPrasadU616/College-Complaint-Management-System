import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-10 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}</h1>
          <p className="text-slate-500 mb-8">Ready to manage your campus complaints?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard")}
              className="btn-primary flex-1"
            >
              Go to Dashboard
            </button>
            <button onClick={logout} className="btn-secondary flex-1">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Campus Report</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-8 ring-1 ring-brand-100">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Trusted by 500+ students
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Report it.
            <br />
            <span className="gradient-text">Track it.</span>
            <br />
            Get it fixed.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A centralized platform for college students to report campus issues — from broken AC to Wi-Fi outages — and watch them get resolved in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register" className="btn-primary text-base px-8 py-3 rounded-xl shadow-lg shadow-brand-500/25">
              Submit a Complaint
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Sign In to Your Account
            </Link>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ),
                title: "Quick Submit",
                desc: "Report an issue in under a minute with category, location, and photos.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Live Tracking",
                desc: "Follow your complaint from submission through resolution, step by step.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Admin Triage",
                desc: "Administrators assign, prioritize, and resolve with full audit history.",
              },
            ].map((f, i) => (
              <div key={i} className="card p-6 group hover:shadow-card-hover transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm text-slate-400">
        Built for campus life. Complaints resolved, not ignored.
      </footer>
    </div>
  );
}
