import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import NotificationBell from "../../components/NotificationBell/NotificationBell";

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/stats/student");
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
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            to="/student/new-complaint"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + New Complaint
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

      {/* By Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Complaints by Status</h2>
        {stats?.byStatus?.length > 0 ? (
          <div className="space-y-3">
            {stats.byStatus.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <StatusBadge status={item._id} />
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't submitted any complaints yet.</p>
            <Link
              to="/student/new-complaint"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Submit Your First Complaint
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/student/my-complaints"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition block"
        >
          <h3 className="font-semibold text-gray-900">My Complaints</h3>
          <p className="text-sm text-gray-500 mt-1">View and track all your submitted complaints</p>
        </Link>
        <Link
          to="/student/new-complaint"
          className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition block"
        >
          <h3 className="font-semibold text-gray-900">New Complaint</h3>
          <p className="text-sm text-gray-500 mt-1">Report a new issue or problem</p>
        </Link>
      </div>
    </div>
  );
}
