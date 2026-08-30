import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FolderOpen,
} from "lucide-react";

const statCardConfig = {
  total: {
    gradient: "from-slate-500 to-slate-600",
    iconBg: "bg-slate-100",
    Icon: FileText,
    iconColor: "text-slate-500",
  },
  open: {
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100",
    Icon: Clock,
    iconColor: "text-blue-500",
  },
  resolved: {
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100",
    Icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  closed: {
    gradient: "from-slate-400 to-slate-500",
    iconBg: "bg-slate-100",
    Icon: XCircle,
    iconColor: "text-slate-400",
  },
};

export default function StatsWidgets({ stats }) {
  const items = [
    { key: "total", label: "Total", value: stats?.total || 0 },
    { key: "open", label: "Open", value: stats?.open || 0 },
    { key: "resolved", label: "Resolved", value: stats?.resolved || 0 },
    { key: "closed", label: "Closed", value: stats?.closed || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ key, label, value }) => {
        const config = statCardConfig[key];
        const { Icon } = config;
        return (
          <div key={key} className="card overflow-hidden group">
            <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.iconBg}`}
                >
                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                {value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
