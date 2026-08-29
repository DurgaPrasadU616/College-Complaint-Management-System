const statusColors = {
  submitted: "bg-gray-100 text-gray-700",
  under_review: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs px-2 py-1 rounded ${colorClass}`}>
      {status?.replace(/_/g, " ") || "unknown"}
    </span>
  );
}
