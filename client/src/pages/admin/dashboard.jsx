import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  List,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import AppShell from "../../components/AppShell/AppShell";
import { DashboardSkeleton } from "../../components/Skeleton/Skeleton";

function AdminStatCard({ label, value, gradient, iconBg, Icon, iconColor }) {
  return (
    <div className="card overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/stats/dashboard");
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of all campus complaints
            </p>
          </div>
          <Link to="/admin/complaints" className="btn-primary">
            <List className="w-4 h-4" />
            View All Complaints
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AdminStatCard
            label="Total"
            value={stats?.total || 0}
            gradient="from-slate-500 to-slate-600"
            iconBg="bg-slate-100"
            Icon={FileText}
            iconColor="text-slate-500"
          />
          <AdminStatCard
            label="Open"
            value={stats?.open || 0}
            gradient="from-blue-500 to-blue-600"
            iconBg="bg-blue-100"
            Icon={Clock}
            iconColor="text-blue-500"
          />
          <AdminStatCard
            label="Resolved"
            value={stats?.resolved || 0}
            gradient="from-emerald-500 to-emerald-600"
            iconBg="bg-emerald-100"
            Icon={CheckCircle2}
            iconColor="text-emerald-500"
          />
          <AdminStatCard
            label="Closed"
            value={stats?.closed || 0}
            gradient="from-slate-400 to-slate-500"
            iconBg="bg-slate-100"
            Icon={XCircle}
            iconColor="text-slate-400"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* By Status */}
          <div className="card p-6">
            <h2 className="section-title mb-4">By Status</h2>
            <div className="space-y-2">
              {stats?.byStatus?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <StatusBadge status={item._id} />
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!stats?.byStatus || stats.byStatus.length === 0) && (
                <p className="text-slate-500 text-sm py-4 text-center">No data</p>
              )}
            </div>
          </div>

          {/* By Category */}
          <div className="card p-6">
            <h2 className="section-title mb-4">By Category</h2>
            <div className="space-y-2">
              {stats?.byCategory?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm text-slate-700">{item._id}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!stats?.byCategory || stats.byCategory.length === 0) && (
                <p className="text-slate-500 text-sm py-4 text-center">No data</p>
              )}
            </div>
          </div>

          {/* By Priority */}
          <div className="card p-6">
            <h2 className="section-title mb-4">By Priority</h2>
            <div className="space-y-2">
              {stats?.byPriority?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <PriorityBadge priority={item._id} />
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!stats?.byPriority || stats.byPriority.length === 0) && (
                <p className="text-slate-500 text-sm py-4 text-center">No data</p>
              )}
            </div>
          </div>

          {/* By Department */}
          <div className="card p-6">
            <h2 className="section-title mb-4">By Department</h2>
            <div className="space-y-2">
              {stats?.byDepartment?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm text-slate-700">{item._id}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
              {(!stats?.byDepartment || stats.byDepartment.length === 0) && (
                <p className="text-slate-500 text-sm py-4 text-center">
                  No complaints assigned yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        {stats?.recentComplaints?.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title mb-4">Recent Complaints</h2>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Title
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
                  {stats.recentComplaints.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          to={`/admin/complaint/${c._id}`}
                          className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          {c.title}
                        </Link>
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
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {stats.recentComplaints.map((c) => (
                <Link
                  key={c._id}
                  to={`/admin/complaint/${c._id}`}
                  className="block p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <h4 className="font-medium text-slate-900 text-sm truncate">
                    {c.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
