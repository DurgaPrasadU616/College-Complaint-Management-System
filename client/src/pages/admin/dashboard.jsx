import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import NotificationBell from "../../components/NotificationBell/NotificationBell";

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
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            to="/admin/complaints"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            View All Complaints
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Open</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.open || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-500">Closed</p>
          <p className="text-3xl font-bold text-emerald-600">{stats?.closed || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* By Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">By Status</h2>
          <div className="space-y-3">
            {stats?.byStatus?.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <StatusBadge status={item._id} />
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
            {(!stats?.byStatus || stats.byStatus.length === 0) && (
              <p className="text-gray-500 text-sm">No data</p>
            )}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">By Category</h2>
          <div className="space-y-3">
            {stats?.byCategory?.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item._id}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
            {(!stats?.byCategory || stats.byCategory.length === 0) && (
              <p className="text-gray-500 text-sm">No data</p>
            )}
          </div>
        </div>

        {/* By Priority */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">By Priority</h2>
          <div className="space-y-3">
            {stats?.byPriority?.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <PriorityBadge priority={item._id} />
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
            {(!stats?.byPriority || stats.byPriority.length === 0) && (
              <p className="text-gray-500 text-sm">No data</p>
            )}
          </div>
        </div>

        {/* By Department */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">By Department</h2>
          <div className="space-y-3">
            {stats?.byDepartment?.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item._id}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
            {(!stats?.byDepartment || stats.byDepartment.length === 0) && (
              <p className="text-gray-500 text-sm">No complaints assigned to departments yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      {stats?.recentComplaints?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Complaints</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Category</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Priority</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentComplaints.map((c) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link to={`/admin/complaint/${c._id}`} className="text-blue-600 hover:underline font-medium">
                        {c.title}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">{c.category}</td>
                    <td className="py-3"><StatusBadge status={c.status} /></td>
                    <td className="py-3 hidden sm:table-cell"><PriorityBadge priority={c.priority} /></td>
                    <td className="py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
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
