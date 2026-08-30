import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Search } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { ListSkeleton } from "../../components/Skeleton/Skeleton";

const STATUSES = [
  "",
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];
const CATEGORIES = [
  "",
  "Classroom",
  "Lab",
  "Hostel",
  "Wi-Fi/Network",
  "Infrastructure",
  "Transportation",
  "Cleanliness",
  "Other",
];
const PRIORITIES = ["", "low", "medium", "high", "critical"];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    page: 1,
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.priority) params.set("priority", filters.priority);
      params.set("page", filters.page);
      params.set("limit", "10");
      const { data } = await api.get(`/complaints?${params.toString()}`);
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              All Complaints
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pagination.total} total complaint{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/admin/dashboard" className="btn-ghost text-sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="input pl-10"
                  placeholder="Search complaints..."
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="input w-full sm:w-auto sm:min-w-[150px]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s
                    ? s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
                    : "All Statuses"}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="input w-full sm:w-auto sm:min-w-[150px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c || "All Categories"}
                </option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
              className="input w-full sm:w-auto sm:min-w-[140px]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p ? p.charAt(0).toUpperCase() + p.slice(1) : "All Priorities"}
                </option>
              ))}
            </select>
          </form>
        </div>

        {/* List */}
        {loading ? (
          <ListSkeleton count={5} />
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              No complaints found
            </h3>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c, i) => (
                      <tr
                        key={c._id}
                        className="hover:bg-slate-50/50 transition-colors animate-slide-up"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="px-6 py-3.5">
                          <Link
                            to={`/admin/complaint/${c._id}`}
                            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {c.submittedBy?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600">{c.category}</td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-3.5">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/tablet cards */}
            <div className="lg:hidden space-y-3">
              {complaints.map((c, i) => (
                <Link
                  key={c._id}
                  to={`/admin/complaint/${c._id}`}
                  className="card-hover p-5 block animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {c.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {c.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-500">
                          {c.submittedBy?.name || "Unknown"}
                        </span>
                        <span>{c.category}</span>
                        {c.location && <span>{c.location}</span>}
                        <span>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))
                  }
                  disabled={filters.page <= 1}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.min(pagination.pages, f.page + 1),
                    }))
                  }
                  disabled={filters.page >= pagination.pages}
                  className="btn-ghost text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
