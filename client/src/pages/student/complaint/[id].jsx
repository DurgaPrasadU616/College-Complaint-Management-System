import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";

export default function StudentComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const { data } = await api.get(`/complaints/${id}`);
        setComplaint(data.complaint);
        setUpdates(data.updates);
      } catch (err) {
        toast.error("Failed to load complaint");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded-lg" />
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-center">
        <p className="text-gray-500 mb-4">Complaint not found</p>
        <Link to="/student/my-complaints" className="text-blue-600 hover:underline">
          Back to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <Link to="/student/my-complaints" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to My Complaints
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{complaint.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Department</dt>
                <dd className="font-medium">{complaint.assignedDepartment || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Assigned To</dt>
                <dd className="font-medium">{complaint.assignedTo?.name || "—"}</dd>
              </div>
              {complaint.resolutionDetails && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Resolution Details</dt>
                  <dd className="font-medium mt-1">{complaint.resolutionDetails}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-3">Attachments</h2>
              <div className="flex flex-wrap gap-3">
                {complaint.attachments.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-50 border rounded-lg text-sm text-blue-600 hover:bg-gray-100"
                  >
                    {a.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Timeline */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>
            {updates.length === 0 ? (
              <p className="text-gray-500 text-sm">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        u.actorRole === "admin" ? "bg-blue-500" : "bg-green-500"
                      }`} />
                      <div className="w-px flex-1 bg-gray-200" />
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{u.actor?.name || "System"}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(u.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {u.previousStatus && u.newStatus && u.previousStatus !== u.newStatus && (
                        <p className="text-sm text-gray-600 mt-1">
                          <StatusBadge status={u.previousStatus} /> → <StatusBadge status={u.newStatus} />
                        </p>
                      )}
                      {u.comment && (
                        <p className="text-sm text-gray-700 mt-1">{u.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
