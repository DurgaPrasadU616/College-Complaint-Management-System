import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import NotificationBell from "../../components/NotificationBell/NotificationBell";

function AdminStatCard({ label, value, gradient, icon }) {
  return (
    <div className="card overflow-hidden">
      <div className={`h-1 ${gradient}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50">
            {icon}
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
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of all campus complaints</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link to="/admin/complaints" className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Complaints
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AdminStatCard label="Total" value={stats?.total || 0} gradient="bg-gradient-to-r from-slate-500 to-slate-600"
          icon={<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <AdminStatCard label="Open" value={stats?.open || 0} gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          icon={<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <AdminStatCard label="Resolved" value={stats?.resolved || 0} gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
          icon={<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <AdminStatCard label="Closed" value={stats?.closed || 0} gradient="bg-gradient-to-r from-teal-500 to-teal-600"
          icon={<svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* By Status */}
        <div className="card p-6">
          <h2 className="section-title mb-4">By Status</h2>
          <div className="space-y-2">
            {stats?.byStatus?.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <StatusBadge status={item._id} />
                <span className="font-semibold text-slate-900 tabular-nums">{item.count}</span>
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
              <div key={item._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-700">{item._id}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{item.count}</span>
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
              <div key={item._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <PriorityBadge priority={item._id} />
                <span className="font-semibold text-slate-900 tabular-nums">{item.count}</span>
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
              <div key={item._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-700">{item._id}</span>
                <span className="font-semibold text-slate-900 tabular-nums">{item.count}</span>
              </div>
            ))}
            {(!stats?.byDepartment || stats.byDepartment.length === 0) && (
              <p className="text-slate-500 text-sm py-4 text-center">No complaints assigned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      {stats?.recentComplaints?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4">Recent Complaints</h2>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <Link to={`/admin/complaint/${c._id}`} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 hidden sm:table-cell">{c.category}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3.5 hidden sm:table-cell"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-6 py-3.5 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
