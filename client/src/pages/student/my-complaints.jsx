import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FilePlus, FileText, Search, X, ArrowUpDown } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { ListSkeleton } from "../../components/Skeleton/Skeleton";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "updated", label: "Recently Updated" },
];

function readFiltersFromURL(searchParams) {
  return {
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "newest",
    page: Math.max(1, parseInt(searchParams.get("page")) || 1),
  };
}

export default function MyComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFiltersFromURL(searchParams));
  const [searchInput, setSearchInput] = useState(filters.search);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
      params.set("page", filters.page);
      params.set("limit", "10");

      const { data } = await api.get(`/complaints/mine?${params.toString()}`);
      setComplaints(data.complaints || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0, limit: 10 });
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set("search", filters.search);
    if (filters.status) newParams.set("status", filters.status);
    if (filters.category) newParams.set("category", filters.category);
    if (filters.sort && filters.sort !== "newest") newParams.set("sort", filters.sort);
    if (filters.page > 1) newParams.set("page", filters.page);
    setSearchParams(newParams, { replace: true });
  }, [filters, setSearchParams]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", status: "", category: "", sort: "newest", page: 1 });
  };

  const hasActiveFilters = filters.search || filters.status || filters.category;

  const goToPage = (p) => {
    setFilters((f) => ({ ...f, page: p }));
  };

  const getPageNumbers = () => {
    const { page, pages } = pagination;
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums = [];
    if (page <= 3) {
      for (let i = 1; i <= 5; i++) nums.push(i);
    } else if (page >= pages - 2) {
      for (let i = pages - 4; i <= pages; i++) nums.push(i);
    } else {
      for (let i = page - 2; i <= page + 2; i++) nums.push(i);
    }
    return nums.filter((n) => n >= 1 && n <= pages);
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Complaints</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage your submitted issues
            </p>
          </div>
          <Link to="/student/new-complaint" className="btn-primary flex-shrink-0">
            <FilePlus className="w-4 h-4" />
            New Complaint
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or description..."
                className="input pl-9 w-full pr-9"
                value={searchInput}
                onChange={handleSearchChange}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setFilters((f) => ({ ...f, search: "", page: 1 }));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="Classroom">Classroom</option>
                <option value="Lab">Lab</option>
                <option value="Hostel">Hostel</option>
                <option value="Wi-Fi/Network">Wi-Fi/Network</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Transportation">Transportation</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Other">Other</option>
              </select>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="input pl-9"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <ListSkeleton />
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center animate-slide-up">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {hasActiveFilters
                ? "No complaints match your filters"
                : "You haven't submitted any complaints yet"}
            </h3>
            <p className="text-slate-500 mb-6">
              {hasActiveFilters
                ? "Try adjusting your search criteria"
                : "Submit your first complaint to get started"}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-ghost">
                Clear Filters
              </button>
            ) : (
              <Link to="/student/new-complaint" className="btn-primary">
                Submit Your First Complaint
              </Link>
            )}
          </div>
        ) : (
          <>
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          #{c._id.substring(c._id.length - 6)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{c.title}</h3>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {c.category}
                    </span>
                    {c.assignedTo?.name && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        Assigned to: {c.assignedTo.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Updated {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 mt-6 pt-6 gap-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {(pagination.page - 1) * (pagination.limit || 10) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900">
                    {Math.min(pagination.page * (pagination.limit || 10), pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900">{pagination.total}</span> results
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((num) => (
                    <button
                      key={num}
                      onClick={() => goToPage(num)}
                      className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                        num === pagination.page
                          ? "bg-brand-600 text-white font-medium"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
