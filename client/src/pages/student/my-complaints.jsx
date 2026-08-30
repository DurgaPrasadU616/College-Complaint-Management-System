import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePlus, FileText } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { ListSkeleton } from "../../components/Skeleton/Skeleton";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await api.get("/complaints/mine");
        setComplaints(data);
      } catch (err) {
        console.error("Failed to load complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <ListSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Complaints
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {complaints.length} complaint{complaints.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <Link to="/student/new-complaint" className="btn-primary">
            <FilePlus className="w-4 h-4" />
            New Complaint
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No complaints yet</h3>
            <p className="text-slate-500 mb-6">
              Submit your first complaint to get started
            </p>
            <Link to="/student/new-complaint" className="btn-primary">
              Submit Your First Complaint
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c, i) => (
              <Link
                key={c._id}
                to={`/student/complaint/${c._id}`}
                className="card-hover p-5 block animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{c.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {c.description}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {c.category}
                  </span>
                  {c.location && (
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {c.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
