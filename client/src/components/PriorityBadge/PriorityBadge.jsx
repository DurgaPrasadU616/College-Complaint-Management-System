const priorityConfig = {
  low: { color: "bg-slate-50 text-slate-600 ring-slate-200", icon: "↓" },
  medium: { color: "bg-amber-50 text-amber-700 ring-amber-200", icon: "→" },
  high: { color: "bg-orange-50 text-orange-700 ring-orange-200", icon: "↑" },
  critical: { color: "bg-red-50 text-red-700 ring-red-200", icon: "!!" },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.low;
  const label = priority || "unknown";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${config.color}`}
    >
      <span className="text-[10px] leading-none">{config.icon}</span>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}
