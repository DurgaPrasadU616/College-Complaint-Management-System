const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function PriorityBadge({ priority }) {
  const colorClass = priorityColors[priority] || "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${colorClass}`}>
      {priority || "unknown"}
    </span>
  );
}
