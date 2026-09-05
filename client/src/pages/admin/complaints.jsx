import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LayoutDashboard, Search, Inbox, Users, UserCheck, ArrowUpDown, X } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { ListSkeleton } from "../../components/Skeleton/Skeleton";
import useAuthStore from "../../store/authStore";

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
    priority: searchParams.get("priority") || "",
    sort: searchParams.get("sort") || "newest",
    page: Math.max(1, parseInt(searchParams.get("page")) || 1),
  };
}

export default function AdminComplaints() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "my_queue");
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => readFiltersFromURL(searchParams));
  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);

      if (activeTab === "my_queue" && user) params.set("assignedTo", user._id || user.id);
      if (activeTab === "unassigned") params.set("unassigned", "true");

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
  }, [filters, activeTab, user]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.search) newParams.set("search", filters.search);
    if (filters.status) newParams.set("status", filters.status);
    if (filters.category) newParams.set("category", filters.category);
    if (filters.priority) newParams.set("priority", filters.priority);
    if (filters.sort && filters.sort !== "newest") newParams.set("sort", filters.sort);
    if (filters.page > 1) newParams.set("page", filters.page);
    if (activeTab !== "my_queue") newParams.set("tab", activeTab);
    setSearchParams(newParams, { replace: true });
  }, [filters, activeTab, setSearchParams]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", status: "", category: "", priority: "", sort: "newest", page: 1 });
  };

  const hasActiveFilters = filters.search || filters.status || filters.category || filters.priority;

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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Complaint Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {pagination.total} complaint{pagination.total !== 1 ? "s" : ""} in this view
            </p>
          </div>
          <Link to="/admin/dashboard" className="btn-ghost text-sm flex-shrink-0">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6 pb-[1px]">
          {[
            { key: "my_queue", label: "My Queue", Icon: UserCheck },
            { key: "unassigned", label: "Unassigned", Icon: Inbox },
            { key: "all", label: "All Complaints", Icon: Users },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="input pl-10"
                  placeholder="Search by title or description..."
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
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="input"
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
                className="input"
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
                className="input"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p ? p.charAt(0).toUpperCase() + p.slice(1) : "All Priorities"}
                  </option>
                ))}
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
            </div>
          </form>
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2">
              <button onClick={clearFilters} className="btn-ghost text-xs text-red-500 hover:bg-red-50 hover:text-red-600">
                <X className="w-3 h-3 mr-1" />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <ListSkeleton count={5} />
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center animate-slide-up">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No complaints found</h3>
            <p className="text-slate-500 mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or filter criteria."
                : activeTab === "my_queue"
                  ? "You have no complaints assigned to you."
                  : "No complaints match the current view."}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-ghost">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden xl:block card overflow-hidden">
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
                        Assigned To
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
                            className="font-medium text-brand-600 hover:text-brand-700 hover:underline line-clamp-1"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">
                          {c.submittedBy?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 whitespace-nowrap">
                          {c.assignedTo?.name ? (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                              {c.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-6 py-3.5">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/tablet cards */}
            <div className="xl:hidden space-y-3">
              {complaints.map((c, i) => (
                <Link
                  key={c._id}
                  to={`/admin/complaint/${c._id}`}
                  className="card-hover p-5 block animate-slide-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          #{c._id.substring(c._id.length - 6)}
                        </span>
                        {c.assignedTo?.name ? (
                          <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                            {c.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 truncate">{c.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">
                        <span className="font-medium text-slate-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {c.submittedBy?.name || "Unknown"}
                        </span>
                        <span>{c.category}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
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
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 mt-6 pt-6 gap-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
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
