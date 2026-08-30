import StatusBadge from "../StatusBadge/StatusBadge";
import PriorityBadge from "../PriorityBadge/PriorityBadge";
import { MapPin, Tag, Calendar } from "lucide-react";

export default function ComplaintCard({ complaint, to, index = 0 }) {
  return (
    <div
      className="card-hover p-5 block animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{complaint.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {complaint.description}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
        {complaint.submittedBy?.name && (
          <span className="font-medium text-slate-500">{complaint.submittedBy.name}</span>
        )}
        <span className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {complaint.category}
        </span>
        {complaint.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {complaint.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
