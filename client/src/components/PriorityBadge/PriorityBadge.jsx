import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from "lucide-react";

const priorityConfig = {
  low: {
    color: "bg-slate-50 text-slate-600 ring-slate-200",
    Icon: ArrowDown,
  },
  medium: {
    color: "bg-blue-50 text-blue-700 ring-blue-200",
    Icon: ArrowRight,
  },
  high: {
    color: "bg-orange-50 text-orange-700 ring-orange-200",
    Icon: ArrowUp,
  },
  critical: {
    color: "bg-red-50 text-red-700 ring-red-200",
    Icon: AlertTriangle,
  },
};

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.low;
  const label = priority || "unknown";
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${config.color}`}
    >
      <Icon className="w-3 h-3" />
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}
