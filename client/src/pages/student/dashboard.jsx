import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import AppShell from "../../components/AppShell/AppShell";
import { DashboardSkeleton } from "../../components/Skeleton/Skeleton";

const statCardConfig = [
  {
    key: "total",
    label: "Total",
    gradient: "from-slate-500 to-slate-600",
    iconBg: "bg-slate-100",
    Icon: FileText,
    iconColor: "text-slate-500",
  },
  {
    key: "open",
    label: "Open",
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    Icon: Clock,
    iconColor: "text-blue-500",
  },
  {
    key: "resolved",
    label: "Resolved",
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100",
    Icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  {
    key: "closed",
    label: "Closed",
    gradient: "from-slate-400 to-slate-500",
    iconBg: "bg-slate-100",
    Icon: XCircle,
    iconColor: "text-slate-400",
  },
];

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
              Student Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of your submitted complaints
            </p>
          </div>
          <Link to="/student/new-complaint" className="btn-primary">
            <FilePlus className="w-4 h-4" />
            New Complaint
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCardConfig.map(({ key, label, gradient, iconBg, Icon, iconColor }) => (
            <div key={key} className="card overflow-hidden group">
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
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stats?.[key] || 0}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* By Status */}
        <div className="card p-6 mb-6">
          <h2 className="section-title mb-4">Complaints by Status</h2>
          {stats?.byStatus?.length > 0 ? (
            <div className="space-y-3">
              {stats.byStatus.map((item) => (
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
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-4">No complaints yet</p>
              <Link to="/student/new-complaint" className="btn-primary text-sm">
                Submit Your First Complaint
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/student/my-complaints" className="card-hover p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-100 transition-colors flex-shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  My Complaints
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  View and track all your submitted complaints
                </p>
              </div>
            </div>
          </Link>
          <Link to="/student/new-complaint" className="card-hover p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors flex-shrink-0">
                <FilePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                  New Complaint
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Report a new issue or problem
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
