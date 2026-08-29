import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge/PriorityBadge";

const STATUSES = ["submitted", "under_review", "assigned", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Form states
  const [assignForm, setAssignForm] = useState({ assignedDepartment: "", assignedTo: "" });
  const [statusForm, setStatusForm] = useState({ status: "", comment: "" });
  const [priorityForm, setPriorityForm] = useState({ priority: "" });
  const [resolveForm, setResolveForm] = useState({ resolutionDetails: "" });
  const [submitting, setSubmitting] = useState(null);

  const fetchComplaint = async () => {
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setUpdates(data.updates);
      setAssignForm({
        assignedDepartment: data.complaint.assignedDepartment || "",
        assignedTo: data.complaint.assignedTo?._id || "",
      });
      setPriorityForm({ priority: data.complaint.priority });
    } catch (err) {
      toast.error("Failed to load complaint");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data);
    } catch {}
  };

  useEffect(() => {
    fetchComplaint();
    fetchDepartments();
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting("assign");
    try {
      await api.patch(`/complaints/${id}/assign`, assignForm);
      toast.success("Complaint assigned");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign");
    } finally {
      setSubmitting(null);
    }
  };

  const handleStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) {
      toast.error("Select a status");
      return;
    }
    setSubmitting("status");
    try {
      await api.patch(`/complaints/${id}/status`, statusForm);
      toast.success("Status updated");
      setStatusForm({ status: "", comment: "" });
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setSubmitting(null);
    }
  };

  const handlePriority = async (e) => {
    e.preventDefault();
    setSubmitting("priority");
    try {
      await api.patch(`/complaints/${id}/priority`, priorityForm);
      toast.success("Priority updated");
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update priority");
    } finally {
      setSubmitting(null);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolveForm.resolutionDetails.trim()) {
      toast.error("Resolution details are required");
      return;
    }
    setSubmitting("resolve");
    try {
      await api.post(`/complaints/${id}/resolve`, resolveForm);
      toast.success("Complaint resolved");
      setResolveForm({ resolutionDetails: "" });
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <p className="text-gray-500">Complaint not found</p>
        <Link to="/admin/complaints" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link to="/admin/complaints" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to complaints
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            ID: {complaint._id} &middot; Created {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
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
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{complaint.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium">{complaint.location || "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Submitted By</dt>
                <dd className="font-medium">{complaint.submittedBy?.name || "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{complaint.submittedBy?.email || "—"}</dd>
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
                <div className="col-span-2">
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

          {/* Timeline */}
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

        {/* Admin Controls Sidebar */}
        <div className="space-y-6">
          {/* Assign */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Assign</h2>
            <form onSubmit={handleAssign} className="space-y-3">
              <select
                value={assignForm.assignedDepartment}
                onChange={(e) => setAssignForm({ ...assignForm, assignedDepartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting === "assign"}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {submitting === "assign" ? "Assigning..." : "Assign"}
              </button>
            </form>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Update Status</h2>
            <form onSubmit={handleStatus} className="space-y-3">
              <select
                value={statusForm.status}
                onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
              <textarea
                value={statusForm.comment}
                onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
                placeholder="Add a comment (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting === "status"}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting === "status" ? "Updating..." : "Update Status"}
              </button>
            </form>
          </div>

          {/* Update Priority */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Update Priority</h2>
            <form onSubmit={handlePriority} className="space-y-3">
              <select
                value={priorityForm.priority}
                onChange={(e) => setPriorityForm({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={submitting === "priority"}
                className="w-full py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50 transition"
              >
                {submitting === "priority" ? "Updating..." : "Update Priority"}
              </button>
            </form>
          </div>

          {/* Resolve */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-3">Resolve Complaint</h2>
            <form onSubmit={handleResolve} className="space-y-3">
              <textarea
                value={resolveForm.resolutionDetails}
                onChange={(e) => setResolveForm({ resolutionDetails: e.target.value })}
                placeholder="Describe how the issue was resolved..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={submitting === "resolve"}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition"
              >
                {submitting === "resolve" ? "Resolving..." : "Mark Resolved"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
