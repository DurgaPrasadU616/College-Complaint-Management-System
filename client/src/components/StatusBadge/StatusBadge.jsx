const statusConfig = {
  submitted: {
    color: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  under_review: {
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  assigned: {
    color: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  in_progress: {
    color: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  resolved: {
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  closed: {
    color: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.submitted;
  const label = status?.replace(/_/g, " ") || "unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}
