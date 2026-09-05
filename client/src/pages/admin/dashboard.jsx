import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  List,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { DashboardSkeleton } from "../../components/Skeleton/Skeleton";

const STATUS_COLORS = {
  submitted: "bg-blue-500",
  under_review: "bg-amber-500",
  assigned: "bg-indigo-500",
  in_progress: "bg-cyan-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-400",
};

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function StatCard({ label, value, gradient, iconBg, Icon, iconColor, subtitle }) {
  return (
    <div className="card overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium text-slate-500">{label}</span>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-slate-600 w-24 sm:w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-900 tabular-nums w-8 text-right">
        {count}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/stats/dashboard");
      setStats(data);
    } catch (err) {
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="page-container">
          <div className="card p-12 text-center animate-slide-up">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={fetchStats} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const total = stats?.total || 0;
  const byStatus = stats?.byStatus || [];
  const byCategory = stats?.byCategory || [];
  const byPriority = stats?.byPriority || [];

  const statusMap = {};
  byStatus.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  return (
    <AppShell>
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of all campus complaints</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchStats}
              className="btn-ghost text-sm"
              title="Refresh dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/admin/complaints" className="btn-primary">
              <List className="w-4 h-4" />
              View All Complaints
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="Total"
            value={total}
            gradient="from-slate-500 to-slate-600"
            iconBg="bg-slate-100"
            Icon={FileText}
            iconColor="text-slate-500"
          />
          <StatCard
            label="Open"
            value={stats?.open || 0}
            gradient="from-blue-500 to-blue-600"
            iconBg="bg-blue-100"
            Icon={Clock}
            iconColor="text-blue-500"
            subtitle="Needs attention"
          />
          <StatCard
            label="Resolved"
            value={stats?.resolved || 0}
            gradient="from-emerald-500 to-emerald-600"
            iconBg="bg-emerald-100"
            Icon={CheckCircle2}
            iconColor="text-emerald-500"
          />
          <StatCard
            label="Closed"
            value={stats?.closed || 0}
            gradient="from-slate-400 to-slate-500"
            iconBg="bg-slate-100"
            Icon={XCircle}
            iconColor="text-slate-400"
          />
          <StatCard
            label="Unassigned"
            value={stats?.unassigned || 0}
            gradient="from-amber-500 to-orange-500"
            iconBg="bg-amber-100"
            Icon={UserCheck}
            iconColor="text-amber-500"
            subtitle="Awaiting assignment"
          />
          <StatCard
            label="Urgent"
            value={stats?.urgent?.length || 0}
            gradient="from-red-500 to-rose-600"
            iconBg="bg-red-100"
            Icon={AlertTriangle}
            iconColor="text-red-500"
            subtitle="High / Critical"
          />
        </div>

        {/* Distribution Panels */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* By Status */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">By Status</h2>
            <div className="space-y-1">
              {["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"].map(
                (s) => (
                  <DistributionBar
                    key={s}
                    label={STATUS_LABELS[s]}
                    count={statusMap[s] || 0}
                    total={total}
                    color={STATUS_COLORS[s]}
                  />
                )
              )}
            </div>
          </div>

          {/* By Category */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">By Category</h2>
            <div className="space-y-1">
              {byCategory.length > 0 ? (
                byCategory
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <DistributionBar
                      key={item._id}
                      label={item._id}
                      count={item.count}
                      total={total}
                      color="bg-brand-500"
                    />
                  ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No complaints yet"
                  description="Data will appear here once complaints are submitted"
                />
              )}
            </div>
          </div>

          {/* By Priority */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">By Priority</h2>
            <div className="space-y-1">
              {byPriority.length > 0 ? (
                byPriority
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2, low: 3 };
                    return (order[a._id] ?? 4) - (order[b._id] ?? 4);
                  })
                  .map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-1.5">
                      <PriorityBadge priority={item._id} />
                      <span className="font-semibold text-slate-900 tabular-nums">{item.count}</span>
                    </div>
                  ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No data"
                  description="Priority distribution will appear here"
                />
              )}
            </div>
          </div>

          {/* By Department */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">By Department</h2>
            <div className="space-y-1">
              {stats?.byDepartment?.length > 0 ? (
                stats.byDepartment.map((item) => (
                  <DistributionBar
                    key={item._id}
                    label={item._id}
                    count={item.count}
                    total={total}
                    color="bg-purple-500"
                  />
                ))
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No departments"
                  description="Department distribution will appear once complaints are assigned"
                />
              )}
            </div>
          </div>
        </div>

        {/* Urgent Complaints */}
        {stats?.urgent?.length > 0 && (
          <div className="card p-5 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Urgent Complaints
              </h2>
              <Link
                to="/admin/complaints?priority=high&sort=newest"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {stats.urgent.map((c) => (
                <Link
                  key={c._id}
                  to={`/admin/complaint/${c._id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        #{c._id.substring(c._id.length - 6)}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <h4 className="font-medium text-slate-900 text-sm truncate">{c.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{c.category}</span>
                      <span>&middot;</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Staff Workload + Recent Complaints */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Staff Workload */}
          <div className="card p-5 sm:p-6">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              Staff Workload
            </h2>
            {stats?.staffWorkload?.length > 0 ? (
              <div className="space-y-3">
                {stats.staffWorkload.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">
                          {s.open} open &middot; {s.resolved} resolved
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {s.total}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UserCheck}
                title="No assigned complaints"
                description="Staff workload will appear here once complaints are assigned"
              />
            )}
          </div>

          {/* Recent Complaints */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Recent Complaints</h2>
              <Link
                to="/admin/complaints?sort=newest"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {stats?.recentComplaints?.length > 0 ? (
              <div className="space-y-2">
                {stats.recentComplaints.map((c) => (
                  <Link
                    key={c._id}
                    to={`/admin/complaint/${c._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          #{c._id.substring(c._id.length - 6)}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-900 text-sm truncate">{c.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{c.category}</span>
                        <span>&middot;</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No complaints yet"
                description="Recent complaints will appear here"
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
